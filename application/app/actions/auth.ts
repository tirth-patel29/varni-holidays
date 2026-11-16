'use server';

import { cookies, headers } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  hashToken,
  verifyPassword,
  validatePasswordStrength,
  encryptAtRest,
  decryptAtRest,
  generateRecoveryCodes,
  hashPassword,
} from '@/lib/auth/crypto';
import {
  generateTotpSecret,
  generateTotpUri,
  generateQrCodeDataUrl,
  verifyTotpCode,
  consumeRecoveryCode,
} from '@/lib/auth/totp';
import {
  requireAuth,
  requirePermission,
  requireRole,
  getSessionUser,
  ALL_ROLES,
  ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  RoleCode,
  PermissionCode,
} from '@/lib/auth/rbac';
import { recordSecurityEvent } from '@/lib/auth/audit';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getUserActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  revokeAllUserSessions,
} from '@/lib/auth/session-service';
import {
  isBootstrapNeeded,
  executeOwnerBootstrap,
  BootstrapOwnerInput,
} from '@/lib/auth/bootstrap';
import {
  createEmployeeInvitation,
  verifyInvitationToken,
  acceptEmployeeInvitation,
  InviteEmployeeInput,
  AcceptInvitationInput,
} from '@/lib/auth/invitation';
import {
  requestPasswordReset,
  completePasswordReset,
} from '@/lib/auth/password-reset';

const MFA_PENDING_COOKIE = 'varni.mfa_pending';

function getClientContext() {
  const headerList = headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const userAgent = headerList.get('user-agent') || 'unknown';
  return { ipAddress, userAgent };
}

