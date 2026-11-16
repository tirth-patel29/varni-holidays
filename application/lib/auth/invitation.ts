import prisma from '@/lib/prisma';
import { generateSecureToken, hashToken, hashPassword, validatePasswordStrength, encryptAtRest, generateRecoveryCodes } from './crypto';
import { verifyTotpCode } from './totp';
import { recordSecurityEvent } from './audit';
import { AuthenticatedUser } from './rbac';

/**
 * Enterprise Owner-Only Employee Invitation & Onboarding Engine for Varni Holidays
 * Disallows public self-registration. All staff accounts must originate from Owner invitation.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const INVITATION_EXPIRY_HOURS = 48;

export interface InviteEmployeeInput {
  email: string;
  fullName: string;
  roleCode: string;
  customPermissions?: string[];
  ipAddress?: string;
  userAgent?: string;
}

export interface AcceptInvitationInput {
  token: string;
  password: string;
  totpSecret: string;
  totpCode: string;
  phone?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Send Employee Invitation Email via Resend
 */
async function sendInvitationEmail(toEmail: string, fullName: string, inviteUrl: string, roleName: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Varni Holidays <contact@varnitours.com>';

  if (!apiKey) {
    console.warn('[Resend API Key Missing]: Skipping real email dispatch; logged invite URL:', inviteUrl);
    return true;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Varni Holidays Operations Desk</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #153650; padding: 28px 32px; text-align: center;">
          <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">VARNI HOLIDAYS</h1>
          <p style="color: #E2E8F0; font-size: 11px; margin: 6px 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Internal Operations & Travel Desk</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 14px; margin-top: 0; line-height: 1.6;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            You have been invited by the Varni Holidays administration to join the staff portal as <strong>${roleName}</strong>.
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            To activate your staff account, click the secure link below to set your password and complete mandatory Authenticator (TOTP) Multi-Factor setup. This link is single-use and expires in 48 hours.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteUrl}" style="background-color: #E9B95E; color: #0B0D0F; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 13px; font-weight: 700; display: inline-block; letter-spacing: 0.5px;">
              Activate Staff Account & Setup MFA &rarr;
            </a>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #64748B;">
            If the button above does not work, copy and paste this URL into your browser:<br>
            <a href="${inviteUrl}" style="color: #153650; word-break: break-all;">${inviteUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 28px 0;" />
          <p style="font-size: 11px; color: #94A3B8; margin: 0; text-align: center;">
            317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Anand, Gujarat 388120<br>
            Official WhatsApp: +91 63570 50505
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `Staff Account Invitation — Varni Holidays Operations Desk`,
        html: emailHtml,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[sendInvitationEmail Error]:', err);
    return false;
  }
}

/**
 * Create a new employee invitation (Owner/Authorized Admin only)
 */
export async function createEmployeeInvitation(
  actorUser: AuthenticatedUser,
  input: InviteEmployeeInput
): Promise<{ success: boolean; error?: string; invitationId?: string; inviteUrl?: string }> {
  const { email, fullName, roleCode, customPermissions, ipAddress = 'unknown', userAgent = 'unknown' } = input;

  // 1. Validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!roleCode) {
    return { success: false, error: 'A valid employee role must be selected.' };
  }

  // Prevent unauthorized privilege escalation: only OWNER can invite an ADMIN or OWNER
  if ((roleCode === 'OWNER' || roleCode === 'SUPER_ADMIN') && actorUser.role !== 'OWNER') {
    return { success: false, error: 'Only the Business Owner can invite an Executive Administrator or Owner.' };
  }

  try {
    // 2. Check if active user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existingUser && !existingUser.isDeleted && existingUser.status === 'ACTIVE') {
      return { success: false, error: 'An active staff account with this email address already exists.' };
    }

    // 3. Invalidate any existing pending invitations for this email
    await prisma.employeeInvitation.updateMany({
      where: {
        email: email.trim().toLowerCase(),
        status: 'PENDING',
      },
      data: { status: 'REVOKED' },
    });

    // 4. Generate cryptographically secure token & hash
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);

    // 5. Store invitation record
    const invitation = await prisma.employeeInvitation.create({
      data: {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        roleCode: roleCode.trim(),
        tokenHash,
        status: 'PENDING',
        expiresAt,
        invitedByUserId: actorUser.id,
        customPermissions: customPermissions || [],
      },
    });

    const inviteUrl = `${APP_URL}/admin/onboarding?token=${rawToken}`;

    // 6. Send Invitation Email via Resend
    await sendInvitationEmail(email.trim().toLowerCase(), fullName.trim(), inviteUrl, roleCode);

    // 7. Audit Log
    await recordSecurityEvent({
      eventType: 'EMPLOYEE_INVITED',
      severity: 'INFO',
      actorId: actorUser.id,
      actorEmail: actorUser.email,
      actorRole: actorUser.role,
      targetUserEmail: email,
      outcome: 'SUCCESS',
      details: `Employee invitation created for ${fullName} (${email}) with role [${roleCode}] by ${actorUser.fullName}.`,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      invitationId: invitation.id,
      inviteUrl,
    };
  } catch (err: any) {
    console.error('[createEmployeeInvitation Error]:', err);
    return { success: false, error: err.message || 'Failed to generate invitation.' };
  }
}

