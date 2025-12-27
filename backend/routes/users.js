const express = require('express');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const adminAuthMiddleware = require('../middleware/adminAuth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { search, status, plan } = req.query;
    
    // Build query
    let query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by subscription status
    if (status) {
      query.subscriptionStatus = status;
    }
    
    // Filter by plan
    if (plan) {
      query.subscriptionPlan = plan;
    }
    
    const users = await User.find(query)
      .select('-password')
      .populate('subscriptionPlan')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
});

// Get single user details (Admin only)
router.get('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('subscriptionPlan');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user', 
      error: error.message 
    });
  }
});

// Update user subscription (Admin only)
router.patch('/:id/subscription', adminAuthMiddleware, async (req, res) => {
  try {
    const { subscriptionPlan, subscriptionStatus, subscriptionExpiry, extensionDays } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Update subscription plan if provided
    if (subscriptionPlan) {
      user.subscriptionPlan = subscriptionPlan;
    }
    
    // Update subscription status if provided
    if (subscriptionStatus) {
      user.subscriptionStatus = subscriptionStatus;
    }
    
    // Update or extend subscription expiry
    if (subscriptionExpiry) {
      user.subscriptionExpiry = new Date(subscriptionExpiry);
    } else if (extensionDays) {
      // Extend from current expiry or from now if no expiry set
      const baseDate = user.subscriptionExpiry && user.subscriptionExpiry > new Date() 
        ? new Date(user.subscriptionExpiry) 
        : new Date();
      
      user.subscriptionExpiry = new Date(baseDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
      
      // If extending, set status to active
      if (user.subscriptionStatus === 'expired' || user.subscriptionStatus === 'trial') {
        user.subscriptionStatus = 'active';
      }
    }
    
    await user.save();
    
    // Populate subscription plan details
    await user.populate('subscriptionPlan');
    
    res.json({
      success: true,
      message: 'Subscription updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiry: user.subscriptionExpiry
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating subscription', 
      error: error.message 
    });
  }
});

// Delete user (Admin only)
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Prevent deleting admin users
    if (user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete admin users' 
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
});

// Get subscription statistics (Admin only)
router.get('/stats/overview', adminAuthMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await User.countDocuments({ subscriptionStatus: 'active' });
    const expiredSubscriptions = await User.countDocuments({ subscriptionStatus: 'expired' });
    const trialUsers = await User.countDocuments({ subscriptionStatus: 'trial' });
    
    // Get users by plan
    const usersByPlan = await User.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: '_id',
          foreignField: '_id',
          as: 'planDetails'
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        expiredSubscriptions,
        trialUsers,
        usersByPlan
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
});

module.exports = router;
