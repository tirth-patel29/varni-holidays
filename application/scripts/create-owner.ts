/**
 * VARNI HOLIDAYS — EMERGENCY OWNER INITIALIZER SCRIPT
 * Usage: npx tsx scripts/create-owner.ts [email] [password] [fullName]
 */

import prisma from '../lib/prisma';
import { hashPassword, generateRecoveryCodes } from '../lib/auth/crypto';
import { generateTotpSecret, generateTotpUri } from '../lib/auth/totp';

async function main() {
  const email = (process.argv[2] || 'admin@varniholidays.com').trim().toLowerCase();
  const password = process.argv[3] || 'VarniAdmin@2026!';
  const fullName = process.argv[4] || 'Neel Patel';

  console.log('==================================================');
  console.log('VARNI HOLIDAYS — OWNER ACCOUNT INITIALIZER');
  console.log('==================================================');

  // Ensure OWNER role exists
  let ownerRole = await prisma.role.findUnique({ where: { code: 'OWNER' } });
  if (!ownerRole) {
    ownerRole = await prisma.role.create({
      data: {
        code: 'OWNER',
        name: 'Business Owner & Managing Director',
        description: 'Supreme executive authority across Anand headquarters.',
        isSystem: true,
      },
    });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists! Updating credentials...`);
    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: fullName,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: existing.id,
        },
      },
      create: {
        userId: existing.id,
        accountId: existing.id,
        providerId: 'credential',
        password: passwordHash,
      },
      update: {
        password: passwordHash,
      },
    });
    console.log(`Updated credentials for: ${email}`);
    process.exit(0);
  }

  // Create new user
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: fullName,
      email,
      role: 'OWNER',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Create Account record
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: passwordHash,
    },
  });

  // Assign OWNER role in UserRole
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: ownerRole.id,
    },
  });

  // Generate TOTP Secret
  const totpSecret = generateTotpSecret();
  const totpUri = generateTotpUri(email, totpSecret);
  const recoveryCodes = generateRecoveryCodes(10);

  await prisma.twoFactor.create({
    data: {
      userId: user.id,
      secret: totpSecret,
      backupCodes: JSON.stringify(recoveryCodes),
    },
  });

  console.log(`\n✅ OWNER ACCOUNT CREATED SUCCESSFULLY!`);
  console.log(`--------------------------------------------------`);
  console.log(`Full Name:      ${fullName}`);
  console.log(`Email:          ${email}`);
  console.log(`Password:       ${password}`);
  console.log(`TOTP Secret:    ${totpSecret}`);
  console.log(`TOTP Auth URI:  ${totpUri}`);
  console.log(`--------------------------------------------------`);
  console.log(`Recovery Codes (Single Use):`);
  recoveryCodes.forEach((code, i) => console.log(`  ${i + 1}. ${code}`));
  console.log(`--------------------------------------------------`);
  console.log(`To sign in with Authenticator App:`);
  console.log(`  Add manual key in Google Authenticator: ${totpSecret}`);
  console.log(`==================================================\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create owner account:', err);
  process.exit(1);
});
