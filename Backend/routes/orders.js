const express = require('express');
const orderService = require('../services/orderService');
const { auth, vendorAuth } = require('../middleware/auth');

const router = express.Router();

// Get vendor orders
router.get('/', vendorAuth, async (req, res) => {
  try {
    const result = await orderService.getVendorOrders(req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const order = await orderService.createOrder({
      ...req.body,
      userId: req.user.userId
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Create group order
router.post('/group', auth, async (req, res) => {
  try {
    const groupOrder = await orderService.createGroupOrder({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json(groupOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vendor's orders
router.get('/vendor-orders', vendorAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const result = await orderService.getVendorOrders(req.user.userId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Compatibility route for /orders/vendor (Dashboard.js uses this)
router.get('/vendor', vendorAuth, async (req, res) => {
  try {
    const result = await orderService.getVendorOrders(req.user.userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (vendor only)
router.patch('/:id/status', vendorAuth, async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(
      req.params.id,
      req.user.userId,
      req.body.status
    );
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Join group order
router.post('/group/:groupId/join', auth, async (req, res) => {
  try {
    const groupOrder = await orderService.joinGroupOrder(
      req.params.groupId,
      req.user.userId,
      req.body
    );
    res.json(groupOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await orderService.getOrderDetails(req.params.id, req.user.userId);
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Cancel order (user only)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.userId);
    
    // Send notification to vendor via Socket.IO if available
    if (req.io && order.vendorId) {
      req.io.emit(`vendor_${order.vendorId}`, { 
        type: 'order_cancelled',
        orderId: order._id,
        orderNumber: order.orderNumber || 'Unknown',
        message: `Order #${order.orderNumber || 'Unknown'} has been cancelled by the customer`
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Order cancelled successfully', 
      order 
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
