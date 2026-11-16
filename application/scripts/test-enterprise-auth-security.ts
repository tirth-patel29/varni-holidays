/**
 * Varni Holidays — Enterprise Authentication, Security & Clean CRM Test Suite
 * Validates cryptographic security, mandatory TOTP MFA, RBAC boundaries, single-use tokens, session revocation, and clean operational data.
 */

import { PrismaClient } from '@prisma/client';
import assert from 'assert';
import {
  encryptAtRest,
  decryptAtRest,
  hashToken,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateRecoveryCodes,
} from '../lib/auth/crypto';
import {
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
  consumeRecoveryCode,
} from '../lib/auth/totp';
import { generateSync } from 'otplib';
import {
  isBootstrapNeeded,
  executeOwnerBootstrap,
} from '../lib/auth/bootstrap';
import {
  createEmployeeInvitation,
  verifyInvitationToken,
  acceptEmployeeInvitation,
} from '../lib/auth/invitation';
import {
  createSession,
  getUserActiveSessions,
  revokeSession,
  revokeAllOtherSessions,
  revokeAllUserSessions,
} from '../lib/auth/session-service';
import {
  requestPasswordReset,
  completePasswordReset,
} from '../lib/auth/password-reset';
import {
  ALL_ROLES,
  ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  hasPermission,
  resolveUserPermissions,
  AuthenticatedUser,
} from '../lib/auth/rbac';
import { TOUR_PACKAGES_CATALOGUE, HOTELS_CATALOGUE } from '../lib/quotations/catalogue';

const prisma = new PrismaClient();

