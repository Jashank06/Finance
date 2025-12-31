const express = require('express');
const router = express.Router();
const SpacePlan = require('../models/SpacePlan');
const User = require('../models/User');
const adminAuth = require('../middleware/adminAuth');
const protect = require('../middleware/auth');

// Get all space plans (Public)
router.get('/', async (req, res) => {
  try {
    const plans = await SpacePlan.find({ active: true }).sort({ order: 1, price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching space plans', error: error.message });
  }
});

// Get all space plans including inactive (Admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const plans = await SpacePlan.find().sort({ order: 1, createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching space plans', error: error.message });
  }
});

// Get single space plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await SpacePlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Space plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching space plan', error: error.message });
  }
});

// Create space plan (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const plan = new SpacePlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating space plan', error: error.message });
  }
});

// Update space plan (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const plan = await SpacePlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Space plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating space plan', error: error.message });
  }
});

// Delete space plan (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const plan = await SpacePlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Space plan not found' });
    }
    res.json({ message: 'Space plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting space plan', error: error.message });
  }
});

// Toggle plan active status (Admin only)
router.patch('/:id/toggle', adminAuth, async (req, res) => {
  try {
    const plan = await SpacePlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Space plan not found' });
    }
    plan.active = !plan.active;
    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling plan status', error: error.message });
  }
});

// Purchase space plan (User)
router.post('/purchase/:id', protect, async (req, res) => {
  try {
    const plan = await SpacePlan.findById(req.params.id);
    if (!plan || !plan.active) {
      return res.status(404).json({ message: 'Space plan not found or inactive' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate expiry date based on period
    let expiryDate = null;
    if (plan.period !== 'lifetime') {
      expiryDate = new Date();
      if (plan.period === 'month') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (plan.period === 'year') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }
    }

    // Add purchased plan to user
    user.purchasedSpacePlans.push({
      spacePlan: plan._id,
      purchaseDate: new Date(),
      expiryDate: expiryDate,
      storageAdded: plan.storageSize
    });

    // Update total storage
    user.totalStorage += plan.storageSize;
    await user.save();

    res.json({
      message: 'Space plan purchased successfully',
      user: {
        totalStorage: user.totalStorage,
        usedStorage: user.usedStorage,
        availableStorage: user.totalStorage - user.usedStorage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing space plan', error: error.message });
  }
});

// Get user's storage info
router.get('/user/storage', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('purchasedSpacePlans.spacePlan');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      totalStorage: user.totalStorage,
      usedStorage: user.usedStorage,
      availableStorage: user.totalStorage - user.usedStorage,
      purchasedPlans: user.purchasedSpacePlans
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching storage info', error: error.message });
  }
});

module.exports = router;
