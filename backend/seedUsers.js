const { User } = require('./models');

// Create a test user for development
const createTestUser = async () => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'vendor@gmail.com' });
    if (existingUser) {
      console.log('✅ Test vendor user already exists');
      return;
    }

    // Create test vendor
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      name: 'Test Vendor',
      email: 'vendor@gmail.com',
      password: hashedPassword,
      phone: '+1234567890',
      role: 'vendor',
      address: 'Test Address'
    });

    await testUser.save();
    console.log('✅ Test vendor user created: vendor@gmail.com / password123');
  } catch (error) {
    console.log('Failed to create test user:', error.message);
  }
};

module.exports = { createTestUser };
