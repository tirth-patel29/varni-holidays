import prisma from '@/lib/prisma';
import { generateSecureToken, hashToken, hashPassword, validatePasswordStrength, encryptAtRest, generateRecoveryCodes } from './crypto';
import { verifyTotpCode } from './totp';
import { recordSecurityEvent } from './audit';
import { AuthenticatedUser } from './rbac';
import {
  getAppBaseUrl,
  getEmployeeInvitationUrl,
  PRODUCTION_APP_URL,
} from '@/lib/config/app-url';

export { getAppBaseUrl, getEmployeeInvitationUrl, PRODUCTION_APP_URL };

/**
 * Enterprise Owner-Only Employee Invitation & Onboarding Engine for Varni Holidays
 * Disallows public self-registration. All staff accounts must originate from Owner/Admin invitation.
 */

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

export interface SendEmailDispatchResult {
  success: boolean;
  resendEmailId?: string;
  error?: string;
}

/**
 * Get verified sender email.
 * Resend verified domain is 'varnitours.com' (verified in ap-northeast-1).
 * 'varniholidays.com' domain DNS records are not yet verified in Resend.
 * If RESEND_FROM_EMAIL points to @varniholidays.com, it is sanitized to @varnitours.com.
 */
export function getVerifiedSenderEmail(): string {
  let fromEmail = process.env.RESEND_FROM_EMAIL || 'Varni Holidays <contact@varnitours.com>';
  if (fromEmail.includes('@varniholidays.com')) {
    fromEmail = fromEmail.replace('@varniholidays.com', '@varnitours.com');
  }
  return fromEmail;
}


/**
 * Generate high-conversion, professional HTML email for staff onboarding
 */
