const express = require('express');
const FeatureUsage = require('../models/FeatureUsage');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');
const { FEATURE_CATEGORIES, FEATURE_DISPLAY_NAMES } = require('../config/featureCategories');

const router = express.Router();

// Track feature usage (authenticated users)
router.post('/track', authMiddleware, async (req, res) => {
  try {
    const { featureCategory, featureName, route, action, metadata, sessionId } = req.body;

    const usage = new FeatureUsage({
      userId: req.userId,
      featureCategory,
      featureName,
      route,
      action: action || 'view',
      metadata: metadata || {},
      sessionId
    });

    await usage.save();

    res.json({
      success: true,
      message: 'Feature usage tracked'
    });
  } catch (error) {
    console.error('Error tracking feature usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking feature usage',
      error: error.message
    });
  }
});

// Get overall analytics (Admin only)
router.get('/analytics/overview', adminAuthMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    const filter = Object.keys(dateFilter).length > 0 ? { timestamp: dateFilter } : {};

    // Total usage count
    const totalUsage = await FeatureUsage.countDocuments(filter);

    // Unique users
    const uniqueUsers = await FeatureUsage.distinct('userId', filter);
    const uniqueUserCount = uniqueUsers.length;

    // Total registered users
    const totalUsers = await User.countDocuments();

    // Usage by category
    const categoryUsage = await FeatureUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$featureCategory',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Map category names
    const categoryUsageWithNames = categoryUsage.map(cat => ({
      category: cat.category,
      categoryName: FEATURE_DISPLAY_NAMES[cat.category] || cat.category,
      count: cat.count,
      uniqueUsers: cat.uniqueUsers
    }));

    // Top features
    const topFeatures = await FeatureUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { feature: '$featureName', category: '$featureCategory' },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          feature: '$_id.feature',
          category: '$_id.category',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Usage by action type
    const actionUsage = await FeatureUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Daily usage trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyUsage = await FeatureUsage.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsage,
        uniqueUserCount,
        totalUsers,
        engagementRate: totalUsers > 0 ? ((uniqueUserCount / totalUsers) * 100).toFixed(2) : 0,
        categoryUsage: categoryUsageWithNames,
        topFeatures,
        actionUsage,
        dailyUsage
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// Get feature-specific analytics (Admin only)
router.get('/analytics/feature/:featureName', adminAuthMiddleware, async (req, res) => {
  try {
    const { featureName } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const filter = { featureName };
    if (Object.keys(dateFilter).length > 0) filter.timestamp = dateFilter;

    // Total usage
    const totalUsage = await FeatureUsage.countDocuments(filter);

    // Unique users
    const uniqueUsers = await FeatureUsage.distinct('userId', filter);

    // Top users for this feature
    const topUsers = await FeatureUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          lastUsed: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Populate user details
    const userIds = topUsers.map(u => u._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name email');
    const userMap = {};
    users.forEach(u => {
      userMap[u._id] = { name: u.name, email: u.email };
    });

    const topUsersWithDetails = topUsers.map(u => ({
      userId: u._id,
      userName: userMap[u._id]?.name || 'Unknown',
      userEmail: userMap[u._id]?.email || 'Unknown',
      usageCount: u.count,
      lastUsed: u.lastUsed
    }));

    res.json({
      success: true,
      feature: featureName,
      analytics: {
        totalUsage,
        uniqueUsers: uniqueUsers.length,
        topUsers: topUsersWithDetails
      }
    });
  } catch (error) {
    console.error('Error fetching feature analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feature analytics',
      error: error.message
    });
  }
});

// Get user-specific usage history (Admin only)
router.get('/analytics/user/:userId', adminAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const filter = { userId };
    if (Object.keys(dateFilter).length > 0) filter.timestamp = dateFilter;

    // Get user details
    const user = await User.findById(userId).select('name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Usage history
    const usageHistory = await FeatureUsage.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('featureCategory featureName route action timestamp');

    // Usage by category
    const categoryBreakdown = await FeatureUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$featureCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Most used features
    const topFeatures = await FeatureUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$featureName',
          count: { $sum: 1 },
          lastUsed: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      analytics: {
        totalUsage: usageHistory.length,
        categoryBreakdown,
        topFeatures,
        recentUsage: usageHistory
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
});

// Get category analytics (Admin only)
router.get('/analytics/category/:categoryId', adminAuthMiddleware, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const filter = { featureCategory: categoryId };
    if (Object.keys(dateFilter).length > 0) filter.timestamp = dateFilter;

    // Total usage
    const totalUsage = await FeatureUsage.countDocuments(filter);

    // Unique users
    const uniqueUsers = await FeatureUsage.distinct('userId', filter);

    // Features in this category
    const featureBreakdown = await FeatureUsage.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$featureName',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          feature: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      category: categoryId,
      categoryName: FEATURE_DISPLAY_NAMES[categoryId] || categoryId,
      analytics: {
        totalUsage,
        uniqueUsers: uniqueUsers.length,
        featureBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category analytics',
      error: error.message
    });
  }
});

// Delete old usage data (Admin only)
router.delete('/cleanup', adminAuthMiddleware, async (req, res) => {
  try {
    const { olderThanDays = 365 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await FeatureUsage.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old usage records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up usage data:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up usage data',
      error: error.message
    });
  }
});

module.exports = router;
