const express = require('express');
const favoriteService = require('../services/favoriteService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.userId);
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add item to favorites
router.post('/:menuItemId', auth, async (req, res) => {
  try {
    const favorite = await favoriteService.addToFavorites(req.user.userId, req.params.menuItemId);
    res.status(201).json({ 
      message: 'Item added to favorites', 
      favorite,
      isFavorite: true 
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    if (error.message === 'Item already in favorites') {
      return res.status(409).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
});

// Remove item from favorites
router.delete('/:menuItemId', auth, async (req, res) => {
  try {
    const result = await favoriteService.removeFromFavorites(req.user.userId, req.params.menuItemId);
    res.json({ 
      ...result, 
      isFavorite: false 
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(404).json({ message: error.message });
  }
});

// Toggle favorite status
router.post('/toggle/:menuItemId', auth, async (req, res) => {
  try {
    const result = await favoriteService.toggleFavorite(req.user.userId, req.params.menuItemId);
    res.json(result);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Check if item is favorite
router.get('/check/:menuItemId', auth, async (req, res) => {
  try {
    const isFavorite = await favoriteService.isFavorite(req.user.userId, req.params.menuItemId);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get favorites count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await favoriteService.getFavoritesCount(req.user.userId);
    res.json({ count });
  } catch (error) {
    console.error('Get favorites count error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get favorite item IDs (for quick lookup)
router.get('/ids', auth, async (req, res) => {
  try {
    const favoriteIds = await favoriteService.getFavoriteItemIds(req.user.userId);
    res.json({ favoriteIds });
  } catch (error) {
    console.error('Get favorite IDs error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;