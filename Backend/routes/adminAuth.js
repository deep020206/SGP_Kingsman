const express = require('express');
const adminAuthService = require('../services/adminAuthService');
const { auth } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

// Middleware to check if user is super admin (damarodiya8314@gmail.com)
const superAdminAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is the super admin (first authorized email)
    const authorizedEmails = adminAuthService.getAuthorizedEmails();
    const superAdminEmail = authorizedEmails[0]; // First email is super admin
    
    if (user.email.toLowerCase() !== superAdminEmail) {
      return res.status(403).json({ 
        message: 'Access denied. Only super admin can manage authorized emails.' 
      });
    }

    next();
  } catch (error) {
    console.error('Super admin auth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current admin authorization status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const authStatus = adminAuthService.getAuthorizationStatus(user.email);
    const authorizedEmails = adminAuthService.getAuthorizedEmails();
    const isSuperAdmin = user.email.toLowerCase() === authorizedEmails[0];

    res.json({
      currentUser: {
        email: user.email,
        role: user.role,
        ...authStatus
      },
      isSuperAdmin,
      canManageAuthorizations: isSuperAdmin,
      totalAuthorizedEmails: authorizedEmails.length
    });
  } catch (error) {
    console.error('Get admin status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all authorized admin emails (super admin only)
router.get('/authorized-emails', auth, superAdminAuth, async (req, res) => {
  try {
    const authorizedEmails = adminAuthService.getAuthorizedEmails();
    
    res.json({
      authorizedEmails,
      count: authorizedEmails.length,
      message: 'These emails are authorized for admin access'
    });
  } catch (error) {
    console.error('Get authorized emails error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new authorized admin email (super admin only)
router.post('/authorized-emails', auth, superAdminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const success = adminAuthService.addAuthorizedEmail(email);
    
    if (success) {
      res.status(201).json({ 
        message: `Email ${email} has been authorized for admin access`,
        authorizedEmails: adminAuthService.getAuthorizedEmails()
      });
    } else {
      res.status(409).json({ 
        message: 'Email is already authorized for admin access' 
      });
    }
  } catch (error) {
    console.error('Add authorized email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove authorized admin email (super admin only)
router.delete('/authorized-emails/:email', auth, superAdminAuth, async (req, res) => {
  try {
    const { email } = req.params;
    
    // Prevent removing the super admin email
    const authorizedEmails = adminAuthService.getAuthorizedEmails();
    const superAdminEmail = authorizedEmails[0];
    
    if (email.toLowerCase() === superAdminEmail) {
      return res.status(403).json({ 
        message: 'Cannot remove super admin email' 
      });
    }

    const success = adminAuthService.removeAuthorizedEmail(email);
    
    if (success) {
      // Update any existing admin users to customer role
      await User.updateMany(
        { 
          email: { $regex: new RegExp(`^${email}$`, 'i') },
          role: 'admin'
        },
        { role: 'customer' }
      );

      res.json({ 
        message: `Email ${email} has been removed from admin authorization`,
        authorizedEmails: adminAuthService.getAuthorizedEmails()
      });
    } else {
      res.status(404).json({ 
        message: 'Email not found in authorized list' 
      });
    }
  } catch (error) {
    console.error('Remove authorized email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Check if a specific email is authorized (for registration validation)
router.post('/check-authorization', async (req, res) => {
  try {
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const validation = adminAuthService.validateAdminRegistration(email, role);
    const authStatus = adminAuthService.getAuthorizationStatus(email);
    
    res.json({
      email,
      requestedRole: role || 'customer',
      ...validation,
      ...authStatus
    });
  } catch (error) {
    console.error('Check authorization error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reload authorized emails from environment (super admin only)
router.post('/reload-config', auth, superAdminAuth, async (req, res) => {
  try {
    adminAuthService.reloadAuthorizedEmails();
    
    res.json({ 
      message: 'Admin authorization configuration reloaded successfully',
      authorizedEmails: adminAuthService.getAuthorizedEmails()
    });
  } catch (error) {
    console.error('Reload config error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;