const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSeed() {
  try {
    console.log('Testing Prisma client connection...');
    await prisma.$connect();
    console.log('✓ Database connection successful');
    
    console.log('Testing if user table exists...');
    const userCount = await prisma.user.count();
    console.log(`✓ User table exists, current count: ${userCount}`);
    
    console.log('Testing if subject table exists...');
    const subjectCount = await prisma.subject.count();
    console.log(`✓ Subject table exists, current count: ${subjectCount}`);
    
    console.log('\n✓ All database tables are accessible');
    console.log('✓ Seed file should work correctly');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('This might indicate that the database needs to be migrated first');
  } finally {
    await prisma.$disconnect();
  }
}

testSeed();
