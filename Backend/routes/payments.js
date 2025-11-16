const express = require('express');
const paymentService = require('../services/paymentService');
const { auth, vendorAuth } = require('../middleware/auth');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');
const { Order } = require('../models');

const router = express.Router();

// Create payment intent for order
router.post('/create-payment-intent/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const paymentIntent = await paymentService.createPaymentIntent(orderId);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    logger.error('Create payment intent failed', {
      orderId: req.params.orderId,
      error: error.message
    });
    res.status(400).json({ message: error.message });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await paymentService.handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook handling failed', { error: error.message });
    res.status(400).json({ message: error.message });
  }
});

// Initiate refund (vendor only)
router.post('/refund/:orderId', vendorAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      throw new ValidationError('Amount and reason are required');
    }

    const refund = await paymentService.initiateRefund(orderId, amount, reason);
    res.json(refund);
  } catch (error) {
    logger.error('Refund initiation failed', {
      orderId: req.params.orderId,
      error: error.message
    });
    res.status(400).json({ message: error.message });
  }
});

// Get payment status
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .select('paymentStatus paymentIntentId refundStatus refundAmount');
    
    if (!order) {
      throw new ValidationError('Order not found');
    }

    res.json({
      paymentStatus: order.paymentStatus,
      refundStatus: order.refundStatus,
      refundAmount: order.refundAmount
    });
  } catch (error) {
    logger.error('Get payment status failed', {
      orderId: req.params.orderId,
      error: error.message
    });
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;