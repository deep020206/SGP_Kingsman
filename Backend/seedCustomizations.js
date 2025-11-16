const MenuItem = require('./models/MenuItem');

async function addCustomizationsToItems() {
  try {
    const items = await MenuItem.find({});
    
    const commonCustomizations = [
      { name: 'Extra Cheese', price: 30, available: true },
      { name: 'Extra Veggies', price: 25, available: true },
      { name: 'Extra Spicy', price: 10, available: true },
    ];

    const pizzaCustomizations = [
      ...commonCustomizations,
      { name: 'Thick Crust', price: 40, available: true },
      { name: 'Extra Toppings', price: 50, available: true },
    ];

    const burgerCustomizations = [
      ...commonCustomizations,
      { name: 'Extra Patty', price: 60, available: true },
      { name: 'Add Bacon', price: 45, available: true },
    ];

    for (const item of items) {
      if (item.category.toLowerCase().includes('pizza')) {
        item.customizations = pizzaCustomizations;
      } else if (item.category.toLowerCase().includes('burger')) {
        item.customizations = burgerCustomizations;
      } else {
        item.customizations = commonCustomizations;
      }
      await item.save();
    }

    console.log('Successfully added customizations to menu items');
  } catch (error) {
    console.error('Error adding customizations:', error);
  }
}

// Run the function if this file is run directly
if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost:27017/your_database_name')
    .then(() => {
      console.log('Connected to MongoDB');
      return addCustomizationsToItems();
    })
    .then(() => {
      console.log('Finished adding customizations');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
