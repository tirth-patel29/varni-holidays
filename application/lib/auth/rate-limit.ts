import prisma from '@/lib/prisma';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

/**
 * Enterprise Database-Backed Rate Limiter for Varni Holidays
 * Survives serverless cold starts and multi-instance concurrency without in-memory state drift.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    if (!prisma || !prisma.rateLimitRecord) {
      // In emergency fallback where DB is unreachable, fail safe
      return { allowed: true, remaining: maxAttempts, resetAt: expiresAt, retryAfterSeconds: 0 };
    }

    const existing = await prisma.rateLimitRecord.findUnique({
      where: { key },
    });

    if (!existing) {
      await prisma.rateLimitRecord.create({
        data: {
          key,
          count: 1,
          firstAttemptAt: now,
          expiresAt,
        },
      });
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: expiresAt,
        retryAfterSeconds: 0,
      };
    }

    // Check if previous window expired
    if (new Date(existing.expiresAt) < now) {
      await prisma.rateLimitRecord.update({
        where: { key },
        data: {
          count: 1,
          firstAttemptAt: now,
          expiresAt,
        },
      });
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: expiresAt,
        retryAfterSeconds: 0,
      };
    }

    // Window still active
    const nextCount = existing.count + 1;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(existing.expiresAt).getTime() - now.getTime()) / 1000)
    );

    if (nextCount > maxAttempts) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.expiresAt),
        retryAfterSeconds,
      };
    }

    await prisma.rateLimitRecord.update({
      where: { key },
      data: { count: nextCount },
    });

    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - nextCount),
      resetAt: new Date(existing.expiresAt),
      retryAfterSeconds: 0,
    };
  } catch (err) {
    console.error('[RateLimit Check Error]:', err);
    // On unexpected database error, allow request to prevent denial of service, but log alert
    return { allowed: true, remaining: 1, resetAt: expiresAt, retryAfterSeconds: 0 };
  }
}

/**
 * Reset rate limit counter upon successful authentication (e.g. valid password or MFA)
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    if (prisma && prisma.rateLimitRecord) {
      await prisma.rateLimitRecord.deleteMany({
        where: { key },
      });
    }
  } catch (err) {
    console.warn('[RateLimit Reset Warning]:', err);
  }
}
