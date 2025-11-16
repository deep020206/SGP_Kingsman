const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('./emailService');
const logger = require('../utils/logger');
const adminAuthService = require('./adminAuthService');

class UserService {
  async register(userData) {
    const { email, password } = userData;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Automatically assign role based on email authorization
    const role = adminAuthService.isAuthorizedAdmin(email) ? 'admin' : 'customer';
    
    // Log role assignment for authorized admin
    if (role === 'admin') {
      console.log(`🔐 Auto-assigning admin role to authorized email: ${email}`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with assigned role
    const user = new User({
      ...userData,
      role: role,
      password: hashedPassword
    });

    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Don't throw error - registration should succeed even if email fails
    }

    return user;
  }

  async login(email, password) {
    // Find user
    let user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Check if user should have admin privileges
    const shouldBeAdmin = adminAuthService.isAuthorizedAdmin(email);
    
    // Update role if necessary
    if (shouldBeAdmin && user.role !== 'admin') {
      console.log(`🔐 Upgrading user ${email} to admin role`);
      user.role = 'admin';
      await user.save();
    } else if (!shouldBeAdmin && user.role === 'admin') {
      console.log(`⬇️ Downgrading user ${email} from admin role`);
      user.role = 'customer';
      await user.save();
    }

    // Generate token with current role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user, token };
  }

  async loginById(userId) {
    // Find user by ID (for OTP verification)
    let user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user should have admin privileges
    const shouldBeAdmin = adminAuthService.isAuthorizedAdmin(user.email);
    
    // Update role if necessary
    if (shouldBeAdmin && user.role !== 'admin') {
      console.log(`🔐 Upgrading user ${user.email} to admin role`);
      user.role = 'admin';
      await user.save();
    } else if (!shouldBeAdmin && user.role === 'admin') {
      console.log(`⬇️ Downgrading user ${user.email} from admin role`);
      user.role = 'customer';
      await user.save();
    }

    // Generate token with current role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user without password
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();
  }

  async logout(userId) {
    // In a more complex implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Clear any refresh tokens
    // 3. Clear any session data
    return true;
  }

  async requestPasswordReset(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('If a user with this email exists, a password reset link will be sent');
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      throw new Error('Failed to send password reset email');
    }
    
    return resetToken;
  }

  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}

module.exports = new UserService();