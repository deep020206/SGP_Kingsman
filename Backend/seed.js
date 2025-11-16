const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, MenuItem } = require('./models');
const config = require('./config');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('Connected to MongoDB');

    // Create authorized admin (shop owner)
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    const admin = await User.findOneAndUpdate(
      { email: 'damarodiya8314@gmail.com' },
      {
        name: 'Shop Vendor',
        email: 'damarodiya8314@gmail.com',
        password: hashedPassword,
        phone: '8314000000',
        role: 'admin',
        address: 'Shop Address',
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('Authorized vendor/admin created:', admin.email);

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
        vendorId: admin._id
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
        vendorId: admin._id
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

    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Vendor/Admin - Email: damarodiya8314@gmail.com, Password: Admin123');
    console.log('Customer - Email: customer@test.com, Password: customer123');
    console.log('\n⚠️  IMPORTANT: Only damarodiya8314@gmail.com can register/login as admin!');
    console.log('   Other emails will be restricted to customer role only.\n');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

seedDatabase();
