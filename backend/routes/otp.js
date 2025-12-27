const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

    // Generate and send OTP
    const userName = user.firstName || user.email.split('@')[0];
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

module.exports = router;
