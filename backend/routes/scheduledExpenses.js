const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Scheduled Expense Schema
const scheduledExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  frequency: { 
    type: String, 
    enum: ['monthly', 'quarterly', 'yearly', 'one-time'],
    default: 'monthly'
  },
  bankAccount: { type: String }, // Account number reference
  category: { 
    type: String, 
    enum: ['bill', 'emi', 'rent', 'utilities', 'insurance', 'loan', 'credit-card', 'subscription', 'education', 'other'],
    default: 'bill'
  },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Model
const ScheduledExpense = mongoose.model('ScheduledExpense', scheduledExpenseSchema);

// GET all scheduled expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await ScheduledExpense.find().sort({ dueDate: 1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching scheduled expenses:', error);
    res.status(500).json({ message: 'Error fetching scheduled expenses', error: error.message });
  }
});

// GET single scheduled expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await ScheduledExpense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Error fetching scheduled expense:', error);
    res.status(500).json({ message: 'Error fetching scheduled expense', error: error.message });
  }
});

// POST new scheduled expense
router.post('/', async (req, res) => {
  try {
    const expense = new ScheduledExpense({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error('Error creating scheduled expense:', error);
    res.status(400).json({ message: 'Error creating scheduled expense', error: error.message });
  }
});

// PUT update scheduled expense
router.put('/:id', async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const expense = await ScheduledExpense.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Error updating scheduled expense:', error);
    res.status(400).json({ message: 'Error updating scheduled expense', error: error.message });
  }
});

// DELETE scheduled expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await ScheduledExpense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }
    res.json({ message: 'Scheduled expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled expense:', error);
    res.status(500).json({ message: 'Error deleting scheduled expense', error: error.message });
  }
});

// GET expenses by bank account
router.get('/bank/:accountNumber', async (req, res) => {
  try {
    const expenses = await ScheduledExpense.find({ 
      bankAccount: req.params.accountNumber,
      isActive: true 
    }).sort({ dueDate: 1 });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses for bank:', error);
    res.status(500).json({ message: 'Error fetching expenses for bank', error: error.message });
  }
});

// GET upcoming expenses (next 30 days)
router.get('/upcoming/next-month', async (req, res) => {
  try {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    const expenses = await ScheduledExpense.find({
      isActive: true,
      dueDate: { $gte: today, $lte: nextMonth }
    }).sort({ dueDate: 1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching upcoming expenses:', error);
    res.status(500).json({ message: 'Error fetching upcoming expenses', error: error.message });
  }
});

// GET overdue expenses
router.get('/status/overdue', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expenses = await ScheduledExpense.find({
      isActive: true,
      dueDate: { $lt: today }
    }).sort({ dueDate: 1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching overdue expenses:', error);
    res.status(500).json({ message: 'Error fetching overdue expenses', error: error.message });
  }
});

// GET expenses due today
router.get('/status/due-today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const expenses = await ScheduledExpense.find({
      isActive: true,
      dueDate: { $gte: today, $lt: tomorrow }
    }).sort({ dueDate: 1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching today\'s expenses:', error);
    res.status(500).json({ message: 'Error fetching today\'s expenses', error: error.message });
  }
});

// GET analytics for scheduled expenses
router.get('/analytics/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Total active expenses
    const totalActive = await ScheduledExpense.countDocuments({ isActive: true });
    
    // Total amount per month
    const monthlyTotal = await ScheduledExpense.aggregate([
      { $match: { isActive: true, frequency: 'monthly' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Overdue count
    const overdueCount = await ScheduledExpense.countDocuments({
      isActive: true,
      dueDate: { $lt: today }
    });
    
    // Due today count
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueTodayCount = await ScheduledExpense.countDocuments({
      isActive: true,
      dueDate: { $gte: today, $lt: tomorrow }
    });
    
    // Category breakdown
    const categoryBreakdown = await ScheduledExpense.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    
    // Bank account breakdown
    const bankBreakdown = await ScheduledExpense.aggregate([
      { $match: { isActive: true, bankAccount: { $ne: null } } },
      { $group: { _id: '$bankAccount', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);
    
    res.json({
      totalActive,
      monthlyTotal: monthlyTotal[0]?.total || 0,
      overdueCount,
      dueTodayCount,
      categoryBreakdown,
      bankBreakdown
    });
  } catch (error) {
    console.error('Error fetching expense analytics:', error);
    res.status(500).json({ message: 'Error fetching expense analytics', error: error.message });
  }
});

// PATCH toggle active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const expense = await ScheduledExpense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }
    
    expense.isActive = !expense.isActive;
    expense.updatedAt = new Date();
    await expense.save();
    
    res.json(expense);
  } catch (error) {
    console.error('Error toggling expense status:', error);
    res.status(500).json({ message: 'Error toggling expense status', error: error.message });
  }
});

// POST mark expense as paid (for tracking)
router.post('/:id/mark-paid', async (req, res) => {
  try {
    const { paidDate, paidAmount, notes } = req.body;
    
    const expense = await ScheduledExpense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Scheduled expense not found' });
    }
    
    // For recurring expenses, update the next due date
    if (expense.frequency !== 'one-time') {
      const currentDue = new Date(expense.dueDate);
      let nextDue;
      
      switch (expense.frequency) {
        case 'monthly':
          nextDue = new Date(currentDue.getFullYear(), currentDue.getMonth() + 1, currentDue.getDate());
          break;
        case 'quarterly':
          nextDue = new Date(currentDue.getFullYear(), currentDue.getMonth() + 3, currentDue.getDate());
          break;
        case 'yearly':
          nextDue = new Date(currentDue.getFullYear() + 1, currentDue.getMonth(), currentDue.getDate());
          break;
        default:
          nextDue = currentDue;
      }
      
      expense.dueDate = nextDue;
    } else {
      // For one-time expenses, mark as inactive
      expense.isActive = false;
    }
    
    expense.updatedAt = new Date();
    await expense.save();
    
    // Here you could also create a payment record in another collection
    // for tracking payment history
    
    res.json({ 
      message: 'Expense marked as paid', 
      expense,
      nextDueDate: expense.dueDate
    });
  } catch (error) {
    console.error('Error marking expense as paid:', error);
    res.status(500).json({ message: 'Error marking expense as paid', error: error.message });
  }
});

module.exports = router;