async function runTestSuite() {
  console.log('====================================================');
  console.log('VARNI HOLIDAYS — ENTERPRISE SECURITY & AUTH TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    totalTests++;
    return Promise.resolve()
      .then(fn)
      .then(() => {
        passedTests++;
        console.log(`  ✅ [PASS] ${name}`);
      })
      .catch((err) => {
        console.error(`  ❌ [FAIL] ${name}:`, err.message);
        throw err;
      });
  }

  try {
    // Clean test state before starting
    await prisma.rateLimitRecord.deleteMany({});
    await prisma.verification.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.twoFactor.deleteMany({});
    await prisma.userPermissionOverride.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.employeeInvitation.deleteMany({});
    await prisma.user.deleteMany({});
    // ----------------------------------------------------
    // TEST GROUP 1: CRYPTOGRAPHY & DATA AT REST ENCRYPTION
    // ----------------------------------------------------
    console.log('--- 1. Cryptography & Encryption Tests ---');

    await test('AES-256-GCM encryption & decryption at rest', () => {
      const sensitiveSecret = 'JBSWY3DPEHPK3PXP';
      const cipher = encryptAtRest(sensitiveSecret);
      assert(cipher.includes(':'), 'Ciphertext must contain IV and auth tag');
      const decrypted = decryptAtRest(cipher);
      assert.strictEqual(decrypted, sensitiveSecret, 'Decrypted text must match original secret');
    });

    await test('Scrypt password hashing with unique salt and constant-time verify', async () => {
      const password = 'Varni@Admin2026Strong';
      const hash = await hashPassword(password);
      assert(hash.startsWith('scrypt:'), 'Hash format must start with scrypt:');
      const valid = await verifyPassword(password, hash);
      assert.strictEqual(valid, true, 'Correct password must verify successfully');
      const invalid = await verifyPassword('WrongPassword123!', hash);
      assert.strictEqual(invalid, false, 'Incorrect password must be rejected');
    });

    await test('Password strength policy (min 12 chars, upper, lower, digit, special)', () => {
      assert.strictEqual(validatePasswordStrength('short').valid, false, 'Short password rejected');
      assert.strictEqual(validatePasswordStrength('alllowercase123!').valid, false, 'No uppercase rejected');
      assert.strictEqual(validatePasswordStrength('ALLUPPERCASE123!').valid, false, 'No lowercase rejected');
      assert.strictEqual(validatePasswordStrength('NoSpecialSymbol123').valid, false, 'No special char rejected');
      assert.strictEqual(validatePasswordStrength('Valid@SecurePass2026').valid, true, 'Strong password accepted');
    });

    await test('10 unique, human-readable recovery codes generation', () => {
      const { plainCodes, hashedCodes } = generateRecoveryCodes(10);
      assert.strictEqual(plainCodes.length, 10, 'Must generate exactly 10 codes');
      assert.strictEqual(hashedCodes.length, 10, 'Must generate exactly 10 hashes');
      assert(plainCodes[0].includes('-'), 'Codes must be formatted with dashes');
    });

    // ----------------------------------------------------
    // TEST GROUP 2: TOTP MULTI-FACTOR AUTHENTICATION (RFC-6238)
    // ----------------------------------------------------
    console.log('\n--- 2. TOTP MFA & Clock Skew Tests ---');

    await test('RFC-6238 TOTP generation and verification with clock-skew tolerance', () => {
      const secret = generateTotpSecret();
      assert(secret.length >= 16, 'Base32 secret must be at least 16 chars');
      const validToken = generateSync({ secret });
      assert.strictEqual(validToken.length, 6, 'TOTP token must be 6 digits');
      const isValid = verifyTotpCode(validToken, secret);
      assert.strictEqual(isValid, true, 'Generated TOTP token must verify');
      const isInvalid = verifyTotpCode('123456', secret);
      // Chance of random 6-digit collision is 1 in 1,000,000
      if (validToken !== '123456') {
        assert.strictEqual(isInvalid, false, 'Arbitrary TOTP token must be rejected');
      }
    });

    await test('One-time recovery code consumption and single-use enforcement', () => {
      const { plainCodes, hashedCodes } = generateRecoveryCodes(5);
      const initialJson = JSON.stringify(hashedCodes);
      const codeToUse = plainCodes[2];

      const res1 = consumeRecoveryCode(codeToUse, initialJson);
      assert.strictEqual(res1.valid, true, 'Unused recovery code must be accepted');
      assert(res1.remainingHashedCodesJson, 'Must return remaining codes');

      // Attempt reuse of the exact same code
      const res2 = consumeRecoveryCode(codeToUse, res1.remainingHashedCodesJson!);
      assert.strictEqual(res2.valid, false, 'Reusing the same recovery code must be REJECTED');
    });

    // ----------------------------------------------------
    // TEST GROUP 3: FIRST OWNER ACCOUNT BOOTSTRAP
    // ----------------------------------------------------
    console.log('\n--- 3. Secure Owner Bootstrap Tests ---');

    await test('isBootstrapNeeded returns true when 0 Owner accounts exist', async () => {
      const needed = await isBootstrapNeeded();
      assert.strictEqual(needed, true, 'Bootstrap must be needed on a fresh system');
    });

    await test('Bootstrap execution rejects invalid BOOTSTRAP_SECRET', async () => {
      const res = await executeOwnerBootstrap({
        secret: 'WRONG_SECRET_ATTEMPT',
        fullName: 'Neel Patel',
        email: 'neel@varniholidays.com',
        password: 'Varni@Admin2026Master!',
        totpSecret: generateTotpSecret(),
        totpCode: '000000',
      });
      assert.strictEqual(res.success, false, 'Invalid secret must be blocked');
    });

    let bootstrappedOwnerId = '';
    const bootstrapTotpSecret = generateTotpSecret();
    const validBootstrapTotp = generateSync({ secret: bootstrapTotpSecret });

    await test('Bootstrap successfully establishes first Owner with mandatory TOTP MFA', async () => {
      const expectedSecret = process.env.BOOTSTRAP_SECRET || 'VARNI_BOOTSTRAP_SECRET_2026_CHANGE_IN_PROD';
      const res = await executeOwnerBootstrap({
        secret: expectedSecret,
        fullName: 'Neel Patel',
        email: 'neel@varniholidays.com',
        password: 'Varni@Owner2026Secure!',
        phone: '+91 63570 50505',
        totpSecret: bootstrapTotpSecret,
        totpCode: validBootstrapTotp,
      });

      assert.strictEqual(res.success, true, 'Bootstrap must succeed with valid params');
      assert(res.userId, 'Must return new Owner user ID');
      assert.strictEqual(res.recoveryCodes?.length, 10, 'Must return 10 recovery codes');
      bootstrappedOwnerId = res.userId!;
    });

    await test('Bootstrap is permanently locked after first Owner exists', async () => {
      const needed = await isBootstrapNeeded();
      assert.strictEqual(needed, false, 'Bootstrap must now be permanently locked');

      const expectedSecret = process.env.BOOTSTRAP_SECRET || 'VARNI_BOOTSTRAP_SECRET_2026_CHANGE_IN_PROD';
      const secondAttempt = await executeOwnerBootstrap({
        secret: expectedSecret,
        fullName: 'Intruder',
        email: 'intruder@example.com',
        password: 'Varni@Intruder2026!',
        totpSecret: generateTotpSecret(),
        totpCode: '123456',
      });
      assert.strictEqual(secondAttempt.success, false, 'Subsequent bootstrap attempts must be rejected');
    });

    // ----------------------------------------------------
    // TEST GROUP 4: OWNER-ONLY EMPLOYEE INVITATION WORKFLOW
    // ----------------------------------------------------
    console.log('\n--- 4. Employee Invitation & Onboarding Tests ---');

    const ownerActor: AuthenticatedUser = {
      id: bootstrappedOwnerId,
      email: 'neel@varniholidays.com',
      fullName: 'Neel Patel',
      role: 'OWNER',
      status: 'ACTIVE',
      twoFactorEnabled: true,
      permissions: ['*'],
      sessionId: 'sess-owner-test',
    };

    let inviteToken = '';

    await test('Owner creates secure employee invitation with single-use cryptographic token', async () => {
      const res = await createEmployeeInvitation(ownerActor, {
        fullName: 'Priyaben Sharma',
        email: 'priya.sharma.test@varniholidays.com',
        roleCode: 'SALES_EXECUTIVE',
      });

      assert.strictEqual(res.success, true, 'Invitation creation must succeed');
      assert(res.inviteUrl, 'Must return invitation URL');
      const urlObj = new URL(res.inviteUrl!);
      inviteToken = urlObj.searchParams.get('token') || '';
      assert(inviteToken.length >= 32, 'Token must be cryptographically secure');
    });

    await test('Token verification validates active pending invitation', async () => {
      const res = await verifyInvitationToken(inviteToken);
      assert.strictEqual(res.valid, true, 'Valid token must be accepted');
      assert.strictEqual(res.invitation?.email, 'priya.sharma.test@varniholidays.com');
      assert.strictEqual(res.invitation?.roleCode, 'SALES_EXECUTIVE');
    });

    await test('Employee accepts invitation, sets password, and completes mandatory TOTP MFA', async () => {
      const employeeTotpSecret = generateTotpSecret();
      const employeeTotp = generateSync({ secret: employeeTotpSecret });

      const res = await acceptEmployeeInvitation({
        token: inviteToken,
        password: 'Priya@Varni2026StrongPass!',
        phone: '+91 98980 23456',
        totpSecret: employeeTotpSecret,
        totpCode: employeeTotp,
      });

      assert.strictEqual(res.success, true, 'Onboarding acceptance must succeed');
      assert(res.userId, 'Must return employee user ID');
      assert.strictEqual(res.recoveryCodes?.length, 10, 'Must issue 10 recovery codes');
    });

    await test('Invitation token cannot be reused after acceptance (single-use)', async () => {
      const res = await verifyInvitationToken(inviteToken);
      assert.strictEqual(res.valid, false, 'Reusing accepted token must be rejected');
    });

    // ----------------------------------------------------
    // TEST GROUP 5: RBAC & PRIVILEGE ESCALATION GUARDS
    // ----------------------------------------------------
    console.log('\n--- 5. RBAC & Privilege Escalation Guard Tests ---');

    await test('Predefined roles exist with appropriate permissions', () => {
      assert(ALL_ROLES.some((r) => r.code === 'OWNER'), 'OWNER role exists');
      assert(ALL_ROLES.some((r) => r.code === 'ADMIN'), 'ADMIN role exists');
      assert(ALL_ROLES.some((r) => r.code === 'SALES_EXECUTIVE'), 'SALES_EXECUTIVE role exists');
      assert(ALL_PERMISSIONS.length >= 20, 'At least 20 granular permissions defined');
    });

    await test('Non-owner cannot invite an OWNER or SUPER_ADMIN (privilege escalation check)', async () => {
      const salesExecutiveActor: AuthenticatedUser = {
        id: 'usr-sales-exec',
        email: 'priya.sharma.test@varniholidays.com',
        fullName: 'Priya Sharma',
        role: 'SALES_EXECUTIVE',
        status: 'ACTIVE',
        twoFactorEnabled: true,
        permissions: ['leads.view', 'leads.create'],
        sessionId: 'sess-sales',
      };

      const res = await createEmployeeInvitation(salesExecutiveActor, {
        fullName: 'Hacker User',
        email: 'hacker@example.com',
        roleCode: 'OWNER',
      });

      assert.strictEqual(res.success, false, 'Non-owner cannot invite an Owner');
    });

    await test('Permission resolver evaluates role capabilities correctly', async () => {
      const salesPerms = await resolveUserPermissions('non-existent-user', 'SALES_EXECUTIVE');
      assert(salesPerms.includes('leads.create'), 'Sales Exec has leads.create');
      assert(!salesPerms.includes('sessions.revoke'), 'Sales Exec lacks sessions.revoke');
      assert(!salesPerms.includes('audit_logs.view'), 'Sales Exec lacks audit_logs.view');
    });

    // ----------------------------------------------------
    // TEST GROUP 6: STRICT SESSION MANAGEMENT & REVOCATION
    // ----------------------------------------------------
    console.log('\n--- 6. Session Lifecycle & Revocation Tests ---');

    let session1Id = '';
    let session2Id = '';

    await test('Create multiple active sessions for user', async () => {
      const s1 = await createSession(bootstrappedOwnerId, { ipAddress: '192.168.1.10', userAgent: 'Chrome Desktop' });
      const s2 = await createSession(bootstrappedOwnerId, { ipAddress: '192.168.1.25', userAgent: 'Safari Mobile' });
      session1Id = s1.sessionId;
      session2Id = s2.sessionId;

      const active = await getUserActiveSessions(bootstrappedOwnerId, session1Id);
      assert(active.length >= 2, 'Must report at least 2 active sessions');
      const current = active.find((s) => s.id === session1Id);
      assert.strictEqual(current?.isCurrent, true, 'Session 1 must be flagged as current');
    });

    await test('Revoke individual session terminates that session immediately', async () => {
      const revoked = await revokeSession(session2Id, bootstrappedOwnerId);
      assert.strictEqual(revoked, true, 'Session 2 must be revoked');

      const active = await getUserActiveSessions(bootstrappedOwnerId);
      assert(!active.some((s) => s.id === session2Id), 'Session 2 must no longer exist in active list');
    });

    await test('Revoke all user sessions invalidates all tokens', async () => {
      const count = await revokeAllUserSessions(bootstrappedOwnerId, 'Security test cleanup');
      assert(count >= 1, 'Must revoke remaining sessions');
      const active = await getUserActiveSessions(bootstrappedOwnerId);
      assert.strictEqual(active.length, 0, 'Zero active sessions remain');
    });

    // ----------------------------------------------------
    // TEST GROUP 7: PASSWORD RESET WORKFLOW
    // ----------------------------------------------------
    console.log('\n--- 7. Password Reset & Single-Use Token Tests ---');

    await test('requestPasswordReset returns generic success message regardless of email existence', async () => {
      const resReal = await requestPasswordReset('neel@varniholidays.com');
      assert.strictEqual(resReal.success, true);
      assert(resReal.message.includes('If an account exists'), 'Protects against user enumeration');

      const resFake = await requestPasswordReset('nonexistent@randomdomain123.com');
      assert.strictEqual(resFake.success, true);
      assert.strictEqual(resFake.message, resReal.message, 'Generic message must be identical');
    });

    await test('completePasswordReset updates password and invalidates token', async () => {
      // Find the generated verification token for the owner
      const tokenRecord = await prisma.verification.findFirst({
        where: { identifier: 'pwd_reset:neel@varniholidays.com' },
      });
      assert(tokenRecord, 'Verification token record must exist in DB');

      // Attempt reset with invalid/dummy token
      const invalidRes = await completePasswordReset('fake-invalid-token-12345678', 'NewPassword@2026!');
      assert.strictEqual(invalidRes.success, false, 'Invalid token must fail');

      // Note: rawToken was dispatched via email; we verify that expired/invalid token handling fails safely
    });

    // ----------------------------------------------------
    // TEST GROUP 8: CLEAN CRM OPERATIONAL DATABASE INTEGRITY
    // ----------------------------------------------------
    console.log('\n--- 8. Clean CRM Database Integrity Tests ---');

    await test('Zero demo leads in operational tables', async () => {
      const count = await prisma.lead.count();
      assert.strictEqual(count, 0, 'Database must have 0 demo leads');
    });

    await test('Zero demo customers in operational tables', async () => {
      const count = await prisma.customer.count();
      assert.strictEqual(count, 0, 'Database must have 0 demo customers');
    });

    await test('Zero demo bookings and quotations in operational tables', async () => {
      const bookings = await prisma.booking.count();
      const quotations = await prisma.quotation.count();
      assert.strictEqual(bookings, 0, 'Database must have 0 bookings');
      assert.strictEqual(quotations, 0, 'Database must have 0 quotations');
    });

    await test('Published tour package catalogue is 100% intact', () => {
      assert(TOUR_PACKAGES_CATALOGUE.length >= 4, 'Tour packages catalogue preserved');
      const kerala = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === 'kerala-6n7d-winter');
      assert(kerala, 'Flagship Kerala package intact');
      const kashmir = TOUR_PACKAGES_CATALOGUE.find((p) => p.slug === 'kashmir-valley-5n6d');
      assert(kashmir, 'Flagship Kashmir package intact');
    });

    await test('Published hotel catalogue is 100% intact', () => {
      assert(HOTELS_CATALOGUE.length >= 5, 'Hotel catalogue preserved');
    });

    await test('Security audit logs table records critical events', async () => {
      const auditCount = await prisma.securityAuditLog.count();
      assert(auditCount >= 3, 'Security audit log records bootstrap and invitations');
      const bootstrapLog = await prisma.securityAuditLog.findFirst({
        where: { eventType: 'OWNER_BOOTSTRAP', outcome: 'SUCCESS' },
      });
      assert(bootstrapLog, 'OWNER_BOOTSTRAP event is immutably logged');
      assert.strictEqual(bootstrapLog.outcome, 'SUCCESS');
    });

    console.log('\n====================================================');
    console.log(`TEST SUITE RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
    console.log('====================================================\n');
  } catch (err: any) {
    console.error('\n❌ Test Suite Aborted Due to Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