function buildInvitationEmailHtml(params: {
  fullName: string;
  inviterName: string;
  roleName: string;
  inviteUrl: string;
  expiresAtFormatted: string;
}): { html: string; text: string } {
  const { fullName, inviterName, roleName, inviteUrl, expiresAtFormatted } = params;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Staff Account Invitation — Varni Holidays</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #172B4D; margin: 0; padding: 36px 16px;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);" border="0" cellspacing="0" cellpadding="0">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #153650; padding: 28px 36px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="background-color: #FFFFFF; border-radius: 8px; padding: 8px 18px; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.15); margin-bottom: 8px;">
                      <img src="https://varni-holidays.vercel.app/logo.webp" alt="Varni Holidays" height="38" style="height: 38px; width: auto; max-width: 170px; display: block; border: 0;" />
                    </div>
                    <p style="color: #CBD5E1; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Enterprise Administrative & Operations Desk</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <p style="font-size: 15px; margin: 0 0 16px 0; color: #172B4D;">Hello <strong>${fullName}</strong>,</p>
              
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
                You have been authorized by <strong>${inviterName}</strong> to join the Varni Holidays internal administrative portal as <strong>${roleName}</strong>.
              </p>

              <!-- Role & Security Card -->
              <table role="presentation" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; margin: 0 0 24px 0;" border="0" cellspacing="0" cellpadding="16">
                <tr>
                  <td>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="4">
                      <tr>
                        <td width="30%" style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Assigned Role:</td>
                        <td style="font-size: 13px; font-weight: 700; color: #153650;">${roleName}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Security Policy:</td>
                        <td style="font-size: 12px; font-weight: 600; color: #168653;">Mandatory TOTP Multi-Factor Authentication</td>
                      </tr>
                      <tr>
                        <td style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700;">Link Validity:</td>
                        <td style="font-size: 12px; font-weight: 600; color: #DC2626;">Expires in 48 hours (${expiresAtFormatted})</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Click the secure button below to set your staff password and scan your Authenticator QR code (Google Authenticator, Microsoft Authenticator, or 1Password):
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 28px 0;">
                    <a href="${inviteUrl}" style="background-color: #153650; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 14px; font-weight: 700; display: inline-block; letter-spacing: 0.3px; border: 1px solid #153650;">
                      Accept Invitation & Activate Account &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link -->
              <p style="font-size: 12px; line-height: 1.5; color: #64748B; margin: 0 0 12px 0;">
                If the button above does not open, copy and paste this secure link directly into your browser:
              </p>
              <div style="background-color: #F1F5F9; border: 1px solid #E2E8F0; padding: 10px 14px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 11px; color: #1E293B; margin-bottom: 24px;">
                <a href="${inviteUrl}" style="color: #24689B; text-decoration: none;">${inviteUrl}</a>
              </div>

              <p style="font-size: 11px; color: #94A3B8; line-height: 1.5; margin: 0;">
                <em>Security Notice: This link contains a single-use cryptographic token. Do not forward or share this email with unauthorized individuals.</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #64748B; margin: 0 0 6px 0; font-weight: 600;">
                Varni Holidays Private Limited • Central Administrative Desk
              </p>
              <p style="font-size: 11px; color: #94A3B8; margin: 0; line-height: 1.4;">
                317, 3rd Floor, Narayan Empire, Anand - Vidyanagar Road, Anand, Gujarat 388120<br>
                Official Helpline & WhatsApp: +91 63570 50505 • Email: contact@varnitours.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
VARNI HOLIDAYS — STAFF ACCOUNT INVITATION
==================================================

Hello ${fullName},

You have been invited by ${inviterName} to join the Varni Holidays Internal Operations Desk as: ${roleName}.

To activate your staff account, set your password, and configure mandatory Authenticator (TOTP) Multi-Factor Authentication, open the following secure link:

${inviteUrl}

Note:
- This link is single-use and expires in 48 hours (${expiresAtFormatted}).
- Do not forward this email to anyone else.

For assistance, contact Anand HQ Desk:
Helpline & WhatsApp: +91 63570 50505
Email: contact@varnitours.com
Address: 317, Narayan Empire, Anand - Vidyanagar Road, Anand, Gujarat
==================================================
  `.trim();

  return { html, text };
}

/**
 * Send Employee Invitation Email via Resend
 */
export async function sendInvitationEmail(params: {
  toEmail: string;
  fullName: string;
  inviterName: string;
  roleName: string;
  inviteUrl: string;
  expiresAt: Date;
}): Promise<SendEmailDispatchResult> {
  const { toEmail, fullName, inviterName, roleName, inviteUrl, expiresAt } = params;
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = getVerifiedSenderEmail();

  if (!apiKey) {
    console.warn('[Resend API Key Missing]: Skipping real email dispatch; inviteUrl:', inviteUrl);
    return { success: true, resendEmailId: 'mock-dev-email-id' };
  }

  const expiresAtFormatted = expiresAt.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });

  // Strict Defense: Outbound emails must never point to localhost
  let safeInviteUrl = inviteUrl;
  if (safeInviteUrl.includes('localhost') || safeInviteUrl.includes('127.0.0.1')) {
    if (process.env.ALLOW_LOCAL_EMAIL_URLS !== 'true') {
      safeInviteUrl = safeInviteUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, PRODUCTION_APP_URL);
    }
  }

  const { html, text } = buildInvitationEmailHtml({
    fullName,
    inviterName,
    roleName,
    inviteUrl: safeInviteUrl,
    expiresAtFormatted,
  });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        reply_to: 'contact@varnitours.com',
        to: [toEmail],
        subject: `Staff Account Invitation — Varni Holidays Operations Desk`,
        html,
        text,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data?.message || `Resend returned HTTP ${res.status}: ${res.statusText}`;
      console.error('[sendInvitationEmail Failed]:', errorMessage, 'from:', fromEmail, 'to:', toEmail);
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      resendEmailId: data.id,
    };
  } catch (err: any) {
    console.error('[sendInvitationEmail Network Error]:', err);
    return {
      success: false,
      error: err.message || 'Network error communicating with Resend API.',
    };
  }
}

/**
 * Query live delivery status from Resend API for a given email ID
 */
export async function fetchResendEmailDeliveryStatus(resendEmailId: string): Promise<{
  status: string; // 'sent', 'delivered', 'bounced', 'complained', 'unknown'
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !resendEmailId || resendEmailId.startsWith('mock-')) {
    return { status: 'sent' };
  }

  try {
    const res = await fetch(`https://api.resend.com/emails/${resendEmailId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      return { status: 'unknown', error: `Resend HTTP ${res.status}` };
    }

    const data = await res.json();
    return {
      status: data.last_event || data.status || 'sent',
    };
  } catch (err: any) {
    return { status: 'unknown', error: err.message };
  }
}

/**
 * Create a new employee invitation (Owner/Authorized Admin only)
 */
