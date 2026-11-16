import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { generateSecureToken } from './crypto';
import { recordSecurityEvent } from './audit';

const SESSION_LIFETIME_DAYS = 7;
const COOKIE_NAME = 'varni.session_token';

export interface SessionInfo {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  isCurrent?: boolean;
}

/**
 * Create a new authenticated session in PostgreSQL
 */
export async function createSession(
  userId: string,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<{ token: string; sessionId: string; expiresAt: Date }> {
  const token = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: context?.ipAddress || 'unknown',
      userAgent: context?.userAgent ? context.userAgent.slice(0, 500) : 'unknown',
    },
  });

  return {
    token,
    sessionId: session.id,
    expiresAt,
  };
}

/**
 * Set the secure HTTP-only session cookie
 */
export function setSessionCookie(token: string, expiresAt: Date): void {
  try {
    const cookieStore = cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      expires: expiresAt,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  } catch (err) {
    console.error('[setSessionCookie Error]:', err);
  }
}

/**
 * Clear the session cookie on logout or revocation
 */
export function clearSessionCookie(): void {
  try {
    const cookieStore = cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch (err) {
    console.error('[clearSessionCookie Error]:', err);
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(userId: string, currentSessionId?: string): Promise<SessionInfo[]> {
  if (!prisma || !prisma.session) return [];

  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      token: s.token.slice(0, 8) + '...',
      userId: s.userId,
      expiresAt: s.expiresAt,
      createdAt: s.createdAt,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      isCurrent: s.id === currentSessionId,
    }));
  } catch (err) {
    console.error('[getUserActiveSessions Error]:', err);
    return [];
  }
}

/**
 * Revoke an individual session
 */
export async function revokeSession(sessionId: string, actorUserId: string): Promise<boolean> {
  if (!prisma || !prisma.session) return false;

  try {
    const target = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!target) return false;

    await prisma.session.delete({
      where: { id: sessionId },
    });

    await recordSecurityEvent({
      eventType: 'SESSION_REVOKED',
      severity: 'INFO',
      actorId: actorUserId,
      targetUserId: target.userId,
      outcome: 'SUCCESS',
      details: `Session [${sessionId}] revoked by user [${actorUserId}].`,
    });

    return true;
  } catch (err) {
    console.error('[revokeSession Error]:', err);
    return false;
  }
}

/**
 * Revoke all other active sessions for a user (keep current session active)
 */
export async function revokeAllOtherSessions(userId: string, currentSessionId: string): Promise<number> {
  if (!prisma || !prisma.session) return 0;

  try {
    const res = await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });

    await recordSecurityEvent({
      eventType: 'SESSION_REVOKED',
      severity: 'INFO',
      actorId: userId,
      targetUserId: userId,
      outcome: 'SUCCESS',
      details: `Revoked ${res.count} concurrent sessions for user [${userId}].`,
    });

    return res.count;
  } catch (err) {
    console.error('[revokeAllOtherSessions Error]:', err);
    return 0;
  }
}

/**
 * Revoke all sessions for a user (e.g. account suspended or password changed)
 */
export async function revokeAllUserSessions(userId: string, reason = 'Account security policy'): Promise<number> {
  if (!prisma || !prisma.session) return 0;

  try {
    const res = await prisma.session.deleteMany({
      where: { userId },
    });

    await recordSecurityEvent({
      eventType: 'SESSION_REVOKED',
      severity: 'INFO',
      targetUserId: userId,
      outcome: 'SUCCESS',
      details: `All sessions revoked for user [${userId}]. Reason: ${reason}.`,
    });

    return res.count;
  } catch (err) {
    console.error('[revokeAllUserSessions Error]:', err);
    return 0;
  }
}
