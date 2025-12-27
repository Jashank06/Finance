const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');

// Public routes - Get all published blogs
router.get('/public', async (req, res) => {
  try {
    const { category, tag, search, limit = 10, page = 1, sort = 'date' } = req.query;
    
    let query = { published: true };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    let sortOrder = { publishedDate: -1 }; // default: latest first
    if (sort === 'views') {
      sortOrder = { views: -1, publishedDate: -1 }; // most viewed first, then by date
    } else if (sort === 'likes') {
      sortOrder = { likes: -1, publishedDate: -1 }; // most liked first, then by date
    }
    
    const blogs = await Blog.find(query)
      .sort(sortOrder)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-content');
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
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

// Public route - Get single published blog by slug
router.get('/public/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Public interaction routes (no auth required)

// Like a blog post
router.post('/public/:slug/like', async (req, res) => {
  try {
    const { userIdentifier } = req.body; // Can be IP, session ID, or user ID
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user already liked
    const alreadyLiked = blog.likedBy.includes(userIdentifier);
    
    if (alreadyLiked) {
      // Unlike
      blog.likedBy = blog.likedBy.filter(id => id !== userIdentifier);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      // Like
      blog.likedBy.push(userIdentifier);
      blog.likes += 1;
    }
    
    await blog.save();
    res.json({ 
      likes: blog.likes, 
      liked: !alreadyLiked 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating likes', error: error.message });
  }
});

// Add comment to blog
router.post('/public/:slug/comment', async (req, res) => {
  try {
    const { name, comment, rating } = req.body;
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    if (!name || !comment) {
      return res.status(400).json({ message: 'Name and comment are required' });
    }
    
    const newComment = {
      name,
      comment,
      rating: rating || undefined,
      createdAt: new Date()
    };
    
    blog.comments.push(newComment);
    
    // Update average rating if rating provided
    if (rating) {
      const ratingsCount = blog.comments.filter(c => c.rating).length;
      const totalRating = blog.comments.reduce((sum, c) => sum + (c.rating || 0), 0);
      blog.averageRating = ratingsCount > 0 ? totalRating / ratingsCount : 0;
      blog.totalRatings = ratingsCount;
    }
    
    await blog.save();
    res.status(201).json({ 
      message: 'Comment added successfully',
      comment: newComment,
      averageRating: blog.averageRating,
      totalRatings: blog.totalRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Increment share count
router.post('/public/:slug/share', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    blog.shares += 1;
    await blog.save();
    
    res.json({ shares: blog.shares });
  } catch (error) {
    res.status(500).json({ message: 'Error updating shares', error: error.message });
  }
});

// Admin routes - require authentication
router.use(auth);

// Get all blogs (admin)
router.get('/', async (req, res) => {
  try {
    const { published, category } = req.query;
    
    let query = {};
    if (published !== undefined) query.published = published === 'true';
    if (category) query.category = category;
    
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single blog by ID (admin)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new blog
router.post('/', async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Blog with this slug already exists' });
    }
    res.status(400).json({ message: 'Error creating blog', error: error.message });
  }
});

// Update blog
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: 'Error updating blog', error: error.message });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    blog.published = !blog.published;
    if (blog.published && !blog.publishedDate) {
      blog.publishedDate = new Date();
    }
    
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: 'Error updating blog', error: error.message });
  }
});

module.exports = router;
