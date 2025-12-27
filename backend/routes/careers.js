const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const auth = require('../middleware/auth');

// Public routes - Get all published career openings
router.get('/public', async (req, res) => {
  try {
    const { department, jobType, experienceLevel, location, featured, limit = 10, page = 1, sort = 'date' } = req.query;
    
    let query = { published: true };
    
    if (department) query.department = department;
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (featured !== undefined) query.featured = featured === 'true';
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    let sortOrder = { featured: -1, publishedDate: -1 }; // default: featured first, then by date
    if (sort === 'date') {
      sortOrder = { publishedDate: -1 }; // latest first
    } else if (sort === 'views') {
      sortOrder = { views: -1, publishedDate: -1 }; // most viewed first, then by date
    } else if (sort === 'applications') {
      sortOrder = { applicationCount: -1, publishedDate: -1 }; // most applications first, then by date
    }
    
    const careers = await Career.find(query)
      .sort(sortOrder)
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Career.countDocuments(query);
    
    res.json({
      careers,
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

// Public route - Get single published career by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const career = await Career.findOne({ slug: req.params.slug, published: true });
    
    if (!career) {
      return res.status(404).json({ message: 'Career opening not found' });
    }
    
    // Increment views
    career.views += 1;
    await career.save();
    
    res.json(career);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes - require authentication
router.use(auth);

// Get all careers (admin)
router.get('/', async (req, res) => {
  try {
    const { published, department, jobType } = req.query;
    
    let query = {};
    if (published !== undefined) query.published = published === 'true';
    if (department) query.department = department;
    if (jobType) query.jobType = jobType;
    
    const careers = await Career.find(query).sort({ createdAt: -1 });
    res.json(careers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single career by ID (admin)
router.get('/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({ message: 'Career opening not found' });
    }
    
    res.json(career);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new career
router.post('/', async (req, res) => {
  try {
    const career = new Career(req.body);
    await career.save();
    res.status(201).json(career);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Career with this slug already exists' });
    }
    res.status(400).json({ message: 'Error creating career opening', error: error.message });
  }
});

// Update career
router.put('/:id', async (req, res) => {
  try {
    const career = await Career.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!career) {
      return res.status(404).json({ message: 'Career opening not found' });
    }
    
    res.json(career);
  } catch (error) {
    res.status(400).json({ message: 'Error updating career opening', error: error.message });
  }
});

// Delete career
router.delete('/:id', async (req, res) => {
  try {
    const career = await Career.findByIdAndDelete(req.params.id);
    
    if (!career) {
      return res.status(404).json({ message: 'Career opening not found' });
    }
    
    res.json({ message: 'Career opening deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({ message: 'Career opening not found' });
    }
    
    career.published = !career.published;
    if (career.published && !career.publishedDate) {
      career.publishedDate = new Date();
    }
    
    await career.save();
    res.json(career);
  } catch (error) {
    res.status(400).json({ message: 'Error updating career opening', error: error.message });
  }
});

// Toggle featured status
router.patch('/:id/featured', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({ message: 'Career opening not found' });
    }
    
    career.featured = !career.featured;
    await career.save();
    res.json(career);
  } catch (error) {
    res.status(400).json({ message: 'Error updating career opening', error: error.message });
  }
});

// Increment application count
router.post('/:id/apply', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({ message: 'Career opening not found' });
    }
    
    career.applications += 1;
    await career.save();
    res.json(career);
  } catch (error) {
    res.status(400).json({ message: 'Error updating career opening', error: error.message });
  }
});

module.exports = router;
