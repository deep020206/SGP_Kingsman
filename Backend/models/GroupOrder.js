const mongoose = require('mongoose');

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

groupOrderSchema.index({ groupId: 1 });

module.exports = mongoose.model('GroupOrder', groupOrderSchema);