const axios = require('axios');

// Test vendor endpoints with admin user
async function testVendorAccess() {
  try {
    // First login to get the token
    console.log('🔐 Logging in as admin user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'damarodiya8314@gmail.com',
      password: 'Admin123'
    });

    console.log('✅ Login successful, role:', loginResponse.data.user.role);
    const token = loginResponse.data.token;

    // Test vendor endpoints
    const endpoints = [
      '/api/vendor/me',
      '/api/vendor/orders', 
      '/api/vendor/my-items'
    ];

    console.log('\n🧪 Testing vendor endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint}: SUCCESS (${response.status})`);
      } catch (error) {
        console.log(`❌ ${endpoint}: FAILED (${error.response?.status}) - ${error.response?.data?.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
  }
}

testVendorAccess();