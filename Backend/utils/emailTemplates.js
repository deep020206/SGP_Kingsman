const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #1a1a1a;
      color: #fff;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background: #fff;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 0 0 5px 5px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #4CAF50;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Kingsman Restaurant</h1>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Kingsman Restaurant. All rights reserved.</p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

const templates = {
  welcome: (data) => ({
    subject: 'Welcome to Kingsman!',
    html: baseTemplate(`
      <h2>Welcome to Kingsman, ${data.name}!</h2>
      <p>Thank you for creating an account with us. We're excited to have you join our community!</p>
      <p>With your account, you can:</p>
      <ul>
        <li>Order your favorite meals</li>
        <li>Track your orders in real-time</li>
        <li>Save your favorite items</li>
        <li>Receive exclusive offers</li>
      </ul>
      <a href="${data.menuUrl || process.env.FRONTEND_URL + '/menu'}" class="button">View Our Menu</a>
      <p>If you have any questions, feel free to contact us anytime.</p>
    `)
  }),

  orderConfirmation: (data) => ({
    subject: `Order Confirmation #${data.order.orderNumber}`,
    html: baseTemplate(`
      <h2>Order Confirmation</h2>
      <p>Hi ${data.name},</p>
      <p>Thank you for your order! Here are your order details:</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p><strong>Order Number:</strong> ${data.order.orderNumber}</p>
        <p><strong>Total Amount:</strong> $${data.order.totalAmount.toFixed(2)}</p>
        <h3>Items:</h3>
        <ul>
          ${data.order.items.map(item => `
            <li>
              ${item.quantity}x ${item.menuItem.name} - $${item.totalItemPrice.toFixed(2)}
              ${item.customizations ? `<br>Customizations: ${item.customizations}` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
      <a href="${data.trackingUrl}" class="button">Track Your Order</a>
    `)
  }),

  orderStatusUpdate: (data) => {
    const statusMessages = {
      accepted: 'Your order has been accepted and is being prepared',
      preparing: 'Your order is now being prepared in our kitchen',
      ready: 'Your order is ready for pickup',
      delivered: 'Your order has been delivered. Enjoy!',
      cancelled: 'Your order has been cancelled'
    };

    return {
      subject: `Order Status Update #${data.order.orderNumber}`,
      html: baseTemplate(`
        <h2>Order Status Update</h2>
        <p>Hi ${data.name},</p>
        <p><strong>Order #${data.order.orderNumber}</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
          <p><strong>Status:</strong> ${data.order.status.toUpperCase()}</p>
          <p>${statusMessages[data.order.status]}</p>
        </div>
        <a href="${data.trackingUrl}" class="button">View Order Details</a>
      `)
    };
  },

  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${data.name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="${data.resetUrl}" class="button">Reset Password</a>
      <p>This link will expire in ${data.expiryHours || 1} hour(s).</p>
      <p>If you didn't request this, please ignore this email or contact us if you have concerns.</p>
    `)
  }),

  paymentConfirmation: (order) => ({
    subject: `Payment Confirmation #${order.orderNumber}`,
    html: baseTemplate(`
      <h2>Payment Confirmation</h2>
      <p>Your payment for order #${order.orderNumber} has been successfully processed.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p><strong>Amount Paid:</strong> $${order.totalAmount.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Transaction Date:</strong> ${new Date(order.paidAt).toLocaleString()}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">View Order Details</a>
    `)
  }),

  refundConfirmation: (order, amount) => ({
    subject: `Refund Confirmation #${order.orderNumber}`,
    html: baseTemplate(`
      <h2>Refund Confirmation</h2>
      <p>Your refund for order #${order.orderNumber} has been processed.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
        <p><strong>Refund Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Original Order Total:</strong> $${order.totalAmount.toFixed(2)}</p>
        <p><strong>Refund Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>The refund should appear in your account within 5-10 business days.</p>
    `)
  })
};

module.exports = templates;