export async function createEmployeeInvitation(
  actorUser: AuthenticatedUser,
  input: InviteEmployeeInput
): Promise<{
  success: boolean;
  error?: string;
  invitationId?: string;
  inviteUrl?: string;
  resendEmailId?: string;
  deliveryStatus?: string;
}> {
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

  // Prevent unauthorized privilege escalation
  if (roleCode === 'OWNER') {
    return { success: false, error: 'Owner accounts cannot be created via invitation.' };
  }
  if (roleCode === 'SUPER_ADMIN' && actorUser.role !== 'OWNER' && actorUser.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Only an Owner or Super Administrator can invite a Super Administrator.' };
  }
  if (roleCode === 'ADMIN' && actorUser.role !== 'OWNER' && actorUser.role !== 'SUPER_ADMIN' && actorUser.role !== 'ADMIN') {
    return { success: false, error: 'You do not have permission to invite an Operations Administrator.' };
  }

  try {
    // 2. Check if active user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existingUser && !existingUser.isDeleted && existingUser.status === 'ACTIVE') {
      return { success: false, error: 'An active staff account with this email address already exists.' };
    }

    // 3. Invalidate any existing pending or failed invitations for this email to prevent race conditions
    await prisma.employeeInvitation.updateMany({
      where: {
        email: email.trim().toLowerCase(),
        status: { in: ['PENDING', 'FAILED'] },
      },
      data: { status: 'REVOKED' },
    });

    // 4. Generate cryptographically secure token & hash
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);
    const inviteUrl = getEmployeeInvitationUrl(rawToken);

    // 5. Look up human-readable role name
    const roleRecord = await prisma.role.findUnique({ where: { code: roleCode.trim() } });
    const roleName = roleRecord?.name || roleCode.replace(/_/g, ' ');

    // 6. Send Invitation Email via Resend BEFORE creating/updating active state
    const dispatch = await sendInvitationEmail({
      toEmail: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      inviterName: `${actorUser.fullName} (${actorUser.role.replace(/_/g, ' ')})`,
      roleName,
      inviteUrl,
      expiresAt,
    });

    // 7. Store invitation record with actual Resend dispatch outcome
    const invitation = await prisma.employeeInvitation.create({
      data: {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        roleCode: roleCode.trim(),
        tokenHash,
        status: dispatch.success ? 'PENDING' : 'FAILED',
        deliveryStatus: dispatch.success ? 'SENT' : 'FAILED',
        deliveryError: dispatch.error || null,
        resendEmailId: dispatch.resendEmailId || null,
        lastSentAt: new Date(),
        expiresAt,
        invitedByUserId: actorUser.id,
        customPermissions: customPermissions || [],
      },
    });

    // 8. Audit Log
    await recordSecurityEvent({
      eventType: 'EMPLOYEE_INVITED',
      severity: dispatch.success ? 'INFO' : 'WARNING',
      actorId: actorUser.id,
      actorEmail: actorUser.email,
      actorRole: actorUser.role,
      targetUserEmail: email,
      outcome: dispatch.success ? 'SUCCESS' : 'FAILURE',
      details: dispatch.success
        ? `Employee invitation dispatched to ${fullName} (${email}) as [${roleCode}]. Resend ID: ${dispatch.resendEmailId || 'mock'}`
        : `Employee invitation email failed for ${fullName} (${email}): ${dispatch.error}`,
      ipAddress,
      userAgent,
    });

    if (!dispatch.success) {
      return {
        success: false,
        error: `Invitation recorded, but email delivery failed: ${dispatch.error}. Verify Resend sender domain or copy invite link directly.`,
        invitationId: invitation.id,
        inviteUrl,
        deliveryStatus: 'FAILED',
      };
    }

    return {
      success: true,
      invitationId: invitation.id,
      inviteUrl,
      resendEmailId: dispatch.resendEmailId,
      deliveryStatus: 'SENT',
    };
  } catch (err: any) {
    console.error('[createEmployeeInvitation Error]:', err);
    return { success: false, error: err.message || 'Failed to generate invitation.' };
  }
}

/**
 * Resend an existing employee invitation with a freshly minted token and 48-hr timer
 */
