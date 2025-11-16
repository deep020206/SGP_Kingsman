import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class FavoritesService {
  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Create axios config with auth header
  getAuthConfig() {
    const token = this.getAuthToken();
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // Get all user favorites
  async getFavorites() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites`,
        this.getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  // Add item to favorites
  async addToFavorites(menuItemId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorites/${menuItemId}`,
        {},
        this.getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove item from favorites
  async removeFromFavorites(menuItemId) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/favorites/${menuItemId}`,
        this.getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Toggle favorite status
  async toggleFavorite(menuItemId) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorites/toggle/${menuItemId}`,
        {},
        this.getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // Check if item is favorite
  async checkFavorite(menuItemId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites/check/${menuItemId}`,
        this.getAuthConfig()
      );
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw error;
    }
  }

  // Get favorites count
  async getFavoritesCount() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites/count`,
        this.getAuthConfig()
      );
      return response.data.count;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      throw error;
    }
  }

  // Get favorite item IDs
  async getFavoriteIds() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites/ids`,
        this.getAuthConfig()
      );
      return response.data.favoriteIds;
    } catch (error) {
      console.error('Error getting favorite IDs:', error);
      throw error;
    }
  }
}

export default new FavoritesService();