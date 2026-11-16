import fs from 'fs';
import path from 'path';

// Load .env manually without external packages
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      val = val.replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { prisma } from '../lib/prisma';
import {
  createEmployeeInvitation,
  verifyInvitationToken,
  syncInvitationDeliveryStatus,
  getVerifiedSenderEmail,
  getAppBaseUrl,
  revokeEmployeeInvitation,
  acceptEmployeeInvitation,
} from '../lib/auth/invitation';
import { generateTotpSecret, verifyTotpCode } from '../lib/auth/totp';
import { generateSync } from 'otplib';
import { PRODUCTION_APP_URL } from '../lib/config/app-url';

async function runInvitationTest() {
  console.log('====================================================');
  console.log('🧪 VARNI HOLIDAYS: PRODUCTION URL & ONBOARDING TEST');
  console.log('====================================================');

  console.log('\n[1] Configuration Check:');
  console.log(`- Verified Sender:    ${getVerifiedSenderEmail()}`);
  console.log(`- App Base URL:       ${getAppBaseUrl()}`);
  console.log(`- Production App URL: ${PRODUCTION_APP_URL}`);
  console.log(`- RESEND_API_KEY:     ${process.env.RESEND_API_KEY ? 'Configured (re_***)' : 'MISSING'}`);

  if (getAppBaseUrl().includes('localhost')) {
    throw new Error(`CRITICAL: getAppBaseUrl() returned localhost: ${getAppBaseUrl()}`);
  }

  // Find admin actor
  const actor = await prisma.user.findFirst({
    where: {
      email: 'admin@varniholidays.com',
    },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!actor) {
    console.error('❌ Could not find admin actor (admin@varniholidays.com)');
    process.exit(1);
  }

  const roleCode = actor.userRoles[0]?.role?.code || 'OWNER';
  console.log(`\n[2] Found Admin Actor: ${actor.fullName} (${actor.email}) [${roleCode}]`);

  const testEmail = 'tirthvirus0exe@gmail.com';
  const testFullName = 'Tirth Patel';
  const testRoleCode = 'OPERATIONS_EXECUTIVE';

  // Revoke any previous invitations
  await prisma.employeeInvitation.updateMany({
    where: { email: testEmail, status: 'PENDING' },
    data: { status: 'REVOKED' },
  });

  console.log(`\n[3] Dispatching Invitation to: ${testEmail} [${testRoleCode}]...`);
  const inviteResult = await createEmployeeInvitation(
    {
      id: actor.id,
      email: actor.email,
      fullName: actor.fullName,
      role: roleCode,
    },
    {
      email: testEmail,
      fullName: testFullName,
      roleCode: testRoleCode,
      ipAddress: '127.0.0.1',
      userAgent: 'IntegrationTestRunner/2.0',
    }
  );

  console.log('\n[4] Invitation Creation Result:');
  console.log(`- Success:         ${inviteResult.success}`);
  console.log(`- Invitation ID:   ${inviteResult.invitationId}`);
  console.log(`- Delivery Status: ${inviteResult.deliveryStatus}`);
  console.log(`- Resend Email ID: ${inviteResult.resendEmailId}`);
  console.log(`- Invite URL:      ${inviteResult.inviteUrl}`);

  if (!inviteResult.success || !inviteResult.inviteUrl) {
    console.error('❌ Invitation creation failed:', inviteResult.error);
    process.exit(1);
  }

  // STRICT ASSERTION: URL must start with https://varni-holidays.vercel.app/admin/onboarding?token=
  if (!inviteResult.inviteUrl.startsWith('https://varni-holidays.vercel.app/admin/onboarding?token=')) {
    console.error(`❌ FAILURE: inviteUrl does not start with https://varni-holidays.vercel.app: ${inviteResult.inviteUrl}`);
    process.exit(1);
  }

  if (inviteResult.inviteUrl.includes('localhost') || inviteResult.inviteUrl.includes('127.0.0.1')) {
    console.error(`❌ FAILURE: inviteUrl contains localhost: ${inviteResult.inviteUrl}`);
    process.exit(1);
  }
  console.log('✅ URL check passed: Strictly pointing to live production https://varni-holidays.vercel.app');

  const urlObj = new URL(inviteResult.inviteUrl);
  const rawToken = urlObj.searchParams.get('token');
  if (!rawToken) {
    console.error('❌ No token found in inviteUrl!');
    process.exit(1);
  }

  console.log('\n[5] Token Validation Tests:');
  // 5a. Valid token
  const verifyResult = await verifyInvitationToken(rawToken);
  console.log(`- Valid token check: ${verifyResult.valid ? 'PASSED' : 'FAILED'}`);
  if (!verifyResult.valid || !verifyResult.invitation) {
    console.error('❌ Token failed validation:', verifyResult.error);
    process.exit(1);
  }

  // 5b. Invalid token rejection
  const invalidResult = await verifyInvitationToken('invalid_token_12345678901234567890');
  console.log(`- Invalid token rejection: ${!invalidResult.valid ? 'PASSED' : 'FAILED'}`);
  if (invalidResult.valid) {
    console.error('❌ Security failure: invalid token was accepted!');
    process.exit(1);
  }

  console.log('\n[6] Resend API Delivery Telemetry Sync:');
  const syncResult = await syncInvitationDeliveryStatus(inviteResult.invitationId!);
  console.log(`- Resend API Status: ${syncResult.deliveryStatus}`);
  console.log(`- Resend Error:      ${syncResult.deliveryError || 'None'}`);

  console.log('\n[7] Simulating Complete Employee Onboarding (Password + TOTP MFA):');
  // Generate TOTP secret & generate valid code
  const totpSecret = generateTotpSecret();
  const totpCode = generateSync({ secret: totpSecret });

  const acceptResult = await acceptEmployeeInvitation({
    token: rawToken,
    password: 'SecureVarniStaffPass2026!@#',
    totpSecret,
    totpCode,
    phone: '+91 63570 50505',
    ipAddress: '127.0.0.1',
    userAgent: 'IntegrationTestRunner/2.0',
  });

  console.log(`- Account Activation Success: ${acceptResult.success}`);
  if (!acceptResult.success) {
    console.error('❌ Acceptance failed:', acceptResult.error);
    process.exit(1);
  }
  console.log(`- User ID Created:            ${acceptResult.user?.id}`);
  console.log(`- Assigned Role:              ${acceptResult.user?.role}`);
  console.log(`- Recovery Codes Generated:   ${acceptResult.recoveryCodes?.length}`);

  console.log('\n[8] Single-Use Token Security Enforcement:');
  const reuseResult = await verifyInvitationToken(rawToken);
  console.log(`- Reused token rejection:    ${!reuseResult.valid ? 'PASSED' : 'FAILED'} (${reuseResult.error})`);
  if (reuseResult.valid) {
    console.error('❌ Security failure: Token was reused after activation!');
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL PRODUCTION INVITATION & ONBOARDING CHECKS PASSED!');
  console.log('====================================================');
  process.exit(0);
}

runInvitationTest().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
