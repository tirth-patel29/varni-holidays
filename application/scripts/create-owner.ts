/**
 * VARNI HOLIDAYS — EMERGENCY OWNER INITIALIZER SCRIPT (CLI ONLY)
 * Usage: npx tsx scripts/create-owner.ts [email] [password] [fullName]
 */

import prisma from '../lib/prisma';
import { hashPassword, encryptAtRest, generateRecoveryCodes } from '../lib/auth/crypto';
import { generateTotpSecret, generateTotpUri } from '../lib/auth/totp';

async function main() {
  const email = (process.argv[2] || 'admin@varniholidays.com').trim().toLowerCase();
  const password = process.argv[3] || 'VarniAdmin@2026!';
  const fullName = process.argv[4] || 'Varni Holidays Admin';

  console.log('==================================================');
  console.log('VARNI HOLIDAYS — CLI OWNER ACCOUNT INITIALIZER');
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

  let superAdminRole = await prisma.role.findUnique({ where: { code: 'SUPER_ADMIN' } });
  if (!superAdminRole) {
    superAdminRole = await prisma.role.create({
      data: {
        code: 'SUPER_ADMIN',
        name: 'Super Administrator',
        description: 'Full organizational authority across all modules.',
        isSystem: true,
      },
    });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await hashPassword(password);
  const totpSecret = generateTotpSecret();
  const totpUri = generateTotpUri(email, totpSecret);
  const encryptedTotpSecret = encryptAtRest(totpSecret);
  const { plainCodes, hashedCodes } = generateRecoveryCodes(10);

  if (existing) {
    console.log(`User ${email} already exists! Refreshing credentials...`);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: fullName,
        fullName,
        passwordHash,
        status: 'ACTIVE',
        twoFactorEnabled: true,
      },
    });

    await prisma.twoFactor.deleteMany({ where: { userId: existing.id } });
    await prisma.twoFactor.create({
      data: {
        userId: existing.id,
        secret: encryptedTotpSecret,
        backupCodes: JSON.stringify(hashedCodes),
        verified: true,
      },
    });

    console.log(`Updated credentials and TOTP for: ${email}`);
  } else {
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        name: fullName,
        phone: '+91 63570 50505',
        passwordHash,
        status: 'ACTIVE',
        emailVerified: true,
        twoFactorEnabled: true,
        userRoles: {
          create: [
            { roleId: ownerRole.id, assignedBy: 'CLI_INITIALIZER' },
            { roleId: superAdminRole.id, assignedBy: 'CLI_INITIALIZER' },
          ],
        },
        twoFactors: {
          create: {
            secret: encryptedTotpSecret,
            backupCodes: JSON.stringify(hashedCodes),
            verified: true,
          },
        },
      },
    });

    // Also link Better Auth Account record
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'credential',
        password: passwordHash,
      },
    });

    console.log(`Created new Owner user: ${email}`);
  }

  console.log(`\n==================================================`);
  console.log(`✅ OWNER CREDENTIALS READY FOR STAFF LOGIN`);
  console.log(`==================================================`);
  console.log(`Portal URL:     https://varni-holidays.vercel.app/admin/login`);
  console.log(`Staff Email:    ${email}`);
  console.log(`Password:       ${password}`);
  console.log(`--------------------------------------------------`);
  console.log(`MFA Setup:`);
  console.log(`  TOTP Manual Key:  ${totpSecret}`);
  console.log(`  TOTP Auth URI:     ${totpUri}`);
  console.log(`--------------------------------------------------`);
  console.log(`Emergency Recovery Codes (Single Use):`);
  plainCodes.forEach((code, i) => console.log(`  ${i + 1}. ${code}`));
  console.log(`==================================================\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create owner account:', err);
  process.exit(1);
});
