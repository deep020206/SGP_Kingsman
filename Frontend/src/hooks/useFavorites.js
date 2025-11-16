import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Create axios config with auth header
  const getAxiosConfig = () => ({
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json'
    }
  });

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!getAuthToken()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites`,
        getAxiosConfig()
      );
      
      setFavorites(response.data);
      
      // Create a Set of favorite item IDs for quick lookup
      const ids = new Set(response.data.map(fav => fav.menuItemId._id));
      setFavoriteIds(ids);
      
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites');
      if (error.response?.status !== 401) {
        toast.error('Failed to load favorites');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch favorite IDs only (lightweight for checking favorite status)
  const fetchFavoriteIds = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setFavoriteIds(new Set());
      return;
    }
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/favorites/ids`,
        getAxiosConfig()
      );
      
      const ids = new Set(response.data.favoriteIds || []);
      setFavoriteIds(ids);
      
    } catch (error) {
      console.error('Error fetching favorite IDs:', error);
      if (error.response?.status === 401) {
        setFavoriteIds(new Set());
      }
    }
  }, []);

  // Add item to favorites
  const addToFavorites = async (menuItemId) => {
    if (!getAuthToken()) {
      toast.error('Please log in to add favorites');
      return false;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorites/${menuItemId}`,
        {},
        getAxiosConfig()
      );
      
      // Update local state immediately
      setFavoriteIds(prev => {
        const newSet = new Set([...prev, menuItemId]);
        return newSet;
      });
      
      // If we have the full favorites list, add the new item
      if (response.data.favorite) {
        setFavorites(prev => [response.data.favorite, ...prev]);
      }
      
      // Force refresh to ensure sync
      setTimeout(() => fetchFavoriteIds(), 100);
      
      toast.success('Added to favorites! ❤️');
      return true;
      
    } catch (error) {
      console.error('Error adding to favorites:', error);
      if (error.response?.status === 409) {
        toast.info('Item already in favorites');
      } else {
        toast.error('Failed to add to favorites');
      }
      return false;
    }
  };

  // Remove item from favorites
  const removeFromFavorites = async (menuItemId) => {
    if (!getAuthToken()) {
      toast.error('Please log in to manage favorites');
      return false;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/favorites/${menuItemId}`,
        getAxiosConfig()
      );
      
      // Update local state
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuItemId);
        return newSet;
      });
      
      setFavorites(prev => 
        prev.filter(fav => fav.menuItemId._id !== menuItemId)
      );
      
      // Force refresh to ensure sync
      setTimeout(() => fetchFavoriteIds(), 100);
      
      toast.success('Removed from favorites');
      return true;
      
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
      return false;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (menuItemId) => {
    if (!getAuthToken()) {
      toast.error('Please log in to manage favorites');
      return;
    }

    const isFavorite = favoriteIds.has(menuItemId);
    
    // Optimistic update
    if (isFavorite) {
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuItemId);
        return newSet;
      });
    } else {
      setFavoriteIds(prev => new Set([...prev, menuItemId]));
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorites/toggle/${menuItemId}`,
        {},
        getAxiosConfig()
      );
      
      // Show success message
      toast.success(response.data.message);
      
      // Refresh favorites if we're showing the full list
      if (favorites.length > 0) {
        fetchFavorites();
      }
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      // Revert optimistic update on error
      if (isFavorite) {
        setFavoriteIds(prev => new Set([...prev, menuItemId]));
      } else {
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(menuItemId);
          return newSet;
        });
      }
      
      toast.error('Failed to update favorites');
    }
  };

  // Check if an item is favorite
  const isFavorite = (menuItemId) => {
    return favoriteIds.has(menuItemId);
  };

  // Get favorites count
  const getFavoritesCount = useCallback(() => {
    const count = favoriteIds.size;
    return count;
  }, [favoriteIds]);

  // Initialize favorites on mount
  useEffect(() => {
    if (getAuthToken()) {
      fetchFavoriteIds();
    }
  }, [fetchFavoriteIds]);

  return {
    favorites,
    favoriteIds: Array.from(favoriteIds),
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoritesCount,
    fetchFavorites,
    fetchFavoriteIds,
    refreshFavorites: fetchFavorites
  };
};