const express = require('express');
const router = express.Router();
const CalendarType = require('../models/monitoring/CalendarType');
const auth = require('../middleware/auth');

// Get all calendar types for a user
router.get('/', auth, async (req, res) => {
  try {
    const calendarTypes = await CalendarType.find({ userId: req.user.id })
      .sort({ isDefault: -1, name: 1 });
    
    // If no calendar types exist, create default ones
    if (calendarTypes.length === 0) {
      const defaultCalendarTypes = [
        { userId: req.user.id, id: 'family', name: 'Family', color: '#3B82F6', visible: true, isDefault: true },
        { userId: req.user.id, id: 'personal', name: 'Personal', color: '#10B981', visible: true, isDefault: true },
        { userId: req.user.id, id: 'work', name: 'Work', color: '#F59E0B', visible: true, isDefault: true },
        { userId: req.user.id, id: 'holidays', name: 'Holidays', color: '#EF4444', visible: true, isDefault: true }
      ];
      
      const createdCalendarTypes = await CalendarType.insertMany(defaultCalendarTypes);
      return res.json({ calendarTypes: createdCalendarTypes });
    }
    
    res.json({ calendarTypes });
  } catch (error) {
    console.error('Get calendar types error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new calendar type
router.post('/', auth, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }
    
    // Generate id from name (lowercase, no spaces, hyphenated)
    const id = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if calendar type with same id already exists
    const existingCalendarType = await CalendarType.findOne({ 
      userId: req.user.id, 
      id 
    });
    
    if (existingCalendarType) {
      return res.status(400).json({ error: 'Calendar type with this name already exists' });
    }
    
    const calendarType = new CalendarType({
      userId: req.user.id,
      id,
      name,
      color,
      visible: true,
      isDefault: false
    });
    
    await calendarType.save();
    res.status(201).json({ calendarType });
  } catch (error) {
    console.error('Create calendar type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a calendar type
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color, visible } = req.body;
    
    const calendarType = await CalendarType.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!calendarType) {
      return res.status(404).json({ error: 'Calendar type not found' });
    }
    
    if (name) {
      calendarType.name = name;
      calendarType.id = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (color) calendarType.color = color;
    if (visible !== undefined) calendarType.visible = visible;
    calendarType.updatedAt = Date.now();
    
    await calendarType.save();
    res.json({ calendarType });
  } catch (error) {
    console.error('Update calendar type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a calendar type
router.delete('/:id', auth, async (req, res) => {
  try {
    const calendarType = await CalendarType.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!calendarType) {
      return res.status(404).json({ error: 'Calendar type not found' });
    }
    
    // Don't allow deleting default calendar types
    if (calendarType.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default calendar types' });
    }
    
    await CalendarType.deleteOne({ _id: req.params.id });
    res.json({ message: 'Calendar type deleted successfully' });
  } catch (error) {
    console.error('Delete calendar type error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
