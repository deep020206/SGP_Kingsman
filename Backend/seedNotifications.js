const mongoose = require('mongoose');
const { Notification, User } = require('./models');
const config = require('./config');

async function seedNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`📋 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users first.');
      return;
    }

    // Sample notifications
    const sampleNotifications = [
      {
        type: 'order_placed',
        title: 'Order Placed Successfully! 🎉',
        message: 'Your order #ORD123456 has been placed and is being processed. Total: ₹250',
        priority: 'high',
        data: {
          orderNumber: 'ORD123456',
          amount: 250
        }
      },
      {
        type: 'order_accepted',
        title: 'Order Accepted! ✅',
        message: 'Great news! Your order #ORD123456 has been accepted and is being prepared.',
        priority: 'high',
        data: {
          orderNumber: 'ORD123456'
        }
      },
      {
        type: 'promotion',
        title: 'Special Offer! 🎁',
        message: 'Get 20% off on your next order! Use code SAVE20. Valid until end of month.',
        priority: 'medium',
        data: {
          promotionId: 'SAVE20',
          actionUrl: '/promotions'
        }
      },
      {
        type: 'system',
        title: 'App Update Available',
        message: 'New features added! Update your app to enjoy the latest improvements.',
        priority: 'low',
        data: {
          actionUrl: '/updates'
        }
      },
      {
        type: 'order_delivered',
        title: 'Order Delivered! 🚚',
        message: 'Your order #ORD123456 has been delivered. Enjoy your meal!',
        priority: 'medium',
        data: {
          orderNumber: 'ORD123456'
        }
      }
    ];

    // Create notifications for each user
    let totalCreated = 0;
    for (const user of users) {
      // Create 2-3 random notifications per user
      const numNotifications = Math.floor(Math.random() * 2) + 2;
      const selectedNotifications = sampleNotifications
        .sort(() => 0.5 - Math.random())
        .slice(0, numNotifications);

      for (const notificationData of selectedNotifications) {
        const notification = new Notification({
          ...notificationData,
          userId: user._id,
          isRead: Math.random() > 0.5, // Random read status
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        });

        await notification.save();
        totalCreated++;
      }
    }

    console.log(`🎉 Successfully created ${totalCreated} sample notifications`);
    
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the seed function
if (require.main === module) {
  seedNotifications();
}

module.exports = seedNotifications;
