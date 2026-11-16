/**
 * Centralized Application URL and Domain Configuration for Varni Holidays
 * 
 * STRICT ARCHITECTURE RULE:
 * 1. Production domain is ALWAYS https://varni-holidays.vercel.app.
 * 2. Outbound email workflows (employee invitations, password resets, customer quotes)
 *    must NEVER send localhost or 127.0.0.1 links to recipients. Real users open emails
 *    on smartphones or other networks where localhost is unreachable.
 * 3. Never silently fall back to localhost in production or preview environments.
 */

export const PRODUCTION_APP_URL = 'https://varni-holidays.vercel.app';

/**
 * Validates and normalizes an application URL.
 * Strips trailing slashes and validates format.
 */
export function normalizeAppUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return PRODUCTION_APP_URL;
  }

  let cleaned = rawUrl.trim();
  if (!cleaned) return PRODUCTION_APP_URL;

  // Add protocol if omitted
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');

  try {
    const parsed = new URL(cleaned);
    // Sanity check protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return PRODUCTION_APP_URL;
    }
    return cleaned;
  } catch {
    return PRODUCTION_APP_URL;
  }
}

/**
 * Resolves the active application base URL across environments.
 * 
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL (if configured and not localhost when in production)
 * 2. Vercel System URLs (VERCEL_PROJECT_PRODUCTION_URL, VERCEL_URL)
 * 3. Canonical production domain fallback: https://varni-holidays.vercel.app
 */
export function getAppBaseUrl(): string {
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV === 'production';

  const isPreview = process.env.VERCEL_ENV === 'preview';

  // 1. Check NEXT_PUBLIC_APP_URL
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) {
    const normalized = normalizeAppUrl(envUrl);
    const isLocalhost =
      normalized.includes('localhost') || normalized.includes('127.0.0.1');

    if (isProd && isLocalhost) {
      console.warn(
        `[SECURITY WARNING]: NEXT_PUBLIC_APP_URL points to localhost in production (${normalized}). Overriding with canonical ${PRODUCTION_APP_URL}.`
      );
      return PRODUCTION_APP_URL;
    }

    if (!isLocalhost || !isProd) {
      return normalized;
    }
  }

  // 2. Check Vercel environment flags
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeAppUrl(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  if (isPreview && process.env.VERCEL_URL) {
    return normalizeAppUrl(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.VERCEL_URL) {
    return normalizeAppUrl(`https://${process.env.VERCEL_URL}`);
  }

  // 3. In production, never return localhost
  if (isProd) {
    return PRODUCTION_APP_URL;
  }

  // 4. Local development fallback (only when explicitly non-production and not Vercel)
  return 'http://localhost:3000';
}

/**
 * Resolves the public URL for outbound emails (invitations, password resets).
 * 
 * Critical: Even when developers/admins test locally, emails dispatched through Resend
 * go to real inboxes (like Gmail on mobile). Therefore, outbound action links MUST
 * point to a publicly routable HTTPS domain (https://varni-holidays.vercel.app)
 * unless explicitly overridden for mock testing.
 */
export function getOutboundEmailBaseUrl(): string {
  // Allow explicit override if a public staging URL is provided via NEXT_PUBLIC_APP_URL
  const baseUrl = getAppBaseUrl();

  // If baseUrl contains localhost, it cannot be reached by a recipient's phone/browser
  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    // If not strictly mocked, use the live production domain
    if (process.env.ALLOW_LOCAL_EMAIL_URLS !== 'true') {
      return PRODUCTION_APP_URL;
    }
  }

  return baseUrl;
}

/**
 * Generate absolute, production-grade employee onboarding invitation URL.
 * Output: https://varni-holidays.vercel.app/admin/onboarding?token={TOKEN}
 */
export function getEmployeeInvitationUrl(token: string): string {
  if (!token || typeof token !== 'string') {
    throw new Error('Valid invitation token is required to build invitation URL.');
  }

  const base = getOutboundEmailBaseUrl();
  const cleanBase = base.replace(/\/+$/, '');
  const url = `${cleanBase}/admin/onboarding?token=${encodeURIComponent(token.trim())}`;

  // Strict validation: Reject any localhost in production or preview
  if (process.env.NODE_ENV === 'production' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    throw new Error(`CRITICAL SECURITY FAILURE: Generated localhost invitation URL in production: ${url}`);
  }

  return url;
}

/**
 * Generate absolute, production-grade password reset URL.
 * Output: https://varni-holidays.vercel.app/admin/reset-password?token={TOKEN}
 */
export function getPasswordResetUrl(token: string): string {
  if (!token || typeof token !== 'string') {
    throw new Error('Valid reset token is required to build password reset URL.');
  }

  const base = getOutboundEmailBaseUrl();
  const cleanBase = base.replace(/\/+$/, '');
  return `${cleanBase}/admin/reset-password?token=${encodeURIComponent(token.trim())}`;
}
