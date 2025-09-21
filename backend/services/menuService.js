const { MenuItem, Rating } = require('../models');

class MenuService {
  async createMenuItem(menuData) {
    const menuItem = new MenuItem(menuData);
    await menuItem.save();
    return menuItem;
  }

  async getMenuItems(filters = {}) {
    const query = { isAvailable: true, ...filters };
    
    // If looking for specific vendor's menu
    if (filters.vendorId) {
      const vendorMenuCount = await MenuItem.countDocuments({ vendorId: filters.vendorId });
      if (vendorMenuCount === 0) {
        return {
          items: [],
          message: "This vendor hasn't added any menu items yet."
        };
      }
    }

    const menuItems = await MenuItem.find(query)
      .populate('vendorId', 'name email phone')
      .sort({ createdAt: -1 });

    if (menuItems.length === 0) {
      return {
        items: [],
        message: filters.category 
          ? "No items available in this category yet."
          : filters.search 
            ? "No items match your search criteria."
            : "No menu items available yet."
      };
    }

    // Get ratings for menu items
    const itemsWithRatings = await Promise.all(
      menuItems.map(async (item) => {
        const ratings = await Rating.find({ menuItemId: item._id });
        const avgRating = ratings.length 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;
        return {
          ...item.toObject(),
          avgRating,
          totalRatings: ratings.length
        };
      })
    );

    return itemsWithRatings;
  }

  async updateMenuItem(itemId, vendorId, updateData) {
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: itemId, vendorId },
      { $set: updateData },
      { new: true }
    );

    if (!menuItem) {
      throw new Error('Menu item not found or unauthorized');
    }

    return menuItem;
  }

  async deleteMenuItem(itemId, vendorId) {
    const menuItem = await MenuItem.findOneAndDelete({ _id: itemId, vendorId });
    if (!menuItem) {
      throw new Error('Menu item not found or unauthorized');
    }
    return menuItem;
  }
}

module.exports = new MenuService();