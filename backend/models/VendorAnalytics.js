const mongoose = require('mongoose');

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
    hour: { type: Number },
    orderCount: { type: Number, default: 0 }
  }],
  avgRating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

vendorAnalyticsSchema.index({ vendorId: 1, date: -1 });

module.exports = mongoose.model('VendorAnalytics', vendorAnalyticsSchema);