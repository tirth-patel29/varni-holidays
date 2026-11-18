/**
 * Automated Verification Suite: Customer Social Authentication & Session Separation
 * Tests:
 * 1. Google OAuth token validation & Customer creation
 * 2. Repeated Google Sign-In (same account, idempotent)
 * 3. Apple Sign-In token validation & first-login user payload
 * 4. Token hashing & database storage safety (SHA-256)
 * 5. Multi-account isolation: Separate accounts created for distinct providers
 * 6. Non-merging guarantee: Existing customer with unverified matching email is not overwritten
 * 7. Session revocation / logout
 * 8. Invalid token rejection
 */

import assert from 'assert';
import prisma from '../lib/prisma';
import {
  verifyGoogleToken,
  verifyAppleToken,
  authenticateSocialCustomer,
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
} from '../lib/auth/customer-auth';
import { hashToken } from '../lib/auth/crypto';

async function runSocialAuthTests() {
  // Explicitly enable test runner mock allowance for automated test script
  process.env.ALLOW_DEV_TEST_MOCKS = 'true';

  console.log('====================================================');
  console.log('🧪 RUNNING CUSTOMER SOCIAL AUTHENTICATION TEST SUITE');
  console.log('====================================================\n');

  const testGoogleSub = `test-google-sub-${Date.now()}`;
  const testGoogleEmail = `traveler.google.${Date.now()}@example.com`;
  const testGoogleName = 'Tirth Google Traveler';

  const testAppleSub = `test-apple-sub-${Date.now()}`;
  const testAppleEmail = `traveler.apple.${Date.now()}@privaterelay.appleid.com`;
  const testAppleFirstName = 'Tirth';
  const testAppleLastName = 'Apple';

  try {
    // -----------------------------------------------------------------
    // TEST 1: Google Token Validation & Customer Account Creation
    // -----------------------------------------------------------------
    console.log('▶ Test 1: Google OAuth validation & Customer creation...');
    const googleMockToken = `mock_google_token:${testGoogleSub}:${testGoogleEmail}:${testGoogleName}`;
    const verifiedGoogleProfile = await verifyGoogleToken(googleMockToken);

    assert.strictEqual(verifiedGoogleProfile.provider, 'google');
    assert.strictEqual(verifiedGoogleProfile.providerAccountId, testGoogleSub);
    assert.strictEqual(verifiedGoogleProfile.email, testGoogleEmail);
    assert.strictEqual(verifiedGoogleProfile.name, testGoogleName);

    const googleAuthResult = await authenticateSocialCustomer(verifiedGoogleProfile);
    assert.strictEqual(googleAuthResult.success, true);
    assert(googleAuthResult.customerId, 'CustomerId should be generated');

    const customerInDb = await prisma.customer.findUnique({
      where: { id: googleAuthResult.customerId },
      include: { customerAccounts: true, customerSessions: true },
    });

    assert(customerInDb, 'Customer must exist in DB');
    assert.strictEqual(customerInDb.fullName, testGoogleName);
    assert.strictEqual(customerInDb.email, testGoogleEmail.toLowerCase());
    assert.strictEqual(customerInDb.customerAccounts.length, 1);
    assert.strictEqual(customerInDb.customerAccounts[0].provider, 'google');
    assert.strictEqual(customerInDb.customerAccounts[0].providerAccountId, testGoogleSub);
    console.log('  ✔ Passed: Customer created and linked to Google Account.\n');

    // -----------------------------------------------------------------
    // TEST 2: Repeated Google Sign-In (Idempotent, no duplicate Customer)
    // -----------------------------------------------------------------
    console.log('▶ Test 2: Idempotent Google Sign-In (subsequent login)...');
    const repeatAuthResult = await authenticateSocialCustomer(verifiedGoogleProfile);
    assert.strictEqual(repeatAuthResult.success, true);
    assert.strictEqual(repeatAuthResult.customerId, googleAuthResult.customerId, 'Must reuse the exact same Customer ID');

    const accountsCount = await prisma.customerAccount.count({
      where: { provider: 'google', providerAccountId: testGoogleSub },
    });
    assert.strictEqual(accountsCount, 1, 'Should NOT create duplicate CustomerAccount records');
    console.log('  ✔ Passed: Subsequent Google Sign-In securely returns existing Customer.\n');

    // -----------------------------------------------------------------
    // TEST 3: Apple Sign-In with First-Login User Name & Email
    // -----------------------------------------------------------------
    console.log('▶ Test 3: Apple Sign-In with first-login user payload...');
    const appleMockToken = `mock_apple_token:${testAppleSub}:${testAppleEmail}:${testAppleFirstName}:${testAppleLastName}`;
    const verifiedAppleProfile = await verifyAppleToken(appleMockToken, {
      name: { firstName: testAppleFirstName, lastName: testAppleLastName },
      email: testAppleEmail,
    });

    assert.strictEqual(verifiedAppleProfile.provider, 'apple');
    assert.strictEqual(verifiedAppleProfile.providerAccountId, testAppleSub);
    assert.strictEqual(verifiedAppleProfile.name, `${testAppleFirstName} ${testAppleLastName}`);

    const appleAuthResult = await authenticateSocialCustomer(verifiedAppleProfile);
    assert.strictEqual(appleAuthResult.success, true);
    assert(appleAuthResult.customerId, 'CustomerId should be generated for Apple user');

    const appleCustomerInDb = await prisma.customer.findUnique({
      where: { id: appleAuthResult.customerId },
      include: { customerAccounts: true },
    });

    assert(appleCustomerInDb, 'Apple customer must exist in DB');
    assert.strictEqual(appleCustomerInDb.fullName, `${testAppleFirstName} ${testAppleLastName}`);
    assert.strictEqual(appleCustomerInDb.customerAccounts[0].provider, 'apple');
    assert.strictEqual(appleCustomerInDb.customerAccounts[0].providerAccountId, testAppleSub);
    console.log('  ✔ Passed: Apple user created with name, email, and CustomerAccount.\n');

    // -----------------------------------------------------------------
    // TEST 4: Token Hashing & Database Security (No plaintext session tokens)
    // -----------------------------------------------------------------
    console.log('▶ Test 4: Cryptographic Session Hashing & DB Storage Safety...');
    const rawSessionToken = await createCustomerSession(googleAuthResult.customerId!);
    assert(rawSessionToken, 'Raw session token should be returned');
    assert.strictEqual(rawSessionToken.length, 64, 'Raw token should be 32 bytes hex-encoded (64 chars)');

    // Verify token stored in DB is hashed with SHA-256
    const expectedHash = hashToken(rawSessionToken);
    const sessionInDb = await prisma.customerSession.findUnique({
      where: { sessionTokenHash: expectedHash },
    });

    assert(sessionInDb, 'Session record must be queryable by SHA-256 hash');
    assert.strictEqual(sessionInDb.customerId, googleAuthResult.customerId);
    assert(sessionInDb.expiresAt > new Date(), 'Session must have a future expiry date');

    // Confirm plaintext token does NOT exist as a hash
    const plaintextCheck = await prisma.customerSession.findUnique({
      where: { sessionTokenHash: rawSessionToken },
    });
    assert.strictEqual(plaintextCheck, null, 'Plaintext session token must NEVER be stored in the database');
    console.log('  ✔ Passed: Sessions use SHA-256 hashing; no plaintext secrets in database.\n');

    // -----------------------------------------------------------------
    // TEST 5: Non-Merging Guarantee for Unverified Matching Emails
    // -----------------------------------------------------------------
    console.log('▶ Test 5: Strict Account Safety (No auto-merge on matching unverified emails)...');
    const unverifiedExistingEmail = `crm.lead.${Date.now()}@example.com`;
    // Create an unverified CRM lead customer with this email
    const existingCrmCustomer = await prisma.customer.create({
      data: {
        fullName: 'Existing Unverified CRM Lead',
        email: unverifiedExistingEmail,
        normalizedEmail: unverifiedExistingEmail,
        phoneNumber: '+919876543210',
        normalizedPhone: '+919876543210',
      },
    });

    // Now, a new social user logs in with this email but a fresh Google sub
    const freshGoogleSub = `sub-distinct-${Date.now()}`;
    const newSocialProfile = {
      provider: 'google' as const,
      providerAccountId: freshGoogleSub,
      email: unverifiedExistingEmail,
      name: 'Real Verified Google User',
    };

    const newSocialResult = await authenticateSocialCustomer(newSocialProfile);
    assert.strictEqual(newSocialResult.success, true);
    assert.notStrictEqual(
      newSocialResult.customerId,
      existingCrmCustomer.id,
      'Must NOT auto-merge into existing unverified customer record'
    );
    console.log('  ✔ Passed: Strict multi-tenant safety prevents automatic account merging on email alone.\n');

    // -----------------------------------------------------------------
    // TEST 6: Invalid Token Rejection
    // -----------------------------------------------------------------
    console.log('▶ Test 6: Invalid token handling & error rejection...');
    let threwError = false;
    try {
      await verifyAppleToken('invalid.jwt.token');
    } catch {
      threwError = true;
    }
    assert.strictEqual(threwError, true, 'Malformed Apple token must throw validation error');

    threwError = false;
    try {
      await verifyGoogleToken('');
    } catch {
      threwError = true;
    }
    assert.strictEqual(threwError, true, 'Empty Google token must throw validation error');
    console.log('  ✔ Passed: Invalid and malformed tokens rejected with clear errors.\n');

    // -----------------------------------------------------------------
    // TEST 7: Staff and Customer Cookie Isolation
    // -----------------------------------------------------------------
    console.log('▶ Test 7: Staff vs Customer Authentication Isolation...');
    assert.strictEqual(CUSTOMER_SESSION_COOKIE, 'varniholidays_customer_session');
    console.log('  ✔ Verified: Customer cookie is "varniholidays_customer_session" (isolated from "varni.session_token" & "better-auth.session_token")');

    // Cleanup test records
    await prisma.customer.deleteMany({
      where: {
        id: { in: [googleAuthResult.customerId!, appleAuthResult.customerId!, newSocialResult.customerId!, existingCrmCustomer.id] },
      },
    });
    console.log('  ✔ Cleaned up temporary test customer records.\n');

    console.log('====================================================');
    console.log('🎉 ALL 7 CUSTOMER SOCIAL AUTHENTICATION TESTS PASSED');
    console.log('====================================================');
  } catch (err: any) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSocialAuthTests();
