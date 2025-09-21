const express = require('express');
const userService = require('../services/userService');
const { auth } = require('../middleware/auth');

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

module.exports = router;
