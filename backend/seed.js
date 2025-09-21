const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, MenuItem } = require('./models');
const config = require('./config');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('Connected to MongoDB');

    // Create test vendor
    const hashedPassword = await bcrypt.hash('vendor123', 10);
    const vendor = await User.findOneAndUpdate(
      { email: 'vendor@test.com' },
      {
        name: 'Test Vendor',
        email: 'vendor@test.com',
        password: hashedPassword,
        phone: '1234567890',
        role: 'vendor',
        address: 'Test Vendor Address',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('Test vendor created:', vendor.email);

    // Create test student
    const studentHashedPassword = await bcrypt.hash('student123', 10);
    const student = await User.findOneAndUpdate(
      { email: 'student@test.com' },
      {
        name: 'Test Student',
        email: 'student@test.com',
        password: studentHashedPassword,
        phone: '9876543210',
        role: 'student',
        address: 'Test Student Address',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('Test student created:', student.email);

    // Create some menu items
    const menuItems = [
      {
        name: 'Burger',
        description: 'Delicious burger with cheese and veggies',
        price: 150,
        category: 'Fast Food',
        isAvailable: true,
        preparationTime: 15,
        ingredients: ['Bun', 'Patty', 'Cheese', 'Lettuce', 'Tomato'],
        isVegetarian: true,
        spiceLevel: 'mild',
        vendorId: vendor._id
      },
      {
        name: 'Pizza',
        description: 'Fresh and hot pizza with multiple toppings',
        price: 200,
        category: 'Italian',
        isAvailable: true,
        preparationTime: 20,
        ingredients: ['Base', 'Cheese', 'Tomato Sauce', 'Veggies'],
        isVegetarian: true,
        spiceLevel: 'medium',
        vendorId: vendor._id
      }
    ];

    for (const item of menuItems) {
      await MenuItem.findOneAndUpdate(
        { name: item.name, vendorId: item.vendorId },
        item,
        { upsert: true, new: true }
      );
    }
    console.log('Menu items created');

    console.log('\nTest credentials:');
    console.log('Vendor - Email: vendor@test.com, Password: vendor123');
    console.log('Student - Email: student@test.com, Password: student123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

seedDatabase();
