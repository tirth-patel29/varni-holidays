import { PrismaClient } from '@prisma/client';

async function listNeonTables() {
  const prisma = new PrismaClient();
  try {
    const tables: any = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables currently in Neon public schema:');
    if (tables.length === 0) {
      console.log('  (Schema is currently empty)');
    } else {
      tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
    }
  } catch (err: any) {
    console.error('Error listing tables:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

listNeonTables();

