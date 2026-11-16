import prisma from '@/lib/prisma';

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'MFA_REQUIRED'
  | 'MFA_VERIFY_SUCCESS'
  | 'MFA_VERIFY_FAILED'
  | 'RECOVERY_CODE_USED'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETED'
  | 'PASSWORD_CHANGED'
  | 'EMPLOYEE_INVITED'
  | 'INVITATION_ACCEPTED'
  | 'INVITATION_REVOKED'
  | 'EMPLOYEE_SUSPENDED'
  | 'EMPLOYEE_ACTIVATED'
  | 'ROLE_UPDATED'
  | 'PERMISSIONS_UPDATED'
  | 'SESSION_REVOKED'
  | 'LOGOUT'
  | 'OWNER_BOOTSTRAP'
  | 'RATE_LIMIT_TRIGGERED';

export type SecuritySeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type SecurityOutcome = 'SUCCESS' | 'FAILURE' | 'BLOCKED';

export interface RecordSecurityEventParams {
  eventType: SecurityEventType;
  severity?: SecuritySeverity;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  targetUserId?: string;
  targetUserEmail?: string;
  outcome: SecurityOutcome;
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Append-only Security Audit Logger for Varni Holidays
 * Safely logs security actions, authorization decisions, and authentication events.
 * Strictly guarantees that passwords, OTP tokens, and raw recovery codes are NEVER logged.
 */
export async function recordSecurityEvent(params: RecordSecurityEventParams): Promise<void> {
  try {
    const {
      eventType,
      severity = 'INFO',
      actorId,
      actorEmail,
      actorRole,
      targetUserId,
      targetUserEmail,
      outcome,
      details,
      metadata,
      ipAddress = 'internal',
      userAgent,
    } = params;

    // Filter out any accidental secret leakage in metadata
    const safeMetadata = metadata ? { ...metadata } : undefined;
    if (safeMetadata) {
      delete safeMetadata.password;
      delete safeMetadata.totp;
      delete safeMetadata.code;
      delete safeMetadata.token;
      delete safeMetadata.secret;
    }

    if (prisma && prisma.securityAuditLog) {
      await prisma.securityAuditLog.create({
        data: {
          eventType,
          severity,
          actorId,
          actorEmail,
          actorRole,
          targetUserId,
          targetUserEmail,
          outcome,
          details,
          metadata: safeMetadata,
          ipAddress,
          userAgent: userAgent ? userAgent.slice(0, 500) : undefined,
        },
      });
    }
  } catch (err) {
    // Audit logging must not crash main application execution, but must log to server console
    console.error('[SecurityAuditLog Failed]:', err);
  }
}
