const express = require('express');
const router = express.Router();
const IncomeExpense = require('../models/IncomeExpense');
const auth = require('../middleware/auth');

// Get all income/expense records for a user
router.get('/', auth, async (req, res) => {
  try {
    const { 
      type, 
      category, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { userId: req.user.id, isActive: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const records = await IncomeExpense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await IncomeExpense.countDocuments(query);

    res.json({
      records,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total
      }
    });
  } catch (error) {
    console.error('Error fetching income/expense records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single income/expense record
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await IncomeExpense.findOne({ 
      _id: req.params.id, 
      userId: req.user.id, 
      isActive: true 
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new income/expense record
router.post('/', auth, async (req, res) => {
  try {
    const {
      type,
      category,
      subcategory,
      title,
      description,
      amount,
      currency = 'INR',
      date,
      source,
      paymentMethod,
      account,
      tags,
      isRecurring,
      recurringFrequency,
      recurringEndDate,
      receipt,
      attachments,
      status,
      taxDeductible,
      taxCategory,
      budgetCategory,
      notes
    } = req.body;

    // Validation
    if (!type || !category || !title || !amount) {
      return res.status(400).json({ 
        message: 'Type, category, title, and amount are required' 
      });
    }

    if (type === 'income' && !source) {
      return res.status(400).json({ 
        message: 'Source is required for income records' 
      });
    }

    if (type === 'expense' && !paymentMethod) {
      return res.status(400).json({ 
        message: 'Payment method is required for expense records' 
      });
    }

    if (isRecurring && !recurringFrequency) {
      return res.status(400).json({ 
        message: 'Recurring frequency is required for recurring records' 
      });
    }

    if (taxDeductible && !taxCategory) {
      return res.status(400).json({ 
        message: 'Tax category is required for tax deductible records' 
      });
    }

    const record = new IncomeExpense({
      userId: req.user.id,
      type,
      category,
      subcategory,
      title,
      description,
      amount,
      currency,
      date,
      source,
      paymentMethod,
      account,
      tags,
      isRecurring,
      recurringFrequency,
      recurringEndDate,
      receipt,
      attachments,
      status,
      taxDeductible,
      taxCategory,
      budgetCategory,
      notes
    });

    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update income/expense record
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    const record = await IncomeExpense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isActive: true },
      updates,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete income/expense record (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await IncomeExpense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get summary statistics
router.get('/summary/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchQuery = { 
      userId: req.user.id, 
      isActive: true 
    };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const summary = await IncomeExpense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const categorySummary = await IncomeExpense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              category: '$_id.category',
              totalAmount: '$totalAmount',
              count: '$count'
            }
          },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const monthlyTrend = await IncomeExpense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$totalAmount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$totalAmount', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      summary,
      categorySummary,
      monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recurring records
router.get('/recurring/list', auth, async (req, res) => {
  try {
    const records = await IncomeExpense.find({
      userId: req.user.id,
      isRecurring: true,
      isActive: true
    }).sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error('Error fetching recurring records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get records by tags
router.get('/tags/:tag', auth, async (req, res) => {
  try {
    const { tag } = req.params;
    const records = await IncomeExpense.find({
      userId: req.user.id,
      tags: tag,
      isActive: true
    }).sort({ date: -1 });

    res.json(records);
  } catch (error) {
    console.error('Error fetching records by tag:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
