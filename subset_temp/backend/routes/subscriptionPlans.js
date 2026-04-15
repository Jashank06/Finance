const express = require('express');
const router = express.Router();
const SubscriptionPlan = require('../models/SubscriptionPlan');
const auth = require('../middleware/auth');

// Public route - Get all active plans
router.get('/public', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ active: true })
      .sort({ order: 1 })
      .select('-__v');
    
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
});

// Admin routes - require authentication
router.use(auth);

// Get all plans (Admin)
router.get('/', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ order: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
});

// Get single plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({ message: 'Error fetching plan', error: error.message });
  }
});

// Create new plan
router.post('/', async (req, res) => {
  try {
    const plan = new SubscriptionPlan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(400).json({ message: 'Error creating plan', error: error.message });
  }
});

// Update plan
router.put('/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(400).json({ message: 'Error updating plan', error: error.message });
  }
});

// Delete plan
router.delete('/:id', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({ message: 'Error deleting plan', error: error.message });
  }
});

// Toggle active status
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    plan.active = !plan.active;
    await plan.save();
    
    res.json(plan);
  } catch (error) {
    console.error('Error toggling plan status:', error);
    res.status(400).json({ message: 'Error updating plan', error: error.message });
  }
});

module.exports = router;
