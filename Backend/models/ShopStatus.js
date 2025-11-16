const mongoose = require('mongoose');

const shopStatusSchema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: true
  },
  manualClose: {
    type: Boolean,
    default: false
  },
  manualCloseReason: {
    type: String,
    trim: true
  },
  expectedReopenTime: {
    type: Date
  },
  notice: {
    type: String,
    trim: true
  },
  minimumOrderAmount: {
    type: Number,
    default: 10.00
  },
  maxOrdersPerSlot: {
    type: Number,
    default: 20
  },
  orderingEnabled: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Ensure only one document exists
shopStatusSchema.statics.getCurrentStatus = async function() {
  let status = await this.findOne();
  if (!status) {
    status = await this.create({});
  }
  return status;
};

module.exports = mongoose.model('ShopStatus', shopStatusSchema);