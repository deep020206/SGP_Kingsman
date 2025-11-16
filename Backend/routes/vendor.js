const express = require('express');
const analyticsService = require('../services/analyticsService');
const menuService = require('../services/menuService');
const orderService = require('../services/orderService');
const userService = require('../services/userService');
const { vendorAuth } = require('../middleware/auth');
const { MenuItem, Rating, User, Order } = require('../models');

const router = express.Router();

// Get vendor profile
router.get('/me', vendorAuth, async (req, res) => {
  try {
    const vendor = await User.findById(req.user.userId).select('-password');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor's menu items
router.get('/my-items', vendorAuth, async (req, res) => {
  try {
    console.log('Fetching menu items for vendor:', req.user.userId);
    const menuItems = await MenuItem.find({ vendorId: req.user.userId })
      .sort({ createdAt: -1 });
    
    console.log('Found menu items:', menuItems.length);

    if (menuItems.length === 0) {
      return res.json({
        items: [],
        message: 'No menu items available yet.'
      });
    }

    // Get ratings for each menu item
    const menuItemsWithRatings = await Promise.all(
      menuItems.map(async (item) => {
        const ratings = await Rating.find({ menuItemId: item._id });
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
          : 0;
        
        return {
          ...item.toObject(),
          avgRating: Math.round(avgRating * 10) / 10,
          ratingCount: ratings.length
        };
      })
    );

    res.json({
      items: menuItemsWithRatings,
      message: menuItemsWithRatings.length > 0 ? 'Menu items retrieved successfully.' : 'No menu items available yet.'
    });
  } catch (error) {
    console.error('Get vendor menu items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new menu item
router.post('/menu-items', vendorAuth, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.userId);
    console.log('Headers:', req.headers);
    
    const {
      name,
      description,
      price,
      category,
      image,
      isAvailable = true
    } = req.body;

    console.log('Extracted data:', {
      name,
      description,
      price,
      category,
      image,
      isAvailable
    });

    // Validate required fields
    if (!name || !price || !category) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        message: `Missing required fields: ${[
          !name && 'name',
          !price && 'price',
          !category && 'category'
        ].filter(Boolean).join(', ')}`
      });
    }

    // Convert price to number if it's a string
    const priceNumber = typeof price === 'string' ? parseFloat(price) : price;

    // Validate price is a valid number
    if (isNaN(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ message: 'Invalid price value' });
    }

    // Validate image if provided
    if (image && !image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }

    // Validate base64 image if provided
    let processedImage = image;
    if (image) {
      // Validate if it's a proper base64 image
      if (!image.startsWith('data:image/')) {
        return res.status(400).json({
          message: 'Invalid image format. Image must be a base64 encoded image.'
        });
      }

      // Check image size (base64 string length * 0.75 gives approximate size in bytes)
      const approximateSize = Math.ceil((image.length - 'data:image/jpeg;base64,'.length) * 0.75);
      if (approximateSize > 5 * 1024 * 1024) { // 5MB limit
        return res.status(400).json({
          message: 'Image size must be less than 5MB'
        });
      }
    }

    // Validate price
    if (isNaN(priceNumber) || priceNumber < 0) {
      console.log('Invalid price:', price);
      return res.status(400).json({
        message: 'Price must be a valid positive number'
      });
    }

    console.log('Creating new MenuItem with data:', {
      name,
      description,
      price: priceNumber,
      category,
      image,
      isAvailable,
      vendorId: req.user.userId
    });

    const menuItem = new MenuItem({
      name,
      description: description || '',
      price: priceNumber,
      category,
      image: image || '',
      isAvailable,
      vendorId: req.user.userId
    });

    console.log('Attempting to save menu item...');
    const savedItem = await menuItem.save();
    console.log('Menu item saved. Populating vendor data...');
    
    await savedItem.populate('vendorId', 'name email phone');
    console.log('Menu item saved successfully:', savedItem);

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem: savedItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      console.log('Validation error:', error.errors);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Handle other MongoDB errors
    if (error.code === 11000) {
      console.log('Duplicate key error');
      return res.status(400).json({
        message: 'A menu item with this name already exists'
      });
    }

    // Log any other unexpected errors
    console.error('Unexpected error:', error);
    res.status(500).json({
      message: 'Failed to create menu item',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update menu item
router.put('/menu-items/:id', vendorAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      vendorId: req.user.userId
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('vendorId', 'name email phone');

    res.json({
      message: 'Menu item updated successfully',
      menuItem: updatedMenuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete menu item
router.delete('/menu-items/:id', vendorAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      vendorId: req.user.userId
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle menu item availability
router.patch('/menu-items/:id/availability', vendorAuth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      vendorId: req.user.userId
    });

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.json({
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      menuItem
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor orders
router.get('/orders', vendorAuth, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = { vendorId: req.user.userId };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    console.log('Fetching vendor orders with query:', query);
    console.log('Vendor ID from auth:', req.user.userId);

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.menuItem', 'name price image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('Found vendor orders:', orders.length);

    // Debug: log the vendorId of each order
    orders.forEach(order => {
      console.log(`Order ${order.orderNumber} vendorId:`, order.vendorId);
    });

    const total = await Order.countDocuments(query);

    // Return with success flag for consistency
    res.json({ 
      success: true,
      orders: orders,
      total: total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor dashboard stats
router.get('/dashboard', vendorAuth, async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vendor analytics
router.get('/analytics', vendorAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = {
      startDate: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: endDate ? new Date(endDate) : new Date()
    };
    
    const analytics = await analyticsService.getVendorAnalytics(req.user.userId, dateRange);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vendor menu items
router.get('/menu', vendorAuth, async (req, res) => {
  try {
    const menuItems = await menuService.getMenuItems({ vendorId: req.user.userId });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vendor profile
router.put('/profile', vendorAuth, async (req, res) => {
  try {
    const vendor = await userService.updateProfile(req.user.userId, req.body);
    res.json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status route
router.patch('/orders/:id/status', vendorAuth, async (req, res) => {
  try {
    const { status, rejectionReason, rejectedItems } = req.body;
    const validStatuses = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'rejected', 'partially_rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      vendorId: req.user.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or you are not authorized to update this order' });
    }

    // Handle partial rejection
    if (status === 'partially_rejected' && rejectedItems && rejectedItems.length > 0) {
      // Mark specific items as rejected
      order.items = order.items.map(item => {
        if (rejectedItems.includes(item.itemId?.toString() || item.menuItem?.toString())) {
          return { ...item.toObject(), rejected: true };
        }
        return item;
      });
      
      // Add rejection reason
      order.rejectionReason = rejectionReason || 'Items unavailable';
      order.status = 'partially_rejected';
      
      // Recalculate total amount excluding rejected items
      const originalTotal = order.totalAmount;
      order.totalAmount = order.items
        .filter(item => !item.rejected)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      order.refundAmount = originalTotal - order.totalAmount;
    } else {
      // Update whole order status
      order.status = status;
      
      if (status === 'rejected' || status === 'cancelled') {
        order.rejectionReason = rejectionReason || 'Order cannot be fulfilled';
        order.refundAmount = order.totalAmount;
        order.totalAmount = 0;
      }
      
      if (status === 'delivered') {
        order.deliveredAt = new Date();
        
        // Update vendor analytics on delivery
        await orderService.updateVendorAnalytics(order);
      }
    }
    
    await order.save();
    
    // Send notification to user via Socket.IO if available
    if (req.io) {
      req.io.emit(`order_${order._id}`, { 
        status: order.status,
        message: `Your order #${order.orderNumber} is now ${order.status}`
      });
    }
    
    res.status(200).json({ 
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
