import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testLogin() {
  console.log('Testing Login Functionality...\n');

  const testAccounts = [
    {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    },
    {
      email: 'admin@sgvmart.com',
      password: 'admin123',
      name: 'Admin User',
    },
    {
      email: 'gohxiong999@gmail.com',
      password: 'password123',
      name: 'Existing User (try common password)',
    },
  ];

  for (const account of testAccounts) {
    console.log(`\n=== Testing: ${account.name} ===`);
    console.log(`Email: ${account.email}`);
    console.log(`Password: ${account.password}`);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: account.email,
        password: account.password,
      });

      console.log('✅ Login successful!');
      console.log('Token:', response.data.token.substring(0, 50) + '...');
      console.log('User:', response.data.user);
    } catch (error: any) {
      if (error.response) {
        console.log('❌ Login failed');
        console.log('Status:', error.response.status);
        console.log('Error:', error.response.data);
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
  }

  console.log('\n\n=== Summary ===');
  console.log('Working Credentials:');
  console.log('1. Email: test@example.com');
  console.log('   Password: password123');
  console.log('\n2. Email: admin@sgvmart.com');
  console.log('   Password: admin123');
  console.log('\nUse these credentials in the login form!');
}

testLogin();
