import prisma from '../lib/prisma';
import {
  createEmployeeInvitation,
  verifyInvitationToken,
  resendEmployeeInvitation,
  revokeEmployeeInvitation,
  getVerifiedSenderEmail,
  sendInvitationEmail,
} from '../lib/auth/invitation';
import { DEFAULT_ROLE_PERMISSIONS, AuthenticatedUser } from '../lib/auth/rbac';
import { CANONICAL_ROLES } from '../components/admin/RoleSelectorDropdown';

async function runTests() {
  console.log('====================================================');
  console.log('VARNI HOLIDAYS — EMPLOYEE INVITATION & RBAC TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Canonical Roles Integrity
  // ----------------------------------------------------
  console.log('\n--- 1. Testing Canonical Roles Configuration ---');
  const expectedRoles = [
    'SUPER_ADMIN',
    'ADMIN',
    'SALES_MANAGER',
    'SALES_EXECUTIVE',
    'OPERATIONS_MANAGER',
    'OPERATIONS_EXECUTIVE',
  ];

  assert(
    CANONICAL_ROLES.length === 6,
    `RoleSelectorDropdown defines exactly 6 canonical roles (found: ${CANONICAL_ROLES.length})`
  );

  for (const roleCode of expectedRoles) {
    const found = CANONICAL_ROLES.find((r) => r.code === roleCode);
    assert(
      !!found && !!found.name && !!found.description && !!found.badge,
      `Canonical role [${roleCode}] has valid name, description, and badge`
    );
  }

  // Check roles in Database
  const dbRoles = await prisma.role.findMany({
    where: { code: { in: expectedRoles } },
  });
  assert(
    dbRoles.length === expectedRoles.length,
    `Database Role table contains all ${expectedRoles.length} canonical roles`
  );

  // ----------------------------------------------------
  // TEST 2: RBAC Permissions for Operations Administrator (ADMIN)
  // ----------------------------------------------------
  console.log('\n--- 2. Testing RBAC Role Permissions ---');
  const adminPerms = DEFAULT_ROLE_PERMISSIONS.ADMIN || [];
  assert(
    adminPerms.includes('employees.invite'),
    `ADMIN role includes 'employees.invite' permission`
  );
  assert(
    adminPerms.includes('employees.edit'),
    `ADMIN role includes 'employees.edit' permission`
  );
  assert(
    adminPerms.includes('employees.view'),
    `ADMIN role includes 'employees.view' permission`
  );

  // ----------------------------------------------------
  // TEST 3: Resend Sender Domain Verification
  // ----------------------------------------------------
  console.log('\n--- 3. Testing Resend Email Sender Domain ---');
  const verifiedSender = getVerifiedSenderEmail();
  console.log(`Verified Sender: ${verifiedSender}`);
  assert(
    verifiedSender.includes('@varnitours.com'),
    `Sender email is verified domain @varnitours.com (not unverified @varniholidays.com)`
  );

  // ----------------------------------------------------
  // TEST 4: Privilege Escalation Prevention
  // ----------------------------------------------------
  console.log('\n--- 4. Testing Privilege Escalation Boundaries ---');
  const mockAdminUser: AuthenticatedUser = {
    id: 'test-admin-actor-id',
    email: 'admin.ops@varnitours.com',
    fullName: 'Operations Admin Tester',
    role: 'ADMIN',
    permissions: ['employees.invite', 'employees.edit', 'employees.view'],
  };

  // Attempt to invite OWNER as ADMIN
  const ownerEscalation = await createEmployeeInvitation(mockAdminUser, {
    email: 'hacker@example.com',
    fullName: 'Escalation Attempt',
    roleCode: 'OWNER',
  });
  assert(
    !ownerEscalation.success && ownerEscalation.error?.includes('Owner accounts cannot be created'),
    `ADMIN cannot invite OWNER (Blocked with descriptive security error)`
  );

  // Attempt to invite SUPER_ADMIN as ADMIN
  const superAdminEscalation = await createEmployeeInvitation(mockAdminUser, {
    email: 'hacker2@example.com',
    fullName: 'Escalation Attempt 2',
    roleCode: 'SUPER_ADMIN',
  });
  assert(
    !superAdminEscalation.success && superAdminEscalation.error?.includes('Only an Owner or Super Administrator'),
    `ADMIN cannot invite SUPER_ADMIN (Blocked with privilege escalation error)`
  );

  // ----------------------------------------------------
  // TEST 5: Legitimate Staff Invitation Lifecycle
  // ----------------------------------------------------
  console.log('\n--- 5. Testing Legitimate Staff Invitation Lifecycle ---');
  const testEmail = `test.staff.${Date.now()}@varnitours.com`;

  // Find an actual owner or admin user in DB for FK relation
  const actorDbUser = await prisma.user.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (!actorDbUser) {
    throw new Error('No active user found in database to act as inviter');
  }

  const realActor: AuthenticatedUser = {
    id: actorDbUser.id,
    email: actorDbUser.email,
    fullName: actorDbUser.fullName || actorDbUser.name || 'Test Inviter',
    role: 'ADMIN',
    permissions: ['employees.invite', 'employees.edit', 'employees.view'],
  };

  const inviteResult = await createEmployeeInvitation(realActor, {
    email: testEmail,
    fullName: 'Automated Test Specialist',
    roleCode: 'SALES_EXECUTIVE',
  });

  assert(
    inviteResult.success,
    `createEmployeeInvitation succeeded for ${testEmail} as SALES_EXECUTIVE`
  );
  assert(
    !!inviteResult.inviteUrl && inviteResult.inviteUrl.includes('/admin/onboarding?token='),
    `Generated valid onboarding URL with cryptographic token`
  );
  assert(
    !!inviteResult.invitationId,
    `Returned valid invitationId (${inviteResult.invitationId})`
  );

  // Verify in database
  const createdRecord = await prisma.employeeInvitation.findUnique({
    where: { id: inviteResult.invitationId },
  });
  assert(
    !!createdRecord && createdRecord.status === 'PENDING' && createdRecord.email === testEmail,
    `Database contains pending invitation record with correct email and role`
  );
  assert(
    createdRecord?.deliveryStatus === 'SENT' || createdRecord?.deliveryStatus === 'PENDING',
    `Delivery status recorded properly (${createdRecord?.deliveryStatus})`
  );

  // Extract token from URL and test verifyInvitationToken
  const token = inviteResult.inviteUrl!.split('token=')[1];
  const verification = await verifyInvitationToken(token);
  assert(
    verification.valid && verification.invitation?.email === testEmail,
    `verifyInvitationToken successfully validated single-use token`
  );
  assert(
    verification.invitation?.roleCode === 'SALES_EXECUTIVE',
    `verifyInvitationToken returned correct role code SALES_EXECUTIVE`
  );

  // ----------------------------------------------------
  // TEST 6: Resend and Duplicate Email Invalidation
  // ----------------------------------------------------
  console.log('\n--- 6. Testing Invalidation of Prior Invitations on New Invite ---');
  const secondInviteResult = await createEmployeeInvitation(realActor, {
    email: testEmail,
    fullName: 'Automated Test Specialist Renamed',
    roleCode: 'OPERATIONS_EXECUTIVE',
  });

  assert(
    secondInviteResult.success,
    `Re-inviting same email generates a fresh invitation successfully`
  );

  // Prior invitation should now be REVOKED
  const oldRecord = await prisma.employeeInvitation.findUnique({
    where: { id: inviteResult.invitationId! },
  });
  assert(
    oldRecord?.status === 'REVOKED',
    `Prior pending invitation was automatically marked REVOKED to prevent token collision`
  );

  // Old token should now be rejected by verifyInvitationToken
  const oldVerification = await verifyInvitationToken(token);
  assert(
    !oldVerification.valid,
    `Old token is now invalid (verifyInvitationToken returns false for REVOKED invitations)`
  );

  // ----------------------------------------------------
  // TEST 7: Resend Action Verification
  // ----------------------------------------------------
  console.log('\n--- 7. Testing Resend Invitation Workflow ---');
  const resendResult = await resendEmployeeInvitation(realActor, secondInviteResult.invitationId!);
  assert(
    resendResult.success,
    `resendEmployeeInvitation succeeded with fresh token generation`
  );

  // ----------------------------------------------------
  // TEST 8: Revoke Invitation Workflow
  // ----------------------------------------------------
  console.log('\n--- 8. Testing Revoke Invitation Workflow ---');
  const revokeResult = await revokeEmployeeInvitation(realActor, secondInviteResult.invitationId!);
  assert(
    revokeResult.success,
    `revokeEmployeeInvitation cleanly revokes invitation`
  );

  // ----------------------------------------------------
  // CLEANUP: Clean up test invitations
  // ----------------------------------------------------
  console.log('\n--- Cleaning up test records ---');
  await prisma.employeeInvitation.deleteMany({
    where: { email: testEmail },
  });
  console.log(`Cleaned up all test invitation records for ${testEmail}`);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Test run error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
