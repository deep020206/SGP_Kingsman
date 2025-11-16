const nodemailer = require('nodemailer');
const User = require('../models/User');
const crypto = require('crypto');

// Global storage for signup OTPs is managed by the individual methods

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

class OTPService {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email
  async sendOTPEmail(email, otp, purpose = 'verification') {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Kingsman - Your ${purpose} Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">Kingsman</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Food Ordering Platform</p>
            </div>
            
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello,</p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Your verification code for ${purpose} is:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              This code will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              If you didn't request this code, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                © 2025 Kingsman. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, message: 'Failed to send OTP email' };
    }
  }

  // Generate and store OTP for user
  async generateAndStoreOTP(userId) {
    try {
      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      await User.findByIdAndUpdate(userId, {
        otp: otp,
        otpExpiry: otpExpiry
      });

      return { success: true, otp };
    } catch (error) {
      console.error('OTP generation error:', error);
      return { success: false, message: 'Failed to generate OTP' };
    }
  }

  // Verify OTP
  async verifyOTP(userId, providedOTP) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!user.otp || !user.otpExpiry) {
        return { success: false, message: 'No OTP found. Please request a new one.' };
      }

      if (new Date() > user.otpExpiry) {
        // Clear expired OTP
        await User.findByIdAndUpdate(userId, {
          $unset: { otp: 1, otpExpiry: 1 }
        });
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (user.otp !== providedOTP) {
        return { success: false, message: 'Invalid OTP. Please try again.' };
      }

      // OTP is valid - mark email as verified and clear OTP
      await User.findByIdAndUpdate(userId, {
        isEmailVerified: true,
        $unset: { otp: 1, otpExpiry: 1 }
      });

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }

  // Send OTP for login verification
  async sendLoginOTP(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const otpResult = await this.generateAndStoreOTP(user._id);
      if (!otpResult.success) {
        return otpResult;
      }

      const emailResult = await this.sendOTPEmail(email, otpResult.otp, 'login');
      
      return {
        success: emailResult.success,
        message: emailResult.success ? 'OTP sent to your email' : emailResult.message,
        userId: user._id
      };
    } catch (error) {
      console.error('Send login OTP error:', error);
      return { success: false, message: 'Failed to send login OTP' };
    }
  }









  // Send OTP for registration verification
  async sendRegistrationOTP(userId, email) {
    try {
      const otpResult = await this.generateAndStoreOTP(userId);
      if (!otpResult.success) {
        return otpResult;
      }

      const emailResult = await this.sendOTPEmail(email, otpResult.otp, 'registration');
      
      return {
        success: emailResult.success,
        message: emailResult.success ? 'Verification OTP sent to your email' : emailResult.message
      };
    } catch (error) {
      console.error('Send registration OTP error:', error);
      return { success: false, message: 'Failed to send registration OTP' };
    }
  }

  // Send OTP for signup (before account creation)
  async sendSignupOTP(email) {
    try {
      const otp = this.generateOTP();
      const sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP data temporarily (in memory or cache)
      // For now, we'll use a simple in-memory store
      if (!global.signupOTPs) {
        global.signupOTPs = new Map();
      }
      
      global.signupOTPs.set(sessionId, {
        email,
        otp,
        otpExpiry,
        verified: false
      });

      const emailResult = await this.sendOTPEmail(email, otp, 'signup verification');
      
      return {
        success: emailResult.success,
        message: emailResult.success ? 'Verification OTP sent to your email' : emailResult.message,
        sessionId
      };
    } catch (error) {
      console.error('Send signup OTP error:', error);
      return { success: false, message: 'Failed to send signup OTP' };
    }
  }

  // Verify signup OTP and create account
  async verifySignupOTP(sessionId, providedOTP, userData) {
    try {
      if (!global.signupOTPs || !global.signupOTPs.has(sessionId)) {
        return { success: false, message: 'Invalid session or OTP expired' };
      }

      const otpData = global.signupOTPs.get(sessionId);
      
      if (new Date() > otpData.otpExpiry) {
        global.signupOTPs.delete(sessionId);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (otpData.otp !== providedOTP) {
        return { success: false, message: 'Invalid OTP. Please try again.' };
      }

      if (otpData.email !== userData.email) {
        return { success: false, message: 'Email mismatch' };
      }

      // Create the user account now
      const userService = require('./userService');
      const user = await userService.register({
        ...userData,
        isEmailVerified: true
      });

      // Generate login token
      const { token } = await userService.loginById(user._id);

      // Clean up the OTP session
      global.signupOTPs.delete(sessionId);

      return { 
        success: true, 
        message: 'Account created and email verified successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: true
        },
        token
      };
    } catch (error) {
      console.error('Verify signup OTP error:', error);
      return { success: false, message: 'Failed to verify OTP and create account' };
    }
  }

  // Resend signup OTP
  async resendSignupOTP(sessionId, email) {
    try {
      if (!global.signupOTPs || !global.signupOTPs.has(sessionId)) {
        return { success: false, message: 'Invalid session. Please start signup again.' };
      }

      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      // Update the existing session
      global.signupOTPs.set(sessionId, {
        email,
        otp,
        otpExpiry,
        verified: false
      });

      const emailResult = await this.sendOTPEmail(email, otp, 'signup verification');
      
      return {
        success: emailResult.success,
        message: emailResult.success ? 'New OTP sent to your email' : emailResult.message
      };
    } catch (error) {
      console.error('Resend signup OTP error:', error);
      return { success: false, message: 'Failed to resend signup OTP' };
    }
  }

  // Cleanup expired signup data
  cleanupExpiredSignups() {
    const now = new Date();
    for (const [token, data] of tempSignupData.entries()) {
      if (now > data.otpExpiry) {
        tempSignupData.delete(token);
      }
    }
  }
}

module.exports = new OTPService();
