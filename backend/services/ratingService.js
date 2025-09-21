const { Rating, Order } = require('../models');

class RatingService {
  async createRating(ratingData) {
    // Verify that the order exists and belongs to the user
    const order = await Order.findOne({
      _id: ratingData.orderId,
      userId: ratingData.userId,
      status: 'delivered'
    });

    if (!order) {
      throw new Error('Order not found or not eligible for rating');
    }

    // Check if item was part of the order
    const orderItem = order.items.find(
      item => item.menuItem.toString() === ratingData.menuItemId.toString()
    );

    if (!orderItem) {
      throw new Error('Item was not part of this order');
    }

    // Check if already rated
    const existingRating = await Rating.findOne({
      orderId: ratingData.orderId,
      menuItemId: ratingData.menuItemId,
      userId: ratingData.userId
    });

    if (existingRating) {
      throw new Error('Item already rated for this order');
    }

    const rating = new Rating(ratingData);
    await rating.save();
    return rating;
  }

  async getMenuItemRatings(menuItemId) {
    const ratings = await Rating.find({ menuItemId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return {
      ratings,
      averageRating,
      totalRatings: ratings.length
    };
  }
}

module.exports = new RatingService();