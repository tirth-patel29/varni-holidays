import { PrismaClient } from '@prisma/client';

async function testPrismaNeon() {
  console.log('Connecting via PrismaClient to Neon DATABASE_URL...');
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRawUnsafe('SELECT current_database(), current_user, version()');
    console.log('✓ Successfully connected to Neon PostgreSQL via Prisma!');
    console.log('Result:', result);
    await prisma.$disconnect();
    return true;
  } catch (err: any) {
    console.error('✗ Connection failed:', err.message);
    await prisma.$disconnect();
    return false;
  }
}

testPrismaNeon();
