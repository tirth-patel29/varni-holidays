import prisma from '@/lib/prisma';
import { generateSecureToken, hashToken, hashPassword, validatePasswordStrength } from './crypto';
import { recordSecurityEvent } from './audit';
import { revokeAllUserSessions } from './session-service';
import { checkRateLimit, resetRateLimit } from './rate-limit';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const RESET_TOKEN_EXPIRY_MINUTES = 60; // 1 hour

/**
 * Send Password Reset Email via Resend
 */
async function sendPasswordResetEmail(toEmail: string, resetUrl: string, fullName: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  let fromEmail = process.env.RESEND_FROM_EMAIL || 'Varni Holidays <contact@varnitours.com>';
  if (fromEmail.includes('@varniholidays.com')) {
    fromEmail = fromEmail.replace('@varniholidays.com', '@varnitours.com');
  }

  if (!apiKey) {
    console.warn('[Resend API Key Missing]: Skipping real email dispatch; logged reset URL:', resetUrl);
    return true;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="background-color: #153650; padding: 24px 32px; text-align: center;">
          <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0;">VARNI HOLIDAYS</h1>
          <p style="color: #E2E8F0; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1.5px;">Security & Account Recovery</p>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 14px; margin-top: 0; line-height: 1.6;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            We received a request to reset the password for your Varni Holidays administrative account. Click the button below to establish a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #E9B95E; color: #0B0D0F; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 13px; font-weight: 700; display: inline-block;">
              Reset Account Password &rarr;
            </a>
          </div>
          <p style="font-size: 12px; line-height: 1.5; color: #64748B;">
            This single-use link expires in 60 minutes. If you did not request this change, please ignore this email; your existing password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 28px 0;" />
          <p style="font-size: 11px; color: #94A3B8; margin: 0; text-align: center;">
            Varni Holidays Travel Management Desk &bull; Anand, Gujarat
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
        subject: `Password Reset Request — Varni Holidays Admin`,
        html: emailHtml,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('[sendPasswordResetEmail Error]:', err);
    return false;
  }
}

/**
 * Request Password Reset (Generic response protects against account enumeration)
 */
export async function requestPasswordReset(
  email: string,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<{ success: boolean; message: string }> {
  const genericMessage = 'If an account exists with this email address, a secure password-reset link has been sent.';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: true, message: genericMessage };
  }

  const cleanEmail = email.trim().toLowerCase();
  const ip = context?.ipAddress || 'unknown';

  // Rate Limiting: 5 requests per 15 mins per IP
  const rateLimit = await checkRateLimit(`pwd-reset:ip:${ip}`, 5, 15 * 60);
  if (!rateLimit.allowed) {
    return {
      success: false,
      message: `Too many password reset requests from this network. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || user.isDeleted || user.status === 'DISABLED') {
      // Do not reveal account absence
      return { success: true, message: genericMessage };
    }

    // Invalidate existing reset tokens for this user
    await prisma.verification.deleteMany({
      where: { identifier: `pwd_reset:${cleanEmail}` },
    });

    // Generate single-use token and store hash
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.verification.create({
      data: {
        identifier: `pwd_reset:${cleanEmail}`,
        value: tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${APP_URL}/admin/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(cleanEmail, resetUrl, user.fullName);

    await recordSecurityEvent({
      eventType: 'PASSWORD_RESET_REQUEST',
      severity: 'INFO',
      actorEmail: cleanEmail,
      outcome: 'SUCCESS',
      details: `Password reset link dispatched to ${cleanEmail}.`,
      ipAddress: ip,
      userAgent: context?.userAgent,
    });

    return { success: true, message: genericMessage };
  } catch (err) {
    console.error('[requestPasswordReset Error]:', err);
    return { success: true, message: genericMessage };
  }
}

/**
 * Complete Password Reset with Single-Use Token Verification
 */
export async function completePasswordReset(
  token: string,
  newPassword: string,
  context?: { ipAddress?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!token || token.trim().length < 16) {
    return { success: false, error: 'Invalid or missing password reset token.' };
  }

  const pwdCheck = validatePasswordStrength(newPassword);
  if (!pwdCheck.valid) {
    return { success: false, error: pwdCheck.error };
  }

  const tokenHash = hashToken(token);
  const ip = context?.ipAddress || 'unknown';

  try {
    const verification = await prisma.verification.findFirst({
      where: {
        value: tokenHash,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return { success: false, error: 'Password reset link is invalid or has expired.' };
    }

    const email = verification.identifier.replace(/^pwd_reset:/, '');
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate token (single-use enforcement)
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    // Revoke all existing sessions for security
    await revokeAllUserSessions(user.id, 'Password was reset');

    await recordSecurityEvent({
      eventType: 'PASSWORD_RESET_COMPLETED',
      severity: 'INFO',
      actorId: user.id,
      actorEmail: user.email,
      outcome: 'SUCCESS',
      details: `Password successfully reset for ${user.email}. All prior sessions revoked.`,
      ipAddress: ip,
      userAgent: context?.userAgent,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[completePasswordReset Error]:', err);
    return { success: false, error: err.message || 'Failed to complete password reset.' };
  }
}
