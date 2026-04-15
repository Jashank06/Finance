const express = require('express');
const router = express.Router();
const Category = require('../models/monitoring/Category');
const auth = require('../middleware/auth');

// Get all categories for a user
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id })
      .sort({ isDefault: -1, label: 1 });
    
    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { userId: req.user.id, value: 'birthday', label: 'Birth Day', color: '#EF4444', isDefault: true },
        { userId: req.user.id, value: 'anniversary', label: 'Anniversary', color: '#8B5CF6', isDefault: true },
        { userId: req.user.id, value: 'policy-renewal', label: 'Policy Renewal', color: '#F59E0B', isDefault: true },
        { userId: req.user.id, value: 'loan-emi', label: 'Loan EMI', color: '#10B981', isDefault: true },
        { userId: req.user.id, value: 'other', label: 'Other', color: '#3B82F6', isDefault: true }
      ];
      
      const createdCategories = await Category.insertMany(defaultCategories);
      return res.json({ categories: createdCategories });
    }
    
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new category
router.post('/', auth, async (req, res) => {
  try {
    const { label, color } = req.body;
    
    if (!label || !color) {
      return res.status(400).json({ error: 'Label and color are required' });
    }
    
    // Generate value from label (lowercase, no spaces, hyphenated)
    const value = label.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category with same value already exists
    const existingCategory = await Category.findOne({ 
      userId: req.user.id, 
      value 
    });
    
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    
    const category = new Category({
      userId: req.user.id,
      value,
      label,
      color,
      isDefault: false
    });
    
    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a category
router.put('/:id', auth, async (req, res) => {
  try {
    const { label, color } = req.body;
    
    const category = await Category.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    if (label) {
      category.label = label;
      category.value = label.toLowerCase().replace(/\s+/g, '-');
    }
    if (color) category.color = color;
    category.updatedAt = Date.now();
    
    await category.save();
    res.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
