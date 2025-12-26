const express = require('express');
const router = express.Router();
const SuccessStory = require('../models/SuccessStory');
const auth = require('../middleware/auth');

// Public routes - Get all published success stories
router.get('/public', async (req, res) => {
  try {
    const { category, featured, limit = 10, page = 1 } = req.query;
    
    let query = { published: true };
    
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const stories = await SuccessStory.find(query)
      .sort({ featured: -1, publishedDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await SuccessStory.countDocuments(query);
    
    res.json({
      stories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public route - Get single published story by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const story = await SuccessStory.findOne({ slug: req.params.slug, published: true });
    
    if (!story) {
      return res.status(404).json({ message: 'Success story not found' });
    }
    
    // Increment views
    story.views += 1;
    await story.save();
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes - require authentication
router.use(auth);

// Get all success stories (admin)
router.get('/', async (req, res) => {
  try {
    const { published, category, featured } = req.query;
    
    let query = {};
    if (published !== undefined) query.published = published === 'true';
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';
    
    const stories = await SuccessStory.find(query).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single story by ID (admin)
router.get('/:id', async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Success story not found' });
    }
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new success story
router.post('/', async (req, res) => {
  try {
    const story = new SuccessStory(req.body);
    await story.save();
    res.status(201).json(story);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Story with this slug already exists' });
    }
    res.status(400).json({ message: 'Error creating success story', error: error.message });
  }
});

// Update success story
router.put('/:id', async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!story) {
      return res.status(404).json({ message: 'Success story not found' });
    }
    
    res.json(story);
  } catch (error) {
    res.status(400).json({ message: 'Error updating success story', error: error.message });
  }
});

// Delete success story
router.delete('/:id', async (req, res) => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Success story not found' });
    }
    
    res.json({ message: 'Success story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Success story not found' });
    }
    
    story.published = !story.published;
    if (story.published && !story.publishedDate) {
      story.publishedDate = new Date();
    }
    
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(400).json({ message: 'Error updating success story', error: error.message });
  }
});

// Toggle featured status
router.patch('/:id/featured', async (req, res) => {
  try {
    const story = await SuccessStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Success story not found' });
    }
    
    story.featured = !story.featured;
    await story.save();
    res.json(story);
  } catch (error) {
    res.status(400).json({ message: 'Error updating success story', error: error.message });
  }
});

module.exports = router;
