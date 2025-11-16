const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    customizations: { type: String },
    selectedInstructions: [{
      name: { type: String, required: true },
      priceModifier: { type: Number, default: 0 },
      category: { type: String, enum: ['addon', 'modification', 'custom'], default: 'addon' }
    }],
    customInstructions: { type: String },
    totalItemPrice: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  // Payment fields
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: { type: String },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash'],
    required: true,
    default: 'card'
  },
  paidAt: { type: Date },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none'
  },
  refundId: { type: String },
  refundAmount: { type: Number },
  refundReason: { type: String },
  refundedAt: { type: Date },
  // Order status fields
  hasRejectedItems: { type: Boolean, default: false },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  unavailableItems: { type: [String], default: [] }
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);