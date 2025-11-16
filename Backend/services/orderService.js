const { Order, GroupOrder, MenuItem, VendorAnalytics, User, Notification } = require('../models');
const notificationService = require('./notificationService');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class OrderService {
  async getVendorOrders(vendorId, status = null) {
    try {
      console.log('OrderService: Getting orders for vendor:', vendorId);
      
      let query = { vendorId: vendorId };
      
      if (status) {
        query.status = status;
      }
      
      console.log('OrderService: Query:', query);
      
      const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate('items.menuItem')
        .sort({ createdAt: -1 });
      
      console.log('OrderService: Found orders:', orders.length);
      
      return {
        success: true,
        orders: orders
      };
    } catch (error) {
      console.error('OrderService: Error getting vendor orders:', error);
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      // Generate unique order number
      const prefix = process.env.NODE_ENV === 'test' ? `TEST${Math.random().toString(36).substring(7)}` : 'ORD';
      const orderNumber = `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
      
      // Validate items and get menu details
      const itemDetails = await Promise.all(
        orderData.items.map(async (item) => {
          const menuItem = await MenuItem.findById(item.menuItem);
          if (!menuItem) {
            throw new Error(`Menu item not found: ${item.menuItem}`);
          }
          if (!menuItem.isAvailable) {
            throw new Error(`Item ${menuItem.name} is not available`);
          }
          
          console.log(`Menu item ${menuItem.name} belongs to vendor:`, menuItem.vendorId);
          
          // Calculate instruction price modifiers
          let instructionPrice = 0;
          if (item.selectedInstructions && item.selectedInstructions.length > 0) {
            instructionPrice = item.selectedInstructions.reduce((total, instruction) => {
              return total + (instruction.priceModifier || 0);
            }, 0);
          }
          
          const totalItemPrice = menuItem.price + instructionPrice;
          
          return {
            menuItem: menuItem._id,
            vendorId: menuItem.vendorId, // Include vendorId from menu item
            quantity: parseInt(item.quantity) || 1,
            price: menuItem.price, // Base price
            selectedInstructions: item.selectedInstructions || [],
            customInstructions: item.customInstructions || '',
            totalItemPrice: totalItemPrice // Base price + instruction modifiers
          };
        })
      );

      // Determine vendorId from menu items (assuming all items are from the same vendor)
      // If orderData.vendorId is not provided, get it from the first menu item
      let vendorId = orderData.vendorId;
      if (!vendorId && itemDetails.length > 0) {
        // Get vendorId from the first menu item
        const firstMenuItem = await MenuItem.findById(itemDetails[0].menuItem);
        vendorId = firstMenuItem.vendorId;
        console.log('Determined vendorId from menu items:', vendorId);
      }
      
      if (!vendorId) {
        throw new Error('Unable to determine vendor for this order');
      }

      // Calculate total amount using totalItemPrice (includes instruction modifiers)
      const totalAmount = itemDetails.reduce((sum, item) => sum + (item.totalItemPrice * item.quantity), 0);

      // Create and save the order
      const order = await Order.create({
        orderNumber,
        userId: orderData.userId,
        vendorId: vendorId, // Use the determined vendorId
        items: itemDetails,
        totalAmount: totalAmount,
        status: 'pending'
      });

      // Populate user details for email
      let populatedOrder = await Order.findById(order._id)
        .populate('userId', 'name email')
        .populate('items.menuItem');

      // Send order confirmation email
      try {
        await emailService.sendOrderConfirmation(
          populatedOrder.userId,
          populatedOrder
        );
      } catch (emailError) {
        logger.error('Failed to send order confirmation email:', emailError);
        // Don't throw error - order should succeed even if email fails
      }
      
      console.log('Order created with vendorId:', vendorId, 'Order ID:', order._id);

      // Send notifications
      try {
        // Send email notification
        await emailService.sendOrderConfirmation(
          populatedOrder.userId,
          populatedOrder
        );

        // Send push notification
        await notificationService.sendOrderNotification(
          orderData.userId,
          populatedOrder,
          'order_placed'
        );
      } catch (notificationError) {
        logger.error('Failed to send notifications:', notificationError);
        // Don't fail the order creation if notification fails
      }

      return populatedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId) {
    try {
      console.log('Fetching orders for user:', userId);
      
      const orders = await Order.find({ userId })
        .populate({
          path: 'items.menuItem',
          select: 'name price description image category isAvailable'
        })
        .populate({
          path: 'vendorId',
          select: 'name email phone'
        })
        .sort({ createdAt: -1 })
        .lean();

      console.log(`Found ${orders.length} orders for user`);
      
      // Transform the orders to include computed properties
      const transformedOrders = orders.map(order => ({
        ...order,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        formattedDate: new Date(order.createdAt).toLocaleString(),
        items: order.items.map(item => ({
          ...item,
          totalPrice: item.price * item.quantity
        }))
      }));

      return { 
        success: true, 
        orders: transformedOrders,
        count: transformedOrders.length
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders: ' + error.message);
    }
  }

  async createGroupOrder(groupOrderData) {
    const groupOrder = new GroupOrder({
      ...groupOrderData,
      groupId: `GRP${Date.now()}${Math.floor(Math.random() * 1000)}`
    });

    await groupOrder.save();
    return groupOrder;
  }

  async updateOrderStatus(orderId, vendorId, status) {
    const order = await Order.findOneAndUpdate(
      { _id: orderId, vendorId },
      { 
        $set: { 
          status,
          ...(status === 'delivered' ? { deliveredAt: new Date() } : {})
        }
      },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!order) {
      throw new Error('Order not found or unauthorized');
    }

    // Send both email and push notifications for status update
    try {
      // Send email notification
      await emailService.sendOrderStatusUpdate(
        order.userId,
        order
      );

      // Send push notification
      await notificationService.sendOrderNotification(
        order.userId._id,
        order,
        status,
        { estimatedTime: '30 minutes' }
      );
    } catch (notificationError) {
      logger.error('Failed to send notifications:', notificationError);
    }

    // Update analytics if order is delivered
    if (status === 'delivered') {
      await this.updateVendorAnalytics(order);
    }

    return order;
  }

  async updateVendorAnalytics(order) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const analytics = await VendorAnalytics.findOne({
      vendorId: order.vendorId,
      date
    });

    if (!analytics) {
      await VendorAnalytics.create({
        vendorId: order.vendorId,
        date,
        totalOrders: 1,
        totalRevenue: order.totalAmount,
        popularItems: order.items.map(item => ({
          menuItemId: item.menuItem,
          orderCount: 1
        }))
      });
    } else {
      analytics.totalOrders += 1;
      analytics.totalRevenue += order.totalAmount;
      
      // Update popular items
      order.items.forEach(orderItem => {
        const existingItem = analytics.popularItems.find(
          item => item.menuItemId.toString() === orderItem.menuItem.toString()
        );
        
        if (existingItem) {
          existingItem.orderCount += 1;
        } else {
          analytics.popularItems.push({
            menuItemId: orderItem.menuItem,
            orderCount: 1
          });
        }
      });

      await analytics.save();
    }
  }

  async cancelOrder(orderId, userId) {
    try {
      // Find the order and check if the user owns it
      const order = await Order.findOne({ _id: orderId, userId });
      
      if (!order) {
        throw new Error('Order not found or unauthorized');
      }
      
      // Check if the order can be cancelled (only pending or confirmed orders)
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }
      
      // Update the order status to cancelled
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      await order.save();
      
      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  async getOrderDetails(orderId, userId) {
    try {
      const order = await Order.findById(orderId)
        .populate('userId', 'name email phone')
        .populate('items.menuItem')
        .lean();

      if (!order) {
        throw new Error('Order not found');
      }

      // Check authorization - users can only see their own orders, vendors can see orders with their items
      if (userId && order.userId._id.toString() !== userId.toString()) {
        // Check if this is a vendor looking at an order with their items
        const userDetails = await User.findById(userId).lean();
        if (userDetails?.role !== 'vendor') {
          throw new Error('Unauthorized access to order');
        }
      }

      return {
        ...order,
        formattedDate: new Date(order.createdAt).toLocaleString()
      };
    } catch (error) {
      console.error('Error getting order details:', error);
      throw error;
    }
  }
}

module.exports = new OrderService();