const Favorite = require('../models/Favorite');
const MenuItem = require('../models/MenuItem');

class FavoriteService {
  // Add item to favorites
  async addToFavorites(userId, menuItemId) {
    try {
      // Check if item exists
      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem) {
        throw new Error('Menu item not found');
      }

      // Check if already in favorites
      const existingFavorite = await Favorite.findOne({ userId, menuItemId });
      if (existingFavorite) {
        throw new Error('Item already in favorites');
      }

      // Add to favorites
      const favorite = new Favorite({ userId, menuItemId });
      await favorite.save();

      // Return populated favorite
      return await Favorite.findById(favorite._id).populate('menuItemId');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Remove item from favorites
  async removeFromFavorites(userId, menuItemId) {
    try {
      const result = await Favorite.findOneAndDelete({ userId, menuItemId });
      if (!result) {
        throw new Error('Favorite not found');
      }
      return { message: 'Item removed from favorites' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get user's favorites
  async getUserFavorites(userId) {
    try {
      const favorites = await Favorite.find({ userId })
        .populate({
          path: 'menuItemId',
          select: 'name description price category image isAvailable spiceLevel isVegetarian customizations'
        })
        .sort({ createdAt: -1 });

      // Filter out favorites where menuItem was deleted
      return favorites.filter(fav => fav.menuItemId);
    } catch (error) {
      throw new Error('Error fetching favorites: ' + error.message);
    }
  }

  // Check if item is in user's favorites
  async isFavorite(userId, menuItemId) {
    try {
      const favorite = await Favorite.findOne({ userId, menuItemId });
      return !!favorite;
    } catch (error) {
      throw new Error('Error checking favorite status: ' + error.message);
    }
  }

  // Get favorites count for user
  async getFavoritesCount(userId) {
    try {
      return await Favorite.countDocuments({ userId });
    } catch (error) {
      throw new Error('Error getting favorites count: ' + error.message);
    }
  }

  // Toggle favorite status
  async toggleFavorite(userId, menuItemId) {
    try {
      const existingFavorite = await Favorite.findOne({ userId, menuItemId });
      
      if (existingFavorite) {
        // Remove from favorites
        await this.removeFromFavorites(userId, menuItemId);
        return { isFavorite: false, message: 'Removed from favorites' };
      } else {
        // Add to favorites
        await this.addToFavorites(userId, menuItemId);
        return { isFavorite: true, message: 'Added to favorites' };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get favorite menu item IDs for user (for quick lookup)
  async getFavoriteItemIds(userId) {
    try {
      const favorites = await Favorite.find({ userId }).select('menuItemId');
      return favorites.map(fav => fav.menuItemId.toString());
    } catch (error) {
      throw new Error('Error fetching favorite item IDs: ' + error.message);
    }
  }
}

module.exports = new FavoriteService();