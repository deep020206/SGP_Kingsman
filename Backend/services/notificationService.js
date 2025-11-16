const { Notification, User, Order } = require('../models');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class NotificationService {
  // Create a new notification
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Send real-time notification via Socket.IO
      if (global.io) {
        global.io.to(`user-${notification.userId}`).emit('new-notification', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          createdAt: notification.createdAt
        });
      }
      
      logger.info(`Notification created: ${notification.type} for user ${notification.userId}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const query = { userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .populate('data.orderId', 'orderNumber status totalAmount')
        .populate('data.vendorId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ userId, isRead: false });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      logger.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Get unread count only (optimized for frequent calls)
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({ 
        userId, 
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });
      return count;
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }

      return notification;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      logger.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
      return result;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });

      if (!notification) {
        throw new Error('Notification not found or unauthorized');
      }

      return notification;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Order-related notification templates
  async sendOrderNotification(userId, order, type, additionalData = {}) {
    const templates = {
      order_placed: {
        title: 'Order Placed Successfully! 🎉',
        message: `Your order #${order.orderNumber} has been placed and is being processed. Total: ₹${order.totalAmount}`,
        priority: 'high'
      },
      order_accepted: {
        title: 'Order Accepted! ✅',
        message: `Great news! Your order #${order.orderNumber} has been accepted and is being prepared.`,
        priority: 'high'
      },
      order_preparing: {
        title: 'Your Order is Being Prepared! 👨‍🍳',
        message: `Order #${order.orderNumber} is now being prepared. Estimated time: ${additionalData.estimatedTime || '30 minutes'}`,
        priority: 'medium'
      },
      order_ready: {
        title: 'Order Ready for Pickup! 🍕',
        message: `Your order #${order.orderNumber} is ready! Please come to collect it.`,
        priority: 'high'
      },
      order_delivered: {
        title: 'Order Delivered! 🚚',
        message: `Your order #${order.orderNumber} has been delivered. Enjoy your meal!`,
        priority: 'medium'
      },
      order_cancelled: {
        title: 'Order Cancelled',
        message: `Your order #${order.orderNumber} has been cancelled. ${additionalData.reason || ''}`,
        priority: 'high'
      },
      order_rejected: {
        title: 'Order Rejected',
        message: `Unfortunately, your order #${order.orderNumber} has been rejected. ${additionalData.reason || 'Please try again later.'}`,
        priority: 'high'
      }
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    return await this.createNotification({
      userId,
      type,
      title: template.title,
      message: template.message,
      priority: template.priority,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        vendorId: order.vendorId,
        amount: order.totalAmount,
        ...additionalData
      }
    });
  }

  // Promotion notifications
  async sendPromotionNotification(userIds, promotionData) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: 'promotion',
        title: promotionData.title || 'Special Offer! 🎁',
        message: promotionData.message,
        priority: 'medium',
        data: {
          promotionId: promotionData.id,
          actionUrl: promotionData.actionUrl,
          ...promotionData.data
        }
      }));

      await Notification.insertMany(notifications);
      logger.info(`Sent promotion notification to ${userIds.length} users`);
    } catch (error) {
      logger.error('Error sending promotion notifications:', error);
      throw error;
    }
  }

  // System notifications
  async sendSystemNotification(userIds, systemData) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: 'system',
        title: systemData.title || 'System Update',
        message: systemData.message,
        priority: systemData.priority || 'medium',
        data: systemData.data || {}
      }));

      await Notification.insertMany(notifications);
      logger.info(`Sent system notification to ${userIds.length} users`);
    } catch (error) {
      logger.error('Error sending system notifications:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId) {
    try {
      const stats = await Notification.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: ['$isRead', 0, 1] } },
            byType: {
              $push: {
                type: '$type',
                isRead: '$isRead'
              }
            }
          }
        }
      ]);

      return stats[0] || { total: 0, unread: 0, byType: [] };
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      throw error;
    }
  }

  // Clean up old notifications
  async cleanupOldNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });

      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
