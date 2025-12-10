const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Get all projects for a user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ 
      userId: req.user.id, 
      isActive: true 
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

// Get a single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
});

// Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, budget, currency, color, tags } = req.body;

    // Check if project with same name already exists for this user
    const existingProject = await Project.findOne({
      name: name.trim(),
      userId: req.user.id
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        error: 'Project with this name already exists'
      });
    }

    const project = new Project({
      userId: req.user.id,
      name: name.trim(),
      description: description?.trim() || '',
      status: status || 'active',
      startDate: startDate ? new Date(startDate) : Date.now(),
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget || 0,
      currency: currency || 'INR',
      color: color || '#3B82F6',
      tags: tags || []
    });

    await project.save();

    res.status(201).json({
      success: true,
      project,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    });
  }
});

// Update a project
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, status, startDate, endDate, budget, currency, color, tags } = req.body;

    // Check if project exists and belongs to user
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if new name conflicts with existing project (if name is being changed)
    if (name && name.trim() !== project.name) {
      const existingProject = await Project.findOne({
        name: name.trim(),
        userId: req.user.id,
        _id: { $ne: req.params.id }
      });

      if (existingProject) {
        return res.status(400).json({
          success: false,
          error: 'Project with this name already exists'
        });
      }
    }

    // Update project fields
    if (name) project.name = name.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = new Date(endDate);
    if (budget !== undefined) project.budget = budget;
    if (currency) project.currency = currency;
    if (color) project.color = color;
    if (tags) project.tags = tags;

    await project.save();

    res.json({
      success: true,
      project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    });
  }
});

// Delete a project (soft delete - set isActive to false)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    project.isActive = false;
    await project.save();

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    });
  }
});

module.exports = router;
