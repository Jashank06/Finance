const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const adminAuth = require('../middleware/adminAuth');
const protect = require('../middleware/auth');

// Get all coupons (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().populate('subscriptionPlan', 'name').sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// Get coupons for specific plan (Admin only)
router.get('/plan/:planId', adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      $or: [
        { subscriptionPlan: req.params.planId },
        { subscriptionPlan: null }
      ]
    }).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

// Validate coupon (Public - no auth required for signup flow)
router.post('/validate', async (req, res) => {
  try {
    const { code, planId, amount } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      $or: [
        { subscriptionPlan: planId },
        { subscriptionPlan: null }
      ]
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }
    
    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon is expired or not active' });
    }
    
    if (amount < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required` 
      });
    }
    
    const discount = coupon.calculateDiscount(amount);
    const finalAmount = amount - discount;
    
    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount,
      finalAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
});

// Create coupon (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
});

// Update coupon (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Error updating coupon', error: error.message });
  }
});

// Delete coupon (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
});

// Apply coupon to payment (increment usage count)
router.post('/apply/:id', protect, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Coupon is no longer valid' });
    }
    
    coupon.usedCount += 1;
    await coupon.save();
    
    res.json({ message: 'Coupon applied successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
});

module.exports = router;
