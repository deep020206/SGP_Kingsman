const mongoose = require('mongoose');
const userService = require('./services/userService');
require('dotenv').config();

async function testSignup() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB for testing');

    // Test admin signup (authorized email)
    console.log('\n🧪 Testing admin signup...');
    try {
      const adminUser = await userService.register({
        name: 'Test Admin',
        email: 'damarodiya8314@gmail.com',
        password: 'testpass123'
      });
      console.log('✅ Admin signup successful:', {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      });
    } catch (error) {
      console.log('⚠️ Admin signup test:', error.message);
    }

    // Test customer signup (non-authorized email)
    console.log('\n🧪 Testing customer signup...');
    try {
      const customerUser = await userService.register({
        name: 'Test Customer',
        email: 'customer@example.com',
        password: 'testpass123'
      });
      console.log('✅ Customer signup successful:', {
        name: customerUser.name,
        email: customerUser.email,
        role: customerUser.role
      });
    } catch (error) {
      console.log('⚠️ Customer signup test:', error.message);
    }

    console.log('\n🎯 Signup system test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSignup();