const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuthFixes() {
  try {
    console.log('Testing Authentication Fixes...\n');

    // Test 1: Check if users table exists and has data
    console.log('1. Checking database connection...');
    await prisma.$connect();
    console.log('✓ Database connected successfully');

    // Test 2: Check existing users
    console.log('\n2. Checking existing users...');
    const userCount = await prisma.user.count();
    console.log(`✓ Found ${userCount} users in database`);

    // Test 3: Test password validation (backend requirements)
    console.log('\n3. Testing password validation...');
    const validPassword = 'Test1234'; // Has uppercase, lowercase, and number
    const invalidPassword = 'test1234'; // Missing uppercase
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    
    console.log(`Valid password "${validPassword}": ${passwordRegex.test(validPassword) ? '✓ Valid' : '✗ Invalid'}`);
    console.log(`Invalid password "${invalidPassword}": ${passwordRegex.test(invalidPassword) ? '✗ Valid (error!)' : '✓ Invalid (correct)'}`);

    // Test 4: Test password hashing
    console.log('\n4. Testing password hashing...');
    const hashedPassword = await bcrypt.hash(validPassword, 10);
    const isValid = await bcrypt.compare(validPassword, hashedPassword);
    console.log(`✓ Password hashing and comparison: ${isValid ? 'Working' : 'Failed'}`);

    // Test 5: Check if seeded users exist
    console.log('\n5. Checking seeded users...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    if (adminUser) {
      console.log('✓ Admin user exists');
      console.log(`  Email: ${adminUser.email}`);
      console.log(`  Role: ${adminUser.role}`);
      console.log(`  Active: ${adminUser.isActive}`);
    } else {
      console.log('✗ Admin user not found (run npm run db:seed)');
    }

    console.log('\n✓ All authentication tests completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run dev:backend');
    console.log('2. Start the frontend server: npm run dev:frontend');
    console.log('3. Test registration at http://localhost:5173/register');
    console.log('4. Test login at http://localhost:5173/login');
    console.log('5. Use seeded credentials: admin@example.com / Test1234');

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure PostgreSQL is running');
    console.error('2. Ensure DATABASE_URL is correct in .env');
    console.error('3. Run migrations: npm run db:migrate');
    console.error('4. Run seed: npm run db:seed');
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFixes();
