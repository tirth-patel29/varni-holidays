import prisma from '@/lib/prisma';
import { hashPassword, validatePasswordStrength, encryptAtRest, generateRecoveryCodes } from './crypto';
import { verifyTotpCode } from './totp';
import { recordSecurityEvent } from './audit';

/**
 * Enterprise Secure Owner Bootstrap for Varni Holidays
 * Permitted ONLY ONCE when zero Owner/Super Admin accounts exist.
 * Requires secret server env variable: BOOTSTRAP_SECRET.
 */

export interface BootstrapOwnerInput {
  secret: string;
  fullName: string;
  email: string;
  password: string;
  totpSecret: string;
  totpCode: string;
  phone?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface BootstrapOwnerResult {
  success: boolean;
  error?: string;
  userId?: string;
  recoveryCodes?: string[];
}

/**
 * Check whether bootstrap is currently permitted (i.e. zero Owners exist)
 */
export async function isBootstrapNeeded(): Promise<boolean> {
  if (!prisma || !prisma.user) return false;

  try {
    // Check if any user with role OWNER or SUPER_ADMIN exists
    const ownerRole = await prisma.role.findFirst({
      where: { code: { in: ['OWNER', 'SUPER_ADMIN'] } },
      include: {
        userRoles: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!ownerRole || ownerRole.userRoles.length === 0) {
      // Also check if any User has role field set or exists
      const totalActiveUsers = await prisma.user.count({
        where: {
          status: 'ACTIVE',
          isDeleted: false,
        },
      });
      return totalActiveUsers === 0;
    }

    return false;
  } catch (err) {
    console.error('[isBootstrapNeeded Error]:', err);
    return false;
  }
}

/**
 * Execute the One-Time Owner Bootstrap
 */
export async function executeOwnerBootstrap(input: BootstrapOwnerInput): Promise<BootstrapOwnerResult> {
  const {
    secret,
    fullName,
    email,
    password,
    totpSecret,
    totpCode,
    phone = '+91 63570 50505',
    ipAddress = 'unknown',
    userAgent = 'unknown',
  } = input;

  // 1. Verify BOOTSTRAP_SECRET
  const expectedSecret = process.env.BOOTSTRAP_SECRET || 'VARNI_BOOTSTRAP_SECRET_2026_CHANGE_IN_PROD';
  if (!secret || secret.trim() !== expectedSecret.trim()) {
    await recordSecurityEvent({
      eventType: 'OWNER_BOOTSTRAP',
      severity: 'CRITICAL',
      outcome: 'BLOCKED',
      details: `Bootstrap attempt failed: Invalid bootstrap secret provided for ${email}.`,
      ipAddress,
      userAgent,
    });
    return { success: false, error: 'Invalid bootstrap authorization secret.' };
  }

  // 2. Concurrency Check: Verify bootstrap is actually needed
  const allowed = await isBootstrapNeeded();
  if (!allowed) {
    await recordSecurityEvent({
      eventType: 'OWNER_BOOTSTRAP',
      severity: 'WARNING',
      outcome: 'BLOCKED',
      details: `Bootstrap rejected: An Owner/Admin account is already established.`,
      ipAddress,
      userAgent,
    });
    return { success: false, error: 'Bootstrap is permanently disabled. An active Owner account already exists.' };
  }

  // 3. Validate Inputs
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Full name is required.' };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'A valid email address is required.' };
  }

  const pwdCheck = validatePasswordStrength(password);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.error };
  }

  // 4. Verify TOTP Code
  if (!totpSecret || !totpCode) {
    return { success: false, error: 'TOTP secret and initial 6-digit verification code are required.' };
  }
  const isTotpValid = verifyTotpCode(totpCode, totpSecret);
  if (!isTotpValid) {
    return { success: false, error: 'Invalid 6-digit TOTP code. Please scan the QR code and re-enter.' };
  }

  // 5. Encrypt TOTP Secret & Generate 10 Recovery Codes
  const encryptedTotpSecret = encryptAtRest(totpSecret.trim());
  const { plainCodes, hashedCodes } = generateRecoveryCodes(10);
  const passwordHash = await hashPassword(password);

  try {
    // 6. Ensure default system roles exist in DB
    let ownerRole = await prisma.role.findUnique({ where: { code: 'OWNER' } });
    if (!ownerRole) {
      ownerRole = await prisma.role.create({
        data: {
          code: 'OWNER',
          name: 'Business Owner & Managing Director',
          description: 'Supreme executive authority across Anand headquarters.',
          isSystem: true,
        },
      });
    }

    let superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
    if (!superAdminRole) {
      superAdminRole = await prisma.role.create({
        data: {
          code: 'SUPER_ADMIN',
          name: 'Super Administrator',
          description: 'Full organizational authority across all modules.',
          isSystem: true,
        },
      });
    }

    // 7. Atomically create Owner User, TwoFactor record, and UserRole
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        name: fullName.trim(),
        phone: phone.trim(),
        passwordHash,
        status: 'ACTIVE',
        emailVerified: true,
        twoFactorEnabled: true,
        userRoles: {
          create: [
            { roleId: ownerRole.id, assignedBy: 'SYSTEM_BOOTSTRAP' },
            { roleId: superAdminRole.id, assignedBy: 'SYSTEM_BOOTSTRAP' },
          ],
        },
        twoFactors: {
          create: {
            secret: encryptedTotpSecret,
            backupCodes: JSON.stringify(hashedCodes),
            verified: true,
          },
        },
      },
    });

    // 8. Record audit log
    await recordSecurityEvent({
      eventType: 'OWNER_BOOTSTRAP',
      severity: 'CRITICAL',
      actorId: user.id,
      actorEmail: user.email,
      actorRole: 'OWNER',
      outcome: 'SUCCESS',
      details: `First Owner account successfully established for ${user.fullName} (${user.email}) with mandatory TOTP MFA.`,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      userId: user.id,
      recoveryCodes: plainCodes,
    };
  } catch (err: any) {
    console.error('[executeOwnerBootstrap Exception]:', err);
    return {
      success: false,
      error: err.message || 'Failed to initialize Owner account.',
    };
  }
}
