const express = require('express');
const menuService = require('../services/menuService');
const { auth, vendorAuth } = require('../middleware/auth');

const router = express.Router();

// Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, vendor } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    if (vendor) filters.vendorId = vendor;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await menuService.getMenuItems(filters);
    
    // If there are no items but we have a message
    if (result.items && result.items.length === 0 && result.message) {
      return res.status(200).json({
        items: [],
        message: result.message
      });
    }

    res.json(result.items || result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await menuService.getMenuItemById(req.params.id);
    res.json(menuItem);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Create menu item (vendor only)
router.post('/', vendorAuth, async (req, res) => {
  try {
    const menuItem = await menuService.createMenuItem({
      ...req.body,
      vendorId: req.user.userId
    });
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu item (vendor only)
router.put('/:id', vendorAuth, async (req, res) => {
  try {
    const menuItem = await menuService.updateMenuItem(
      req.params.id,
      req.user.userId,
      req.body
    );
    res.json(menuItem);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Toggle menu item availability (vendor only)
router.patch('/:id/availability', vendorAuth, async (req, res) => {
  try {
    const menuItem = await menuService.toggleMenuItemAvailability(
      req.params.id,
      req.user.userId
    );
    res.json(menuItem);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Delete menu item (vendor only)
router.delete('/:id', vendorAuth, async (req, res) => {
  try {
    await menuService.deleteMenuItem(req.params.id, req.user.userId);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get vendor's menu items
router.get('/vendor/my-items', vendorAuth, async (req, res) => {
  try {
    const menuItems = await menuService.getVendorMenuItems(req.user.userId);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await menuService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
