const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['student', 'vendor'], default: 'student' },
  address: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 30 }, // in minutes
  ingredients: [String],
  isVegetarian: { type: Boolean, default: false },
  spiceLevel: { type: String, enum: ['mild', 'medium', 'spicy'], default: 'medium' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    customizations: { type: String },
    isRejected: { type: Boolean, default: false }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'rejected', 'partially_rejected'],
    default: 'pending'
  },
  deliveryAddress: { type: String, required: true },
  specialInstructions: { type: String },
  paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  isGroupOrder: { type: Boolean, default: false },
  groupOrderId: { type: String },
  scheduledFor: { type: Date },
  estimatedDeliveryTime: { type: Date },
  deliveredAt: { type: Date },
  rejectionReason: { type: String },
  hasRejectedItems: { type: Boolean, default: false },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  unavailableItems: { type: [String], default: [] }
});

// Group Order Schema
const groupOrderSchema = new mongoose.Schema({
  groupId: { type: String, unique: true, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    joinedAt: { type: Date, default: Date.now }
  }],
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['open', 'closed', 'confirmed', 'delivered'],
    default: 'open'
  },
  closesAt: { type: Date, required: true },
  deliveryAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Rating Schema
const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Vendor Analytics Schema
const vendorAnalyticsSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  popularItems: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    orderCount: { type: Number, default: 0 }
  }],
  peakHours: [{
    hour: { type: Number }, // 0-23
    orderCount: { type: Number, default: 0 }
  }],
  avgRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
userSchema.index({ email: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
menuItemSchema.index({ vendorId: 1, category: 1 });
groupOrderSchema.index({ groupId: 1 });
ratingSchema.index({ userId: 1, orderId: 1 });
vendorAnalyticsSchema.index({ vendorId: 1, date: -1 });

// Import all models
const User = require('./User');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const GroupOrder = require('./GroupOrder');
const Rating = require('./Rating');
const VendorAnalytics = require('./VendorAnalytics');
const Notification = require('./Notification');
const Favorite = require('./Favorite');

// Export all models
module.exports = {
  User,
  MenuItem,
  Order,
  GroupOrder,
  Rating,
  VendorAnalytics,
  Notification,
  Favorite
};