/**
 * Verify invitation token validity
 */
export async function verifyInvitationToken(rawToken: string): Promise<{
  valid: boolean;
  error?: string;
  invitation?: {
    id: string;
    email: string;
    fullName: string;
    roleCode: string;
    expiresAt: Date;
  };
}> {
  if (!rawToken || rawToken.trim().length < 16) {
    return { valid: false, error: 'Invalid or missing invitation token.' };
  }

  const tokenHash = hashToken(rawToken);

  try {
    const invite = await prisma.employeeInvitation.findUnique({
      where: { tokenHash },
    });

    if (!invite) {
      return { valid: false, error: 'Invitation link not found or has been revoked.' };
    }

    if (invite.status !== 'PENDING') {
      return { valid: false, error: `This invitation is no longer active (Status: ${invite.status}).` };
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return { valid: false, error: 'This invitation has expired. Please ask your administrator to resend an invite.' };
    }

    return {
      valid: true,
      invitation: {
        id: invite.id,
        email: invite.email,
        fullName: invite.fullName,
        roleCode: invite.roleCode,
        expiresAt: invite.expiresAt,
      },
    };
  } catch (err: any) {
    console.error('[verifyInvitationToken Error]:', err);
    return { valid: false, error: 'Failed to verify invitation token.' };
  }
}

/**
 * Complete Employee Onboarding: Verify Token, Set Password, Enable TOTP, Activate Account
 */
export async function acceptEmployeeInvitation(
  input: AcceptInvitationInput
): Promise<{ success: boolean; error?: string; userId?: string; recoveryCodes?: string[] }> {
  const { token, password, totpSecret, totpCode, phone = '+91 63570 50505', ipAddress = 'unknown', userAgent = 'unknown' } = input;

  // 1. Verify Token
  const verification = await verifyInvitationToken(token);
  if (!verification.valid || !verification.invitation) {
    return { success: false, error: verification.error || 'Invalid invitation.' };
  }

  const invite = verification.invitation;

  // 2. Validate Password
  const pwdCheck = validatePasswordStrength(password);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.error };
  }

  // 3. Verify TOTP Code
  if (!totpSecret || !totpCode) {
    return { success: false, error: 'TOTP secret and verification code are mandatory for account setup.' };
  }
  const isTotpValid = verifyTotpCode(totpCode, totpSecret);
  if (!isTotpValid) {
    return { success: false, error: 'Invalid 6-digit TOTP code. Please scan the QR code and re-enter.' };
  }

  // 4. Encrypt TOTP Secret & Generate 10 Recovery Codes
  const encryptedTotpSecret = encryptAtRest(totpSecret.trim());
  const { plainCodes, hashedCodes } = generateRecoveryCodes(10);
  const passwordHash = await hashPassword(password);

  try {
    // 5. Ensure role exists
    let role = await prisma.role.findUnique({ where: { code: invite.roleCode } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          code: invite.roleCode,
          name: invite.roleCode.replace(/_/g, ' '),
          isSystem: true,
        },
      });
    }

    // 6. Create or update User
    const user = await prisma.user.upsert({
      where: { email: invite.email },
      update: {
        fullName: invite.fullName,
        name: invite.fullName,
        phone,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: true,
        twoFactorEnabled: true,
        isDeleted: false,
      },
      create: {
        email: invite.email,
        fullName: invite.fullName,
        name: invite.fullName,
        phone,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: true,
        twoFactorEnabled: true,
      },
    });

    // 7. Assign UserRole
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id,
        assignedBy: 'INVITATION_ONBOARDING',
      },
    });

    // 8. Create TwoFactor record
    await prisma.twoFactor.deleteMany({ where: { userId: user.id } });
    await prisma.twoFactor.create({
      data: {
        userId: user.id,
        secret: encryptedTotpSecret,
        backupCodes: JSON.stringify(hashedCodes),
        verified: true,
      },
    });

    // 9. Mark invitation as ACCEPTED
    await prisma.employeeInvitation.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    // 10. Audit Log
    await recordSecurityEvent({
      eventType: 'INVITATION_ACCEPTED',
      severity: 'INFO',
      actorId: user.id,
      actorEmail: user.email,
      actorRole: invite.roleCode,
      outcome: 'SUCCESS',
      details: `Employee account activated for ${user.fullName} (${user.email}) with mandatory TOTP MFA.`,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      userId: user.id,
      recoveryCodes: plainCodes,
    };
  } catch (err: any) {
    console.error('[acceptEmployeeInvitation Error]:', err);
    return { success: false, error: err.message || 'Failed to complete onboarding.' };
  }
}
