import { cookies, headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { generateSecureToken, hashToken } from './crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { OAuth2Client } from 'google-auth-library';

export const CUSTOMER_SESSION_COOKIE = 'varniholidays_customer_session';
export const CUSTOMER_SESSION_EXPIRY_DAYS = 30;

// Official Apple public JWKS remote key set for cryptographic signature verification
const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
// Official Google OAuth2 Client
const GOOGLE_AUTH_CLIENT = new OAuth2Client();

export interface VerifiedSocialProfile {
  provider: 'google' | 'apple';
  providerAccountId: string; // Google sub or Apple sub
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export interface CustomerAuthResult {
  success: boolean;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  error?: string;
}

export interface AuthenticatedCustomer {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  avatarUrl: string | null;
  accounts: {
    provider: string;
    providerAccountId: string;
    email: string | null;
  }[];
}

/**
 * Validate a Google ID Token server-side using Google's official verification library
 */
export async function verifyGoogleToken(idToken: string): Promise<VerifiedSocialProfile> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid Google ID Token.');
  }

  // Fallback simulation is strictly permitted ONLY during automated test runner execution
  const isTestRunner = process.env.NODE_ENV === 'test' || process.env.ALLOW_DEV_TEST_MOCKS === 'true';
  if (isTestRunner && idToken.startsWith('mock_google_token:')) {
    const [, sub, email, name] = idToken.split(':');
    return {
      provider: 'google',
      providerAccountId: sub || 'mock-google-sub-12345',
      email: email || 'traveler.google@varniholidays.com',
      name: name || 'Google Traveler',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };
  }

  const configuredClientId = process.env.GOOGLE_CLIENT_ID;
  if (!configuredClientId) {
    throw new Error('Google Sign-In is not configured yet on this deployment. Missing GOOGLE_CLIENT_ID.');
  }

  try {
    // Official Google token verification validating signature, audience, issuer and expiration
    const ticket = await GOOGLE_AUTH_CLIENT.verifyIdToken({
      idToken,
      audience: configuredClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Google verification ticket returned empty payload.');
    }

    if (!payload.sub) {
      throw new Error('Google token payload missing subject (sub).');
    }

    // Verify issuer is either accounts.google.com or https://accounts.google.com
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      throw new Error(`Invalid Google token issuer: ${payload.iss}`);
    }

    return {
      provider: 'google',
      providerAccountId: payload.sub,
      email: payload.email,
      name: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || undefined,
      avatarUrl: payload.picture,
    };
  } catch (err: any) {
    console.error('[verifyGoogleToken failed]:', err.message);
    throw new Error(err.message || 'Google identity validation failed. Invalid or expired token.');
  }
}

/**
 * Validate an Apple Identity Token server-side using official Apple JWKS signature verification
 * Validates issuer, audience, expiry, signature, and handles first-login user profile payload
 */
export async function verifyAppleToken(
  identityToken: string,
  userProfilePayload?: { name?: { firstName?: string; lastName?: string }; email?: string },
  expectedNonce?: string
): Promise<VerifiedSocialProfile> {
  if (!identityToken || typeof identityToken !== 'string') {
    throw new Error('Missing or invalid Apple Identity Token.');
  }

  // Fallback simulation is strictly permitted ONLY during automated test runner execution
  const isTestRunner = process.env.NODE_ENV === 'test' || process.env.ALLOW_DEV_TEST_MOCKS === 'true';
  if (isTestRunner && identityToken.startsWith('mock_apple_token:')) {
    const [, sub, email, firstName, lastName] = identityToken.split(':');
    const name = [firstName, lastName].filter(Boolean).join(' ') || 'Apple Traveler';
    return {
      provider: 'apple',
      providerAccountId: sub || 'mock-apple-sub-67890',
      email: email || 'traveler.apple@varniholidays.com',
      name,
      avatarUrl: undefined,
    };
  }

  const configuredAppId = process.env.APPLE_CLIENT_ID;
  if (!configuredAppId) {
    throw new Error('Sign in with Apple is not configured yet on this deployment. Missing APPLE_CLIENT_ID.');
  }

  try {
    // Cryptographically verify Apple's JWT signature using Apple's official live JWKS keys
    const { payload } = await jwtVerify(identityToken, APPLE_JWKS, {
      issuer: 'https://appleid.apple.com',
      audience: configuredAppId,
    });

    if (!payload.sub) {
      throw new Error('Apple identity token missing sub identifier.');
    }

    // Optional Nonce validation if provided
    if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
      throw new Error('Apple identity token nonce mismatch.');
    }

    // Apple sends the user's name ONLY on the first authorization
    let fullName: string | undefined;
    if (userProfilePayload?.name) {
      const { firstName, lastName } = userProfilePayload.name;
      fullName = [firstName, lastName].filter(Boolean).join(' ');
    }

    return {
      provider: 'apple',
      providerAccountId: payload.sub,
      email: (payload.email as string) || userProfilePayload?.email,
      name: fullName,
      avatarUrl: undefined,
    };
  } catch (err: any) {
    console.error('[verifyAppleToken failed]:', err.message);
    throw new Error(err.message || 'Apple identity validation failed. Invalid or expired token.');
  }
}

