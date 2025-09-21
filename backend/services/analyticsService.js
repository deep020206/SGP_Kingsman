const { VendorAnalytics, Order, Rating } = require('../models');

class AnalyticsService {
  async getVendorAnalytics(vendorId, dateRange) {
    const { startDate, endDate } = dateRange;
    
    const analytics = await VendorAnalytics.find({
      vendorId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('popularItems.menuItemId', 'name price');

    // Calculate overall stats
    const totalRevenue = analytics.reduce((sum, day) => sum + day.totalRevenue, 0);
    const totalOrders = analytics.reduce((sum, day) => sum + day.totalOrders, 0);
    
    // Get average rating for the period
    const ratings = await Rating.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Get most popular items
    const itemCounts = new Map();
    analytics.forEach(day => {
      day.popularItems.forEach(item => {
        const current = itemCounts.get(item.menuItemId.id) || {
          item: item.menuItemId,
          count: 0
        };
        current.count += item.orderCount;
        itemCounts.set(item.menuItemId.id, current);
      });
    });

    const popularItems = Array.from(itemCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      avgRating,
      popularItems,
      dailyStats: analytics
    };
  }

  async getDashboardStats(vendorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await VendorAnalytics.findOne({
      vendorId,
      date: today
    });

    const pendingOrders = await Order.countDocuments({
      vendorId,
      status: 'pending'
    });

    const preparingOrders = await Order.countDocuments({
      vendorId,
      status: { $in: ['accepted', 'preparing'] }
    });

    return {
      today: todayStats || {
        totalOrders: 0,
        totalRevenue: 0,
        avgRating: 0
      },
      pendingOrders,
      preparingOrders
    };
  }
}

module.exports = new AnalyticsService();