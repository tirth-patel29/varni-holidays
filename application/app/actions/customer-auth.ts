'use server';

import { redirect } from 'next/navigation';
import {
  verifyGoogleToken,
  verifyAppleToken,
  authenticateSocialCustomer,
  revokeCustomerSession,
  getAuthenticatedCustomer,
  CustomerAuthResult,
  AuthenticatedCustomer,
} from '@/lib/auth/customer-auth';

/**
 * Server Action: Authenticate Customer using Google Sign-In
 */
export async function actionGoogleSignIn(idToken: string): Promise<CustomerAuthResult> {
  try {
    const verifiedProfile = await verifyGoogleToken(idToken);
    const result = await authenticateSocialCustomer(verifiedProfile);
    return result;
  } catch (err: any) {
    console.error('[actionGoogleSignIn Action Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to authenticate with Google.',
    };
  }
}

/**
 * Server Action: Authenticate Customer using Apple Sign-In
 */
export async function actionAppleSignIn(
  identityToken: string,
  userProfilePayload?: { name?: { firstName?: string; lastName?: string }; email?: string }
): Promise<CustomerAuthResult> {
  try {
    const verifiedProfile = await verifyAppleToken(identityToken, userProfilePayload);
    const result = await authenticateSocialCustomer(verifiedProfile);
    return result;
  } catch (err: any) {
    console.error('[actionAppleSignIn Action Error]:', err);
    return {
      success: false,
      error: err.message || 'Failed to authenticate with Apple.',
    };
  }
}

/**
 * Server Action: Customer Logout
 */
export async function actionCustomerLogout(): Promise<void> {
  await revokeCustomerSession();
  redirect('/app/welcome');
}

/**
 * Server Action: Get currently logged in customer
 */
export async function actionGetCurrentCustomer(): Promise<AuthenticatedCustomer | null> {
  return await getAuthenticatedCustomer();
}
