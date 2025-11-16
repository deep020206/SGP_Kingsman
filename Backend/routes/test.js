const express = require('express');
const router = express.Router();
const otpService = require('../services/otpService');
const os = require('os');

// Health check endpoint
router.get('/health', (req, res) => {
  const networkInterfaces = os.networkInterfaces();
  const ipAddresses = [];
  
  Object.keys(networkInterfaces).forEach(interface => {
    networkInterfaces[interface].forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        ipAddresses.push(details.address);
      }
    });
  });

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Kingsman Backend',
    version: '1.0.0',
    hostname: os.hostname(),
    ipAddresses,
    uptime: process.uptime()
  });
});

// Test route to check OTP service
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('🧪 Testing email send to:', email);
    
    // Generate a test OTP
    const testOTP = '123456';
    
    // Try to send the email
    const result = await otpService.sendOTPEmail(email, testOTP, 'test');
    
    console.log('📧 Email send result:', result);
    
    res.json({ 
      message: 'Test email attempt completed',
      result: result,
      testOTP: testOTP
    });
    
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message 
    });
  }
});

module.exports = router;