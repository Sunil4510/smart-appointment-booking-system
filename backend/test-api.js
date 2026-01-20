import axios from 'axios';

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test health check
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check:', health.data);

    // Test get providers
    console.log('\n2. Testing get providers...');
    const providers = await axios.get(`${API_BASE}/api/providers`);
    console.log('✅ Providers:', providers.data.providers?.length || 0, 'providers found');

    // Test get services
    console.log('\n3. Testing get services...');
    const services = await axios.get(`${API_BASE}/api/services`);
    console.log('✅ Services:', services.data.services?.length || 0, 'services found');

    // Test user registration
    console.log('\n4. Testing user registration...');
    const newUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '1234567890',
      role: 'CUSTOMER'
    };

    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, newUser);
    console.log('✅ Registration successful:', registerResponse.data.user.name);

    // Test login
    console.log('\n5. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: newUser.email,
      password: newUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.user.name);
    
    const token = loginResponse.data.tokens.accessToken;

    // Test protected route
    console.log('\n6. Testing protected route...');
    const profile = await axios.get(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile retrieved:', profile.data.name);

    console.log('\n🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPI();