const nodemailer = require('nodemailer');
const templates = require('../utils/emailTemplates');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify transporter on startup
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connected successfully');
    } catch (error) {
      logger.error('Email service connection failed', { error: error.message });
      // Don't throw error - allows app to start even if email service is down
    }
  }

  async sendEmail(to, templateName, data) {
    try {
      if (!templates[templateName]) {
        throw new Error(`Email template '${templateName}' not found`);
      }

      const { subject, html } = templates[templateName](data);

      const mailOptions = {
        from: `"Kingsman Restaurant" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info('Email sent successfully', {
        template: templateName,
        messageId: result.messageId,
        to
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Email sending failed', {
        template: templateName,
        to,
        error: error.message
      });

      // Queue for retry if temporary failure
      if (this.isTemporaryError(error)) {
        await this.queueForRetry(to, templateName, data);
      }

      return { success: false, error: error.message };
    }
  }

  isTemporaryError(error) {
    // Check for common temporary email errors
    const temporaryErrorCodes = [
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ESOCKET'
    ];
    return temporaryErrorCodes.includes(error.code);
  }

  async queueForRetry(to, templateName, data) {
    // TODO: Implement retry queue with Redis/Bull
    logger.info('Email queued for retry', {
      template: templateName,
      to
    });
  }

  // User-related emails
  async sendWelcomeEmail(user) {
    const result = await this.sendEmail(user.email, 'welcome', {
      name: user.name,
      menuUrl: `${process.env.FRONTEND_URL}/menu`
    });
    return result.success;
  }

  async sendPasswordResetEmail(user, resetToken) {
    const result = await this.sendEmail(user.email, 'passwordReset', {
      name: user.name,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
      expiryHours: 1
    });
    return result.success;
  }

  // Order-related emails
  async sendOrderConfirmation(user, order) {
    const result = await this.sendEmail(user.email, 'orderConfirmation', {
      name: user.name,
      order,
      trackingUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`
    });
    return result.success;
  }

  async sendOrderStatusUpdate(user, order) {
    return this.sendEmail(user.email, 'orderStatusUpdate', {
      name: user.name,
      order,
      trackingUrl: `${process.env.FRONTEND_URL}/orders/${order._id}`
    });
  }

  // Payment-related emails
  async sendPaymentConfirmation(user, order, payment) {
    return this.sendEmail(user.email, 'paymentConfirmation', {
      name: user.name,
      order,
      payment,
      receiptUrl: payment.receipt_url
    });
  }

  async sendRefundConfirmation(user, order, refund) {
    return this.sendEmail(user.email, 'refundConfirmation', {
      name: user.name,
      order,
      refund
    });
  }

  // Bulk email sending with rate limiting
  async sendBulkEmails(recipients, templateName, data) {
    const results = [];
    for (const recipient of recipients) {
      // Check rate limit
      if (this.rateLimiter.tryRemoveTokens(1)) {
        const result = await this.sendEmail(recipient, templateName, data);
        results.push({ recipient, ...result });
      } else {
        results.push({
          recipient,
          success: false,
          error: 'Rate limit exceeded'
        });
        logger.info('Rate limit exceeded for bulk emails', {
          template: templateName,
          recipient
        });
      }
      // Add small delay between sends
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return results;
  }
}

module.exports = new EmailService();