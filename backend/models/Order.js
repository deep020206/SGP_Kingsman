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
    totalItemPrice: { type: Number, required: true } // Base price + instruction modifiers
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  hasRejectedItems: { type: Boolean, default: false },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  unavailableItems: { type: [String], default: [] }
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);