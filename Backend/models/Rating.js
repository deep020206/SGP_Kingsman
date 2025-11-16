const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

ratingSchema.index({ userId: 1, orderId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);