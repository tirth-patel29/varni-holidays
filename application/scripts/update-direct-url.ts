import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const envPath = path.join(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf-8');

const dbUrlMatch = content.match(/^DATABASE_URL=(.*)$/m);
if (!dbUrlMatch) {
  console.error('DATABASE_URL not found');
  process.exit(1);
}

const rawDbUrl = dbUrlMatch[1].trim().replace(/^["']|["']$/g, '');
const directNeonUrl = rawDbUrl.replace('-pooler', '');

// Test connecting with direct Neon URL
const testPrisma = new PrismaClient({
  datasources: {
    db: { url: directNeonUrl }
  }
});

async function testDirect() {
  try {
    const res = await testPrisma.$queryRawUnsafe('SELECT current_database(), current_user;');
    console.log('✓ Neon DIRECT_URL connects successfully!', res);
    await testPrisma.$disconnect();

    // Update DIRECT_URL in .env
    const updatedContent = content.replace(/^DIRECT_URL=.*$/m, `DIRECT_URL="${directNeonUrl}"`);
    fs.writeFileSync(envPath, updatedContent, 'utf-8');
    console.log('✓ Updated DIRECT_URL in .env to Neon direct endpoint.');
  } catch (e: any) {
    console.error('✗ Failed to connect with direct Neon URL:', e.message);
    await testPrisma.$disconnect();
  }
}

testDirect();

