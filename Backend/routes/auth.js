const express = require('express');
const userService = require('../services/userService');
const { auth } = require('../middleware/auth');
const otpService = require('../services/otpService');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user.userId, currentPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    await userService.logout(req.user.userId);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    await userService.requestPasswordReset(email);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await userService.resetPassword(token, newPassword);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send OTP for email verification (registration)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email || !userId) {
      return res.status(400).json({ message: 'Email and userId are required' });
    }

    const result = await otpService.sendRegistrationOTP(userId, email);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for login verification
router.post('/send-login-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const result = await otpService.sendLoginOTP(email);
    
    if (result.success) {
      res.json({ 
        message: result.message,
        userId: result.userId 
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Send login OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: 'UserId and OTP are required' });
    }

    const result = await otpService.verifyOTP(userId, otp);
    
    if (result.success) {
      // Generate JWT token after successful verification
      const { user, token } = await userService.loginById(userId);
      
      res.json({ 
        message: result.message,
        token,
        user
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for signup (before creating account)


// Verify signup OTP and create account
router.post('/verify-signup-otp', async (req, res) => {
  try {
    console.log('🔍 Verify signup OTP request body:', JSON.stringify(req.body, null, 2));
    const { sessionId, otp, userData } = req.body;

    console.log('📋 Extracted values:', { sessionId, otp, userData });

    if (!sessionId || !otp || !userData) {
      console.log('❌ Missing required fields:', { 
        hasSessionId: !!sessionId, 
        hasOtp: !!otp, 
        hasUserData: !!userData 
      });
      return res.status(400).json({ message: 'Session ID, OTP, and user data are required' });
    }

    const result = await otpService.verifySignupOTP(sessionId, otp, userData);
    
    if (result.success) {
      res.json({ 
        message: 'Account created and verified successfully',
        token: result.token,
        user: result.user
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend signup OTP
router.post('/resend-signup-otp', async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({ message: 'Temp token is required' });
    }

    const result = await otpService.resendSignupOTP(tempToken);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Resend signup OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for signup verification (before creating account)
router.post('/send-signup-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const result = await otpService.sendSignupOTP(email);
    
    if (result.success) {
      res.json({ 
        message: result.message,
        sessionId: result.sessionId 
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Send signup OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify signup OTP and create account
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { sessionId, otp, userData } = req.body;

    if (!sessionId || !otp || !userData) {
      return res.status(400).json({ message: 'SessionId, OTP and user data are required' });
    }

    const result = await otpService.verifySignupOTP(sessionId, otp, userData);
    
    if (result.success) {
      res.status(201).json({ 
        message: result.message,
        token: result.token,
        user: result.user
      });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId, email, type = 'registration', sessionId } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let result;
    if (type === 'login') {
      result = await otpService.sendLoginOTP(email);
    } else if (type === 'signup' && sessionId) {
      result = await otpService.resendSignupOTP(sessionId, email);
    } else {
      if (!userId) {
        return res.status(400).json({ message: 'UserId is required for registration OTP' });
      }
      result = await otpService.sendRegistrationOTP(userId, email);
    }
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
