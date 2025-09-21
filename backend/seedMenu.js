const { MenuItem, User } = require('./models');

const createSampleMenuItems = async () => {
  try {
    // Find a vendor user to associate with menu items
    let vendor = await User.findOne({ role: 'vendor' });
    if (!vendor) {
      console.log('No vendor found, creating one...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      vendor = new User({
        name: 'Demo Vendor',
        email: 'vendor@example.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'vendor',
        address: 'Demo Restaurant Address'
      });
      await vendor.save();
    }

    // Check if menu items already exist
    const existingItems = await MenuItem.countDocuments();
    if (existingItems > 0) {
      console.log(`✅ ${existingItems} menu items already exist`);
      return;
    }

    const sampleMenuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
        price: 299,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
        isAvailable: true,
        preparationTime: 15,
        ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'],
        isVegetarian: true,
        spiceLevel: 'mild',
        vendorId: vendor._id
      },
      {
        name: 'Veg Burger',
        description: 'Delicious vegetarian burger with fresh vegetables and sauces',
        price: 149,
        category: 'Burger',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80',
        isAvailable: true,
        preparationTime: 10,
        ingredients: ['Veg Patty', 'Lettuce', 'Tomato', 'Onion', 'Mayo'],
        isVegetarian: true,
        spiceLevel: 'mild',
        vendorId: vendor._id
      },
      {
        name: 'Paneer Wrap',
        description: 'Spicy paneer wrap with fresh vegetables and mint chutney',
        price: 199,
        category: 'Wrap',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80',
        isAvailable: true,
        preparationTime: 12,
        ingredients: ['Paneer', 'Tortilla', 'Onions', 'Capsicum', 'Mint Chutney'],
        isVegetarian: true,
        spiceLevel: 'medium',
        vendorId: vendor._id
      },
      {
        name: 'Chocolate Shake',
        description: 'Rich and creamy chocolate milkshake with whipped cream',
        price: 129,
        category: 'Drinks',
        image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=400&q=80',
        isAvailable: true,
        preparationTime: 5,
        ingredients: ['Milk', 'Chocolate', 'Ice Cream', 'Whipped Cream'],
        isVegetarian: true,
        spiceLevel: 'mild',
        vendorId: vendor._id
      },
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice cooked with tender chicken and spices',
        price: 349,
        category: 'Biryani',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
        isAvailable: true,
        preparationTime: 25,
        ingredients: ['Basmati Rice', 'Chicken', 'Onions', 'Spices', 'Saffron'],
        isVegetarian: false,
        spiceLevel: 'spicy',
        vendorId: vendor._id
      },
      {
        name: 'Chocolate Cake',
        description: 'Moist chocolate cake with rich chocolate frosting',
        price: 179,
        category: 'Dessert',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
        isAvailable: true,
        preparationTime: 5,
        ingredients: ['Chocolate', 'Flour', 'Sugar', 'Eggs', 'Butter'],
        isVegetarian: true,
        spiceLevel: 'mild',
        vendorId: vendor._id
      }
    ];

    await MenuItem.insertMany(sampleMenuItems);
    console.log(`✅ Created ${sampleMenuItems.length} sample menu items`);
  } catch (error) {
    console.log('Failed to create sample menu items:', error.message);
  }
};

module.exports = { createSampleMenuItems };
