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
} from '../lib/auth/invitation';

async function runInvitationTest() {
  console.log('====================================================');
  console.log('🧪 VARNI HOLIDAYS: EMPLOYEE INVITATION SYSTEM TEST');
  console.log('====================================================');

  console.log('\n[1] Configuration Check:');
  console.log(`- Verified Sender: ${getVerifiedSenderEmail()}`);
  console.log(`- App Base URL:    ${getAppBaseUrl()}`);
  console.log(`- RESEND_API_KEY:  ${process.env.RESEND_API_KEY ? 'Configured (re_***)' : 'MISSING'}`);

  // Find an admin actor
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
  const testFullName = 'Tirth Test Employee';
  const testRoleCode = 'OPERATIONS_EXECUTIVE';

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
      userAgent: 'IntegrationTestRunner/1.0',
    }
  );

  console.log('\n[4] Invitation Creation Result:');
  console.log(`- Success:         ${inviteResult.success}`);
  console.log(`- Invitation ID:   ${inviteResult.invitationId}`);
  console.log(`- Delivery Status: ${inviteResult.deliveryStatus}`);
  console.log(`- Resend Email ID: ${inviteResult.resendEmailId}`);
  console.log(`- Invite URL:      ${inviteResult.inviteUrl}`);
  if (inviteResult.error) {
    console.error(`- Error:           ${inviteResult.error}`);
  }

  if (!inviteResult.success || !inviteResult.inviteUrl) {
    console.error('❌ Invitation failed!');
    process.exit(1);
  }

  const urlObj = new URL(inviteResult.inviteUrl);
  const rawToken = urlObj.searchParams.get('token');
  if (!rawToken) {
    console.error('❌ No token found in inviteUrl!');
    process.exit(1);
  }

  console.log('\n[5] Verifying Plaintext Token Against Stored Hash:');
  const verifyResult = await verifyInvitationToken(rawToken);
  console.log(`- Verification Valid: ${verifyResult.valid}`);
  if (verifyResult.valid && verifyResult.invitation) {
    console.log(`- Target User:       ${verifyResult.invitation.fullName} (${verifyResult.invitation.email})`);
    console.log(`- Assigned Role:     ${verifyResult.invitation.roleCode}`);
    console.log(`- Expires At:        ${verifyResult.invitation.expiresAt.toISOString()}`);
  } else {
    console.error(`- Verification Error: ${verifyResult.error}`);
    process.exit(1);
  }

  console.log('\n[6] Checking Live Delivery Status via Resend API:');
  const syncResult = await syncInvitationDeliveryStatus(inviteResult.invitationId!);
  console.log(`- Resend API Status:  ${syncResult.deliveryStatus}`);
  console.log(`- Resend Error:       ${syncResult.deliveryError || 'None'}`);

  console.log('\n✅ ALL EMPLOYEE INVITATION SYSTEM CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runInvitationTest().catch((err) => {
  console.error('Unhandled test failure:', err);
  process.exit(1);
});
