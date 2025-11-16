const express = require('express');
const notificationService = require('../services/notificationService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const result = await notificationService.getUserNotifications(req.user.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get notification count
router.get('/count', auth, async (req, res) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.userId);

    res.json({
      success: true,
      unreadCount: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.userId
    );

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.userId);

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await notificationService.deleteNotification(
      req.params.id,
      req.user.userId
    );

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats(req.user.userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
