const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const config = require('./config');

// Sample instructions data
const sampleInstructions = [
  {
    name: 'Extra Cheese',
    priceModifier: 20,
    isAvailable: true,
    category: 'addon'
  },
  {
    name: 'Extra Spicy',
    priceModifier: 0,
    isAvailable: true,
    category: 'modification'
  },
  {
    name: 'No Onions',
    priceModifier: 0,
    isAvailable: true,
    category: 'modification'
  },
  {
    name: 'Extra Sauce',
    priceModifier: 15,
    isAvailable: true,
    category: 'addon'
  },
  {
    name: 'Extra Crispy',
    priceModifier: 10,
    isAvailable: true,
    category: 'modification'
  },
  {
    name: 'Less Salt',
    priceModifier: 0,
    isAvailable: true,
    category: 'modification'
  },
  {
    name: 'Extra Vegetables',
    priceModifier: 25,
    isAvailable: true,
    category: 'addon'
  },
  {
    name: 'No Spice',
    priceModifier: 0,
    isAvailable: true,
    category: 'modification'
  }
];

async function seedInstructions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Connected to MongoDB');

    // Get all menu items
    const menuItems = await MenuItem.find({});
    console.log(`📋 Found ${menuItems.length} menu items`);

    if (menuItems.length === 0) {
      console.log('⚠️  No menu items found. Please seed menu items first.');
      return;
    }

    // Add sample instructions to each menu item
    let updatedCount = 0;
    for (const menuItem of menuItems) {
      // Only add instructions if the item doesn't already have them
      if (!menuItem.availableInstructions || menuItem.availableInstructions.length === 0) {
        // Validate menu item has proper name
        if (!menuItem.name || menuItem.name.length < 2) {
          console.log(`⚠️  Skipping invalid menu item: ${menuItem.name || 'unnamed'}`);
          continue;
        }
        
        menuItem.availableInstructions = sampleInstructions;
        await menuItem.save();
        updatedCount++;
        console.log(`✅ Added instructions to: ${menuItem.name}`);
      } else {
        console.log(`⏭️  Skipped ${menuItem.name} (already has instructions)`);
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} menu items with instructions`);
    
  } catch (error) {
    console.error('❌ Error seeding instructions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedInstructions();
}

module.exports = seedInstructions;
