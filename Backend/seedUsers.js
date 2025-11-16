const { User } = require('./models');

// Create the main vendor user for the shop
const createTestUser = async () => {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if vendor user already exists
    const existingUser = await User.findOne({ email: 'damarodiya8314@gmail.com' });
    if (existingUser) {
      console.log('✅ Vendor user already exists: damarodiya8314@gmail.com');
      return;
    }

    // Create main vendor with Admin123 password
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    const vendorUser = new User({
      name: 'Shop Vendor',
      email: 'damarodiya8314@gmail.com',
      password: hashedPassword,
      phone: '+91-8314000000',
      role: 'admin', // Using admin role for vendor dashboard access
      address: 'Shop Address'
    });

    await vendorUser.save();
    console.log('✅ Vendor user created: damarodiya8314@gmail.com / Admin123');
    console.log('✅ Role: admin (for vendor dashboard access)');
  } catch (error) {
    console.log('Failed to create vendor user:', error.message);
  }
};

module.exports = { createTestUser };