/**
 * Find or create a Customer account from verified social identity
 * Strict Rule: Never automatically link or merge accounts based solely on matching unverified emails.
 */
export async function authenticateSocialCustomer(
  profile: VerifiedSocialProfile
): Promise<CustomerAuthResult> {
  const { provider, providerAccountId, email, name, avatarUrl } = profile;

  try {
    // 1. Check if this exact social account is already linked
    const existingAccount = await prisma.customerAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        customer: true,
      },
    });

    if (existingAccount) {
      const customer = existingAccount.customer;

      if (customer.isDeleted) {
        return { success: false, error: 'Customer account has been disabled. Please contact support.' };
      }

      // Update avatar or name if newly provided
      if (avatarUrl && !customer.avatarUrl) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { avatarUrl },
        });
      }

      // Issue customer session
      await createCustomerSession(customer.id);

      return {
        success: true,
        customerId: customer.id,
        customerName: customer.fullName,
        customerEmail: customer.email || undefined,
      };
    }

    // 2. Account not found: Create a dedicated verified customer record
    // Never auto-merge with unlinked existing records to prevent data contamination
    const sanitizedEmail = email ? email.trim().toLowerCase() : null;
    const finalName = name?.trim() || (provider === 'google' ? 'Google Traveler' : 'Apple Traveler');

    const customer = await prisma.customer.create({
      data: {
        fullName: finalName,
        email: sanitizedEmail,
        normalizedEmail: sanitizedEmail,
        phoneNumber: '',
        normalizedPhone: '',
        avatarUrl: avatarUrl || null,
        customerAccounts: {
          create: {
            provider,
            providerAccountId,
            email: sanitizedEmail,
            name: finalName,
            avatarUrl: avatarUrl || null,
          },
        },
      },
    });

    // Issue customer session
    await createCustomerSession(customer.id);

    return {
      success: true,
      customerId: customer.id,
      customerName: customer.fullName,
      customerEmail: customer.email || undefined,
    };
  } catch (err: any) {
    console.error('[authenticateSocialCustomer Error]:', err);
    return {
      success: false,
      error: err.message || 'An error occurred during customer social authentication.',
    };
  }
}

/**
 * Create a cryptographically secure, hashed customer session and set cookie
 */
export async function createCustomerSession(customerId: string): Promise<string> {
  const rawToken = generateSecureToken(32);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  // Extract client metadata safely
  let ipAddress: string | undefined;
  let userAgent: string | undefined;

  try {
    const headersList = headers();
    ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
    userAgent = headersList.get('user-agent')?.substring(0, 255) || undefined;
  } catch {
    // Headers might not be available in all contexts
  }

  // Store hashed session token in database
  await prisma.customerSession.create({
    data: {
      customerId,
      sessionTokenHash: tokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  // Set dedicated HttpOnly, Secure, SameSite cookie
  try {
    cookies().set({
      name: CUSTOMER_SESSION_COOKIE,
      value: rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: CUSTOMER_SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    });
  } catch (cookieErr) {
    console.warn('[createCustomerSession]: Could not set cookie directly in current context:', cookieErr);
  }

  return rawToken;
}

/**
 * Retrieve and authenticate customer from request session cookie
 */
export async function getAuthenticatedCustomer(): Promise<AuthenticatedCustomer | null> {
  let rawToken: string | undefined;

  try {
    rawToken = cookies().get(CUSTOMER_SESSION_COOKIE)?.value;
  } catch {
    return null;
  }

  if (!rawToken || rawToken.trim().length === 0) {
    return null;
  }

  const tokenHash = hashToken(rawToken);

  const session = await prisma.customerSession.findUnique({
    where: { sessionTokenHash: tokenHash },
    include: {
      customer: {
        include: {
          customerAccounts: {
            select: {
              provider: true,
              providerAccountId: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Verify expiry and soft-deletion
  if (session.expiresAt < new Date() || session.customer.isDeleted) {
    // Purge expired session
    await prisma.customerSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.customer.id,
    fullName: session.customer.fullName,
    email: session.customer.email,
    phoneNumber: session.customer.phoneNumber,
    avatarUrl: session.customer.avatarUrl,
    accounts: session.customer.customerAccounts,
  };
}

/**
 * Revoke customer session (Logout)
 */
export async function revokeCustomerSession(): Promise<boolean> {
  try {
    const rawToken = cookies().get(CUSTOMER_SESSION_COOKIE)?.value;

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.customerSession.deleteMany({
        where: { sessionTokenHash: tokenHash },
      });
    }

    cookies().delete(CUSTOMER_SESSION_COOKIE);
    return true;
  } catch (err) {
    console.error('[revokeCustomerSession Error]:', err);
    return false;
  }
}