// ====================================================
// 1. LOGIN WITH EMAIL & PASSWORD
// ====================================================
export async function loginWithPasswordAction(formData: { email: string; password: string }) {
  const { email, password } = formData;
  const { ipAddress, userAgent } = getClientContext();
  const genericError = 'Invalid email address or password. Please check your credentials.';

  if (!email || !password) {
    return { success: false, error: genericError };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Rate Limiting: 5 attempts per 15 minutes per IP + Email
  const rateLimitKey = `login:attempt:${cleanEmail}:${ipAddress}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 5, 15 * 60);

  if (!rateLimit.allowed) {
    await recordSecurityEvent({
      eventType: 'RATE_LIMIT_TRIGGERED',
      severity: 'WARNING',
      actorEmail: cleanEmail,
      outcome: 'BLOCKED',
      details: `Login rate limit exceeded for ${cleanEmail} from IP ${ipAddress}. Lockout active for ${rateLimit.retryAfterSeconds}s.`,
      ipAddress,
      userAgent,
    });
    return {
      success: false,
      error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minutes.`,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        twoFactors: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!user || user.isDeleted) {
      await recordSecurityEvent({
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        actorEmail: cleanEmail,
        outcome: 'FAILURE',
        details: 'Login attempt failed: Email not found.',
        ipAddress,
        userAgent,
      });
      return { success: false, error: genericError };
    }

    if (user.status === 'DISABLED') {
      await recordSecurityEvent({
        eventType: 'LOGIN_FAILED',
        severity: 'CRITICAL',
        actorId: user.id,
        actorEmail: user.email,
        outcome: 'BLOCKED',
        details: 'Login blocked: Account has been suspended by administration.',
        ipAddress,
        userAgent,
      });
      return { success: false, error: 'Your account has been suspended. Please contact the Business Owner.' };
    }

    // Verify Password
    const passwordValid = await verifyPassword(password, user.passwordHash || '');
    if (!passwordValid) {
      await recordSecurityEvent({
        eventType: 'LOGIN_FAILED',
        severity: 'WARNING',
        actorId: user.id,
        actorEmail: user.email,
        outcome: 'FAILURE',
        details: 'Login attempt failed: Incorrect password.',
        ipAddress,
        userAgent,
      });
      return { success: false, error: genericError };
    }

    // Password is valid - reset password rate limit
    await resetRateLimit(rateLimitKey);

    // Mandatory TOTP MFA Check
    // All privileged accounts require MFA
    if (user.twoFactorEnabled && user.twoFactors && user.twoFactors.length > 0) {
      const pendingPayload = JSON.stringify({
        userId: user.id,
        email: user.email,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
      const encryptedPending = encryptAtRest(pendingPayload);

      // Set temporary MFA pending cookie
      const cookieStore = cookies();
      cookieStore.set({
        name: MFA_PENDING_COOKIE,
        value: encryptedPending,
        maxAge: 10 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      await recordSecurityEvent({
        eventType: 'MFA_REQUIRED',
        severity: 'INFO',
        actorId: user.id,
        actorEmail: user.email,
        outcome: 'SUCCESS',
        details: 'Password verified. Prompting for mandatory 6-digit TOTP MFA code.',
        ipAddress,
        userAgent,
      });

      return {
        success: true,
        requiresMfa: true,
        email: user.email,
      };
    }

    // If for any legacy reason user has no TOTP, enforce immediate TOTP enrollment
    return {
      success: true,
      requiresMfaSetup: true,
      userId: user.id,
      email: user.email,
    };
  } catch (err: any) {
    console.error('[loginWithPasswordAction Error]:', err);
    return { success: false, error: 'An unexpected authentication error occurred.' };
  }
}

// ====================================================
// 2. VERIFY 6-DIGIT TOTP CODE
// ====================================================
export async function verifyTotpAction(formData: { code: string }) {
  const { code } = formData;
  const { ipAddress, userAgent } = getClientContext();

  const cookieStore = cookies();
  const pendingCookie = cookieStore.get(MFA_PENDING_COOKIE)?.value;

  if (!pendingCookie) {
    return { success: false, error: 'MFA session has expired. Please sign in with your email and password again.' };
  }

  let pendingData: { userId: string; email: string; expiresAt: number };
  try {
    const decrypted = decryptAtRest(pendingCookie);
    pendingData = JSON.parse(decrypted);
    if (Date.now() > pendingData.expiresAt) {
      cookieStore.delete(MFA_PENDING_COOKIE);
      return { success: false, error: 'MFA session timed out. Please sign in again.' };
    }
  } catch {
    cookieStore.delete(MFA_PENDING_COOKIE);
    return { success: false, error: 'Invalid MFA verification token. Please sign in again.' };
  }

  // Rate Limiting: 5 TOTP attempts per 10 minutes
  const rateLimitKey = `mfa:totp:${pendingData.userId}:${ipAddress}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 5, 10 * 60);

  if (!rateLimit.allowed) {
    await recordSecurityEvent({
      eventType: 'RATE_LIMIT_TRIGGERED',
      severity: 'WARNING',
      actorId: pendingData.userId,
      actorEmail: pendingData.email,
      outcome: 'BLOCKED',
      details: `MFA rate limit exceeded. Lockout active for ${rateLimit.retryAfterSeconds}s.`,
      ipAddress,
      userAgent,
    });
    return {
      success: false,
      error: `Too many invalid TOTP attempts. Please wait ${Math.ceil(rateLimit.retryAfterSeconds / 60)} minutes before retrying.`,
    };
  }

  try {
    const twoFactor = await prisma.twoFactor.findFirst({
      where: { userId: pendingData.userId },
    });

    if (!twoFactor) {
      return { success: false, error: 'Two-factor authentication is not enrolled for this account.' };
    }

    if (twoFactor.lockedUntil && new Date(twoFactor.lockedUntil) > new Date()) {
      return {
        success: false,
        error: 'MFA access is temporarily locked due to repeated failures. Use a recovery code or contact the Owner.',
      };
    }

    const decryptedSecret = decryptAtRest(twoFactor.secret);
    const isValid = verifyTotpCode(code, decryptedSecret);

    if (!isValid) {
      const nextFailCount = twoFactor.failedVerificationCount + 1;
      const shouldLock = nextFailCount >= 5;
      const lockedUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.twoFactor.update({
        where: { id: twoFactor.id },
        data: {
          failedVerificationCount: nextFailCount,
          lockedUntil,
        },
      });

      await recordSecurityEvent({
        eventType: 'MFA_VERIFY_FAILED',
        severity: shouldLock ? 'CRITICAL' : 'WARNING',
        actorId: pendingData.userId,
        actorEmail: pendingData.email,
        outcome: 'FAILURE',
        details: `Invalid TOTP code supplied (Attempt ${nextFailCount}/5).${shouldLock ? ' Account MFA locked for 15 minutes.' : ''}`,
        ipAddress,
        userAgent,
      });

      return {
        success: false,
        error: shouldLock
          ? 'Too many failed TOTP attempts. MFA locked for 15 minutes. You may use a recovery code.'
          : 'Invalid 6-digit code. Please verify the time on your authenticator app and try again.',
      };
    }

    // Success! Reset failure count and rate limits
    await prisma.twoFactor.update({
      where: { id: twoFactor.id },
      data: {
        failedVerificationCount: 0,
        lockedUntil: null,
      },
    });
    await resetRateLimit(rateLimitKey);

    // Clear MFA pending cookie
    cookieStore.delete(MFA_PENDING_COOKIE);

    // Create Authenticated Session
    const session = await createSession(pendingData.userId, { ipAddress, userAgent });
    setSessionCookie(session.token, session.expiresAt);

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: pendingData.userId },
      data: { lastLoginAt: new Date() },
    });

    await recordSecurityEvent({
      eventType: 'MFA_VERIFY_SUCCESS',
      severity: 'INFO',
      actorId: pendingData.userId,
      actorEmail: pendingData.email,
      outcome: 'SUCCESS',
      details: 'TOTP MFA verification succeeded. User authenticated.',
      ipAddress,
      userAgent,
    });

    await recordSecurityEvent({
      eventType: 'LOGIN_SUCCESS',
      severity: 'INFO',
      actorId: pendingData.userId,
      actorEmail: pendingData.email,
      outcome: 'SUCCESS',
      details: 'Full administrative login completed with 2-Factor Authentication.',
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      redirectUrl: '/admin',
    };
  } catch (err: any) {
    console.error('[verifyTotpAction Error]:', err);
    return { success: false, error: 'Failed to verify TOTP code.' };
  }
}

// ====================================================
// 3. VERIFY & CONSUME ONE-TIME RECOVERY CODE
// ====================================================
export async function verifyRecoveryCodeAction(formData: { recoveryCode: string }) {
  const { recoveryCode } = formData;
  const { ipAddress, userAgent } = getClientContext();

  const cookieStore = cookies();
  const pendingCookie = cookieStore.get(MFA_PENDING_COOKIE)?.value;

  if (!pendingCookie) {
    return { success: false, error: 'MFA session has expired. Please sign in with email and password first.' };
  }

  let pendingData: { userId: string; email: string };
  try {
    const decrypted = decryptAtRest(pendingCookie);
    pendingData = JSON.parse(decrypted);
  } catch {
    cookieStore.delete(MFA_PENDING_COOKIE);
    return { success: false, error: 'Invalid MFA session. Please sign in again.' };
  }

  try {
    const twoFactor = await prisma.twoFactor.findFirst({
      where: { userId: pendingData.userId },
    });

    if (!twoFactor || !twoFactor.backupCodes) {
      return { success: false, error: 'No recovery codes are registered for this account.' };
    }

    const consumeResult = consumeRecoveryCode(recoveryCode, twoFactor.backupCodes);
    if (!consumeResult.valid || !consumeResult.remainingHashedCodesJson) {
      await recordSecurityEvent({
        eventType: 'MFA_VERIFY_FAILED',
        severity: 'WARNING',
        actorId: pendingData.userId,
        actorEmail: pendingData.email,
        outcome: 'FAILURE',
        details: 'Invalid or already-consumed recovery code entered.',
        ipAddress,
        userAgent,
      });
      return { success: false, error: 'Invalid or already-consumed recovery code.' };
    }

    // Invalidate code by updating stored remaining codes
    await prisma.twoFactor.update({
      where: { id: twoFactor.id },
      data: {
        backupCodes: consumeResult.remainingHashedCodesJson,
        failedVerificationCount: 0,
        lockedUntil: null,
      },
    });

    cookieStore.delete(MFA_PENDING_COOKIE);

    // Create Authenticated Session
    const session = await createSession(pendingData.userId, { ipAddress, userAgent });
    setSessionCookie(session.token, session.expiresAt);

    await recordSecurityEvent({
      eventType: 'RECOVERY_CODE_USED',
      severity: 'WARNING',
      actorId: pendingData.userId,
      actorEmail: pendingData.email,
      outcome: 'SUCCESS',
      details: 'One-time recovery code successfully consumed. Code invalidated.',
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      redirectUrl: '/admin',
    };
  } catch (err: any) {
    console.error('[verifyRecoveryCodeAction Error]:', err);
    return { success: false, error: 'Failed to verify recovery code.' };
  }
}

// ====================================================
// 4. LOGOUT & REVOCATION
// ====================================================
export async function logoutAction() {
  const { ipAddress, userAgent } = getClientContext();
  const user = await getSessionUser();

  if (user && user.sessionId) {
    await prisma.session.deleteMany({
      where: { id: user.sessionId },
    });

    await recordSecurityEvent({
      eventType: 'LOGOUT',
      severity: 'INFO',
      actorId: user.id,
      actorEmail: user.email,
      outcome: 'SUCCESS',
      details: 'User logged out and session token invalidated.',
      ipAddress,
      userAgent,
    });
  }

  clearSessionCookie();
  return { success: true };
}

// ====================================================
// 5. SESSION MANAGEMENT
// ====================================================
export async function getActiveSessionsAction() {
  const user = await requireAuth();
  return await getUserActiveSessions(user.id, user.sessionId);
}

export async function revokeSessionAction(sessionId: string) {
  const user = await requireAuth();
  const success = await revokeSession(sessionId, user.id);
  return { success };
}

export async function revokeAllSessionsAction() {
  const user = await requireAuth();
  const count = await revokeAllOtherSessions(user.id, user.sessionId);
  return { success: true, count };
}

// ====================================================
// 6. PASSWORD RESET
// ====================================================
export async function requestPasswordResetAction(email: string) {
  const context = getClientContext();
  return await requestPasswordReset(email, context);
}

export async function completePasswordResetAction(token: string, newPassword: string) {
  const context = getClientContext();
  return await completePasswordReset(token, newPassword, context);
}

// ====================================================
// 7. OWNER BOOTSTRAP (ONE-TIME INITIAL SETUP)
// ====================================================
export async function checkBootstrapStatusAction() {
  const needed = await isBootstrapNeeded();
  return { bootstrapNeeded: needed };
}

export async function generateBootstrapTotpDataAction(email: string) {
  const secret = generateTotpSecret();
  const uri = generateTotpUri(email.trim().toLowerCase(), secret);
  const qrCodeDataUrl = await generateQrCodeDataUrl(uri);
  return { secret, uri, qrCodeDataUrl };
}

export async function executeBootstrapAction(input: BootstrapOwnerInput) {
  const context = getClientContext();
  return await executeOwnerBootstrap({
    ...input,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });
}

// ====================================================
// 8. EMPLOYEE INVITATION & ONBOARDING
// ====================================================
export async function inviteEmployeeAction(input: InviteEmployeeInput) {
  const user = await requirePermission('employees.invite');
  const context = getClientContext();
  return await createEmployeeInvitation(user, {
    ...input,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });
}

export async function verifyInvitationAction(token: string) {
  return await verifyInvitationToken(token);
}

export async function generateOnboardingTotpDataAction(email: string) {
  const secret = generateTotpSecret();
  const uri = generateTotpUri(email.trim().toLowerCase(), secret);
  const qrCodeDataUrl = await generateQrCodeDataUrl(uri);
  return { secret, uri, qrCodeDataUrl };
}

export async function acceptInvitationAction(input: AcceptInvitationInput) {
  const context = getClientContext();
  return await acceptEmployeeInvitation({
    ...input,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });
}

// ====================================================
// 9. TEAM & ROLE MANAGEMENT ACTIONS
// ====================================================
export async function getEmployeesListAction() {
  await requirePermission('employees.view');

  try {
    const employees = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        userRoles: {
          include: {
            role: true,
          },
        },
        userPermissionOverrides: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingInvitations = await prisma.employeeInvitation.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      employees: employees.map((e) => ({
        id: e.id,
        email: e.email,
        fullName: e.fullName,
        phone: e.phone,
        status: e.status,
        twoFactorEnabled: Boolean(e.twoFactorEnabled),
        lastLoginAt: e.lastLoginAt,
        createdAt: e.createdAt,
        roleCode: e.userRoles?.[0]?.role?.code || 'SALES_EXECUTIVE',
        roleName: e.userRoles?.[0]?.role?.name || 'Senior Travel Specialist',
        permissionOverridesCount: e.userPermissionOverrides?.length || 0,
      })),
      pendingInvitations: pendingInvitations.map((i) => ({
        id: i.id,
        email: i.email,
        fullName: i.fullName,
        roleCode: i.roleCode,
        status: i.status,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      })),
    };
  } catch (err: any) {
    console.error('[getEmployeesListAction Error]:', err);
    return { success: false, employees: [], pendingInvitations: [], error: err.message };
  }
}

export async function updateEmployeeRoleAction(params: {
  targetUserId: string;
  newRoleCode: RoleCode;
  customPermissionOverrides?: Array<{ permissionCode: string; isGranted: boolean }>;
}) {
  const actor = await requirePermission('roles.manage');
  const { targetUserId, newRoleCode, customPermissionOverrides } = params;
  const context = getClientContext();

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser) {
      return { success: false, error: 'Employee not found.' };
    }

    const currentRole = targetUser.userRoles?.[0]?.role?.code;

    // Protection rule: Cannot modify OWNER unless caller is OWNER
    if (currentRole === 'OWNER' && actor.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized: Cannot modify the Business Owner account.' };
    }

    // Protection rule: Only OWNER can promote someone to OWNER or SUPER_ADMIN
    if ((newRoleCode === 'OWNER' || newRoleCode === 'SUPER_ADMIN') && actor.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized: Only the Business Owner can grant Executive roles.' };
    }

    let role = await prisma.role.findUnique({ where: { code: newRoleCode } });
    if (!role) {
      role = await prisma.role.create({
        data: { code: newRoleCode, name: newRoleCode.replace(/_/g, ' '), isSystem: true },
      });
    }

    // Update UserRole
    await prisma.userRole.deleteMany({ where: { userId: targetUserId } });
    await prisma.userRole.create({
      data: {
        userId: targetUserId,
        roleId: role.id,
        assignedBy: actor.id,
      },
    });

    // Update Permission Overrides if supplied
    if (customPermissionOverrides) {
      await prisma.userPermissionOverride.deleteMany({ where: { userId: targetUserId } });
      for (const ov of customPermissionOverrides) {
        let perm = await prisma.permission.findUnique({ where: { code: ov.permissionCode } });
        if (!perm) {
          perm = await prisma.permission.create({
            data: { code: ov.permissionCode, category: 'CUSTOM' },
          });
        }
        await prisma.userPermissionOverride.create({
          data: {
            userId: targetUserId,
            permissionId: perm.id,
            isGranted: ov.isGranted,
            assignedBy: actor.id,
          },
        });
      }
    }

    await recordSecurityEvent({
      eventType: 'ROLE_UPDATED',
      severity: 'WARNING',
      actorId: actor.id,
      actorEmail: actor.email,
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      outcome: 'SUCCESS',
      details: `Role updated from [${currentRole}] to [${newRoleCode}] for ${targetUser.email} by ${actor.fullName}.`,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[updateEmployeeRoleAction Error]:', err);
    return { success: false, error: err.message || 'Failed to update employee role.' };
  }
}

export async function toggleEmployeeStatusAction(targetUserId: string, newStatus: 'ACTIVE' | 'DISABLED') {
  const actor = await requirePermission('employees.suspend');
  const context = getClientContext();

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!targetUser) return { success: false, error: 'Employee not found.' };

    if (targetUser.id === actor.id) {
      return { success: false, error: 'Cannot modify your own account status.' };
    }

    const currentRole = targetUser.userRoles?.[0]?.role?.code;
    if (currentRole === 'OWNER') {
      return { success: false, error: 'Unauthorized: The Business Owner account cannot be suspended.' };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { status: newStatus },
    });

    if (newStatus === 'DISABLED') {
      // Immediately revoke all active sessions for suspended user
      await revokeAllUserSessions(targetUserId, `Account suspended by ${actor.fullName}`);
    }

    await recordSecurityEvent({
      eventType: newStatus === 'DISABLED' ? 'EMPLOYEE_SUSPENDED' : 'EMPLOYEE_ACTIVATED',
      severity: 'WARNING',
      actorId: actor.id,
      actorEmail: actor.email,
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      outcome: 'SUCCESS',
      details: `Staff account status changed to [${newStatus}] for ${targetUser.email} by ${actor.fullName}.`,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[toggleEmployeeStatusAction Error]:', err);
    return { success: false, error: err.message || 'Failed to toggle account status.' };
  }
}

// ====================================================
// 10. SECURITY AUDIT LOGS QUERY ACTION
// ====================================================
export async function getSecurityAuditLogsAction(limit = 100) {
  await requirePermission('audit_logs.view');

  try {
    const logs = await prisma.securityAuditLog.findMany({
      take: Math.min(limit, 200),
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        eventType: l.eventType,
        severity: l.severity,
        actorEmail: l.actorEmail || l.actor?.email || 'System',
        actorName: l.actor?.fullName || l.actorEmail || 'System',
        targetUserEmail: l.targetUserEmail,
        outcome: l.outcome,
        details: l.details,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      })),
    };
  } catch (err: any) {
    console.error('[getSecurityAuditLogsAction Error]:', err);
    return { success: false, logs: [], error: err.message };
  }
}

// ====================================================
// 11. ROLES & PERMISSIONS MATRIX DATA
// ====================================================
export async function getRolesAndPermissionsDataAction() {
  await requirePermission('roles.view');
  return {
    success: true,
    roles: ALL_ROLES,
    permissions: ALL_PERMISSIONS,
    defaultRolePermissions: DEFAULT_ROLE_PERMISSIONS,
  };
}

// ====================================================
// 12. CURRENT AUTHENTICATED USER QUERY
// ====================================================
export async function getCurrentAuthUserAction() {
  const user = await getSessionUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    status: user.status,
    twoFactorEnabled: user.twoFactorEnabled,
    permissions: user.permissions,
    isSuperAdmin: user.role === 'OWNER' || user.role === 'SUPER_ADMIN',
    isAdmin: user.role === 'OWNER' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN',
  };
}
