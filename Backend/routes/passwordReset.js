const express = require('express');
const userService = require('../services/userService');
const { validateResetToken } = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();

// Rate limiting for password reset attempts
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many password reset attempts, please try again after an hour'
});

// Request password reset
router.post('/forgot-password', resetLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    await userService.sendPasswordResetEmail(email);
    res.json({ 
      message: 'If an account exists with this email, you will receive password reset instructions' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// Reset password with token
router.post('/reset-password/:token', validateResetToken, async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await userService.resetPassword(token, password);
    res.json({ message: 'Password successfully reset' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify reset token
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    await userService.verifyResetToken(token);
    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false });
  }
});

module.exports = router;