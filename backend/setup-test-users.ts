import prisma from './src/config/database';
import { hashPassword } from './src/utils/password.utils';

async function setupTestUser() {
  try {
    console.log('Checking existing users...');
    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    console.log('Found users:', users);

    // Check if test user exists
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (testUser) {
      console.log('\nTest user already exists: test@example.com');
      console.log('Password: password123');
    } else {
      console.log('\nCreating test user...');
      const hashedPassword = await hashPassword('password123');
      
      const newUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'CUSTOMER',
        },
      });
      
      console.log('Test user created!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('User ID:', newUser.id);
    }

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sgvmart.com' },
    });

    if (adminUser) {
      console.log('\nAdmin user already exists: admin@sgvmart.com');
      console.log('Password: admin123');
    } else {
      console.log('\nCreating admin user...');
      const hashedPassword = await hashPassword('admin123');
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@sgvmart.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        },
      });
      
      console.log('Admin user created!');
      console.log('Email: admin@sgvmart.com');
      console.log('Password: admin123');
      console.log('User ID:', newAdmin.id);
    }

    console.log('\n=== Login Credentials ===');
    console.log('Test User:');
    console.log('  Email: test@example.com');
    console.log('  Password: password123');
    console.log('\nAdmin User:');
    console.log('  Email: admin@sgvmart.com');
    console.log('  Password: admin123');
    console.log('========================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestUser();
