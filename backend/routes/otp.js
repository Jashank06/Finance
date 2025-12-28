// Updated at: 1766878868

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { createAndSendOTP, verifyOTP, resendOTP } = require('../services/otpService');
const auth = require('../middleware/auth');

// Step 1: Login with email and password (sends OTP)
router.post('/login-request', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active (only if explicitly set to false)
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Debug logging
    console.log('DEBUG: User found:', user.email);
    console.log('DEBUG: user.isAdmin:', user.isAdmin);
    console.log('DEBUG: typeof user.isAdmin:', typeof user.isAdmin);
    console.log('DEBUG: user.isAdmin === true:', user.isAdmin === true);

    // Skip OTP for admin users - direct login
    if (user.isAdmin === true) {
      console.log(`🔐 Admin login detected for ${user.email} - Skipping OTP`);
      
      // Generate JWT token directly for admin
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          isAdmin: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      if (user.lastLogin !== undefined) {
        user.lastLogin = new Date();
        await user.save();
      }

      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        skipOTP: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name || user.firstName,
          isAdmin: true,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionStatus: user.subscriptionStatus
        }
      });
    }

    // Generate and send OTP for regular users
    const userName = user.firstName || user.name || user.email.split('@')[0];
    const result = await createAndSendOTP(user._id, user.email, userName, 'login');

    res.json({
      success: true,
      message: 'OTP sent to your email',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Error in login-request:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again later.',
      error: error.message 
    });
  }
});

// Step 2: Verify OTP and complete login
router.post('/verify-login-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    console.log(`📥 Received OTP verification request - UserId: ${userId}, OTP: "${otp}", OTP Type: ${typeof otp}`);

    // Validate input
    if (!userId || !otp) {
      return res.status(400).json({ message: 'User ID and OTP are required' });
    }

    // Verify OTP
    const verificationResult = await verifyOTP(userId, String(otp).trim(), 'login');

    if (!verificationResult.success) {
      console.log(`❌ OTP verification failed for user ${userId}`);
      return res.status(401).json({ message: verificationResult.message });
    }

    // Get user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Error in verify-login-otp:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again later.',
      error: error.message 
    });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId, purpose = 'login' } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userName = user.firstName || user.email.split('@')[0];
    const result = await resendOTP(user._id, user.email, userName, purpose);

    if (!result.success) {
      return res.status(429).json({ message: result.message });
    }

    res.json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Error in resend-otp:', error);
    res.status(500).json({ 
      message: 'Failed to resend OTP. Please try again.',
      error: error.message 
    });
  }
});

// Forgot Password - Step 1: Request OTP
router.post('/forgot-password-request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.',
        userId: 'dummy' // Send dummy response
      });
    }

    // Create and send OTP
    const result = await createAndSendOTP(user._id, user.email, user.name, 'password-reset');

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Password reset code sent to your email',
        userId: user._id
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: result.message || 'Failed to send reset code'
      });
    }
  } catch (error) {
    console.error('Forgot password request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Forgot Password - Step 2: Verify OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    // Verify OTP
    const result = await verifyOTP(userId, otp, 'password-reset');

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully. You can now reset your password.',
        userId: userId
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: result.message || 'Invalid or expired OTP'
      });
    }
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Forgot Password - Step 3: Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID, OTP, and new password are required'
      });
    }

    // Check if OTP was recently verified (used) within last 5 minutes
    const recentOTP = await OTP.findOne({
      userId,
      otp: otp.trim(),
      purpose: 'password-reset',
      isUsed: true,
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    }).sort({ createdAt: -1 });

    if (!recentOTP) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired OTP. Please verify your OTP first.'
      });
    }

    // Find user and update password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Invalidate all OTPs for this user after successful password reset
    await OTP.updateMany(
      { userId, purpose: 'password-reset' },
      { isUsed: true }
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;
