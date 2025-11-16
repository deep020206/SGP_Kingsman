const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const logger = require('../utils/logger');
const { ValidationError } = require('../utils/errors');

class PaymentService {
  async createPaymentIntent(order) {
    try {
      // Calculate amount in cents
      const amount = Math.round(order.totalAmount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber
        }
      });

      // Update order with payment intent
      await Order.findByIdAndUpdate(order._id, {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending'
      });

      logger.info('Payment intent created', {
        orderId: order._id,
        amount: order.totalAmount,
        paymentIntentId: paymentIntent.id
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Payment intent creation failed', {
        orderId: order._id,
        error: error.message
      });
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        case 'charge.refunded':
          await this.handleRefund(event.data.object);
          break;
      }
    } catch (error) {
      logger.error('Webhook handling failed', {
        eventType: event.type,
        error: error.message
      });
      throw error;
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    const order = await Order.findOne({
      paymentIntentId: paymentIntent.id
    });

    if (!order) {
      throw new ValidationError('Order not found');
    }

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'completed',
      paidAt: new Date()
    });

    logger.info('Payment successful', {
      orderId: order._id,
      paymentIntentId: paymentIntent.id
    });
  }

  async handlePaymentFailure(paymentIntent) {
    const order = await Order.findOne({
      paymentIntentId: paymentIntent.id
    });

    if (!order) {
      throw new ValidationError('Order not found');
    }

    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'failed',
      paymentError: paymentIntent.last_payment_error?.message
    });

    logger.info('Payment failed', {
      orderId: order._id,
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message
    });
  }

  async initiateRefund(orderId, amount, reason) {
    const order = await Order.findById(orderId);
    
    if (!order || !order.paymentIntentId) {
      throw new ValidationError('Order not found or payment not processed');
    }

    const refundAmount = Math.round(amount * 100); // Convert to cents

    try {
      const refund = await stripe.refunds.create({
        payment_intent: order.paymentIntentId,
        amount: refundAmount,
        reason
      });

      await Order.findByIdAndUpdate(orderId, {
        refundStatus: 'pending',
        refundId: refund.id,
        refundAmount: amount,
        refundReason: reason
      });

      logger.info('Refund initiated', {
        orderId,
        refundId: refund.id,
        amount,
        reason
      });

      return refund;
    } catch (error) {
      logger.error('Refund initiation failed', {
        orderId,
        error: error.message
      });
      throw error;
    }
  }

  async handleRefund(charge) {
    const order = await Order.findOne({
      paymentIntentId: charge.payment_intent
    });

    if (!order) {
      throw new ValidationError('Order not found');
    }

    await Order.findByIdAndUpdate(order._id, {
      refundStatus: 'completed',
      refundedAt: new Date()
    });

    logger.info('Refund completed', {
      orderId: order._id,
      chargeId: charge.id
    });
  }
}

module.exports = new PaymentService();