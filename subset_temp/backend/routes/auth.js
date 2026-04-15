const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, mobile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, name, mobile });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login - Direct login (No OTP - Use for Admin only)
// Regular users should use /api/otp/login-request
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Handle test user identifier
    let loginEmail = email.toLowerCase();
    if (loginEmail === 'test@123') {
      loginEmail = 'test@123.com';
    }

    // Find user
    const user = await User.findOne({ email: loginEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Only allow admin users or the specific test user to use this direct login route
    if (!user.isAdmin && user.email !== 'test@123.com') {
      console.log(`⚠️  Non-admin user ${user.email} attempted direct login - redirecting to OTP`);
      return res.status(403).json({ 
        message: 'Please use OTP login',
        requireOTP: true,
        userId: user._id
      });
    }

    console.log(`🔐 Admin login: ${user.email} - Direct access granted`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      message: 'Admin login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user (protected route)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('subscriptionPlan');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Update user profile (protected route)
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;