export async function resendEmployeeInvitation(
  actorUser: AuthenticatedUser,
  invitationId: string
): Promise<{ success: boolean; error?: string; resendEmailId?: string; inviteUrl?: string }> {
  try {
    const existing = await prisma.employeeInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!existing) {
      return { success: false, error: 'Invitation not found.' };
    }

    if (existing.status === 'ACCEPTED') {
      return { success: false, error: 'This invitation has already been accepted and activated.' };
    }

    // Generate fresh cryptographic token & reset 48-hr expiry
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);
    const inviteUrl = getEmployeeInvitationUrl(rawToken);

    const roleRecord = await prisma.role.findUnique({ where: { code: existing.roleCode } });
    const roleName = roleRecord?.name || existing.roleCode.replace(/_/g, ' ');

    const dispatch = await sendInvitationEmail({
      toEmail: existing.email,
      fullName: existing.fullName,
      inviterName: `${actorUser.fullName} (${actorUser.role.replace(/_/g, ' ')})`,
      roleName,
      inviteUrl,
      expiresAt,
    });

    await prisma.employeeInvitation.update({
      where: { id: invitationId },
      data: {
        tokenHash,
        expiresAt,
        status: dispatch.success ? 'PENDING' : 'FAILED',
        deliveryStatus: dispatch.success ? 'SENT' : 'FAILED',
        deliveryError: dispatch.error || null,
        resendEmailId: dispatch.resendEmailId || existing.resendEmailId,
        lastSentAt: new Date(),
      },
    });

    await recordSecurityEvent({
      eventType: 'EMPLOYEE_INVITED',
      severity: dispatch.success ? 'INFO' : 'WARNING',
      actorId: actorUser.id,
      actorEmail: actorUser.email,
      actorRole: actorUser.role,
      targetUserEmail: existing.email,
      outcome: dispatch.success ? 'SUCCESS' : 'FAILURE',
      details: `Employee invitation resent to ${existing.fullName} (${existing.email}). Resend ID: ${dispatch.resendEmailId || 'mock'}.`,
    });

    if (!dispatch.success) {
      return {
        success: false,
        error: `Resend email dispatch failed: ${dispatch.error}`,
        inviteUrl,
      };
    }

    return {
      success: true,
      resendEmailId: dispatch.resendEmailId,
      inviteUrl,
    };
  } catch (err: any) {
    console.error('[resendEmployeeInvitation Error]:', err);
    return { success: false, error: err.message || 'Failed to resend invitation.' };
  }
}

/**
 * Revoke an active invitation
 */
export async function revokeEmployeeInvitation(
  actorUser: AuthenticatedUser,
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.employeeInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!existing) {
      return { success: false, error: 'Invitation not found.' };
    }

    if (existing.status === 'ACCEPTED') {
      return { success: false, error: 'Cannot revoke an already accepted invitation.' };
    }

    await prisma.employeeInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'REVOKED',
        deliveryStatus: 'REVOKED',
      },
    });

    await recordSecurityEvent({
      eventType: 'SESSION_REVOKED',
      severity: 'INFO',
      actorId: actorUser.id,
      actorEmail: actorUser.email,
      actorRole: actorUser.role,
      targetUserEmail: existing.email,
      outcome: 'SUCCESS',
      details: `Invitation for ${existing.fullName} (${existing.email}) revoked by ${actorUser.fullName}.`,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[revokeEmployeeInvitation Error]:', err);
    return { success: false, error: err.message || 'Failed to revoke invitation.' };
  }
}

/**
 * Sync live delivery status from Resend API and update database
 */
export async function syncInvitationDeliveryStatus(invitationId: string): Promise<{
  success: boolean;
  deliveryStatus?: string;
  error?: string;
}> {
  try {
    const invitation = await prisma.employeeInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || !invitation.resendEmailId) {
      return { success: false, error: 'Invitation or Resend tracking ID not found.' };
    }

    const { status, error } = await fetchResendEmailDeliveryStatus(invitation.resendEmailId);

    if (error) {
      return { success: false, error };
    }

    let mappedStatus = invitation.deliveryStatus || 'SENT';
    if (status === 'delivered') mappedStatus = 'DELIVERED';
    else if (status === 'bounced') mappedStatus = 'BOUNCED';
    else if (status === 'complained') mappedStatus = 'BOUNCED';
    else if (status === 'sent') mappedStatus = 'SENT';

    await prisma.employeeInvitation.update({
      where: { id: invitationId },
      data: {
        deliveryStatus: mappedStatus,
        deliveryError: status === 'bounced' ? 'Recipient mail server rejected the email' : invitation.deliveryError,
      },
    });

    return { success: true, deliveryStatus: mappedStatus };
  } catch (err: any) {
    return { success: false, error: err.message };
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
      // Mark as EXPIRED in DB
      await prisma.employeeInvitation.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED', deliveryStatus: 'EXPIRED' },
      });
      return { valid: false, error: 'This invitation has expired (valid for 48 hours). Please ask your administrator to resend an invite.' };
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

  // 2. Validate Password Strength (Min 12 characters, mixed case, numbers, special)
  const pwdCheck = validatePasswordStrength(password);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.error };
  }

  // 3. Verify Mandatory TOTP Code
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

    // Also link Better Auth Account record for credentials
    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: 'credential' },
    });
    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: passwordHash },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: 'credential',
          password: passwordHash,
        },
      });
    }

    // 9. Mark invitation as ACCEPTED (Enforces single-use)
    await prisma.employeeInvitation.update({
      where: { id: invite.id },
      data: {
        status: 'ACCEPTED',
        deliveryStatus: 'ACCEPTED',
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
