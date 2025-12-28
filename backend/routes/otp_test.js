const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('🔄 OTP routes file loaded!');

// Step 1: Login with email and password
router.post('/login-request', async (req, res) => {
  console.log('📥 /login-request endpoint hit!');
  console.log('📧 Email:', req.body.email);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User authenticated:', user.email);
    console.log('🔍 isAdmin:', user.isAdmin);

    // Skip OTP for admin users
    if (user.isAdmin === true) {
      console.log('🔐 ADMIN DETECTED - Skipping OTP!');
      
      const token = jwt.sign(
        { userId: user._id, email: user.email, isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        skipOTP: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name || user.firstName,
          isAdmin: true
        }
      });
    }

    console.log('📧 Sending OTP to regular user...');
    
    // For now, just return success for regular users
    res.json({
      success: true,
      message: 'OTP sent to your email',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
