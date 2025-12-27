const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Target = require('../models/Target');
const BudgetPlan = require('../models/BudgetPlan');
const BudgetAnalysisService = require('../services/budgetAnalysisService');
const auth = require('../middleware/auth');

// Cheque Register Schema
const chequeRegisterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receivedDate: { type: Date, required: true },
  chequeDepositDate: { type: Date },
  difference: { type: Number },
  reasonForDelay: { type: String },
  chequePartyDetails: { type: String },
  accountHead: { type: String },
  deposit: { type: Number },
  withdrawal: { type: Number },
  amount: { type: Number },
  bank: { type: String },
  chequeNumber: { type: String },
  chequeDepositedInBank: { type: String },
  receivedFor: { type: String },
  receivedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Daily Cash Register Schema
const dailyCashSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { type: Date, required: true },
  description: { type: String },
  credit: { type: Number },
  debit: { type: Number },
  balance: { type: Number },
  category: { type: String },
  affectedAccount: { type: String },
  additionalDetails: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Milestone Schema
const milestoneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: { type: String },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  tasks: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Models
const ChequeRegister = mongoose.model('ChequeRegister', chequeRegisterSchema);
const DailyCash = mongoose.model('DailyCash', dailyCashSchema);
const Milestone = mongoose.model('Milestone', milestoneSchema);

// CHEQUE REGISTER ROUTES

// GET all cheque records
router.get('/cheque-register', auth, async (req, res) => {
  try {
    const records = await ChequeRegister.find({ userId: req.user._id }).sort({ receivedDate: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching cheque records:', error);
    res.status(500).json({ message: 'Error fetching cheque records', error: error.message });
  }
});

// GET single cheque record
router.get('/cheque-register/:id', auth, async (req, res) => {
  try {
    const record = await ChequeRegister.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Cheque record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error fetching cheque record:', error);
    res.status(500).json({ message: 'Error fetching cheque record', error: error.message });
  }
});

// POST new cheque record
router.post('/cheque-register', auth, async (req, res) => {
  try {
    // Calculate difference if both dates are provided
    if (req.body.receivedDate && req.body.chequeDepositDate) {
      const receivedDate = new Date(req.body.receivedDate);
      const depositDate = new Date(req.body.chequeDepositDate);
      const diffTime = Math.abs(depositDate - receivedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      req.body.difference = diffDays;
    }

    const record = new ChequeRegister({ ...req.body, userId: req.user._id });
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating cheque record:', error);
    res.status(400).json({ message: 'Error creating cheque record', error: error.message });
  }
});

// PUT update cheque record
router.put('/cheque-register/:id', auth, async (req, res) => {
  try {
    // Calculate difference if both dates are provided
    if (req.body.receivedDate && req.body.chequeDepositDate) {
      const receivedDate = new Date(req.body.receivedDate);
      const depositDate = new Date(req.body.chequeDepositDate);
      const diffTime = Math.abs(depositDate - receivedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      req.body.difference = diffDays;
    }

    req.body.updatedAt = new Date();
    const record = await ChequeRegister.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ message: 'Cheque record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error updating cheque record:', error);
    res.status(400).json({ message: 'Error updating cheque record', error: error.message });
  }
});

// DELETE cheque record
router.delete('/cheque-register/:id', auth, async (req, res) => {
  try {
    const record = await ChequeRegister.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Cheque record not found' });
    }
    res.json({ message: 'Cheque record deleted successfully' });
  } catch (error) {
    console.error('Error deleting cheque record:', error);
    res.status(500).json({ message: 'Error deleting cheque record', error: error.message });
  }
});

// DAILY CASH REGISTER ROUTES

// GET all cash records
router.get('/daily-cash', auth, async (req, res) => {
  try {
    const records = await DailyCash.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching cash records:', error);
    res.status(500).json({ message: 'Error fetching cash records', error: error.message });
  }
});

// GET single cash record
router.get('/daily-cash/:id', auth, async (req, res) => {
  try {
    const record = await DailyCash.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Cash record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error fetching cash record:', error);
    res.status(500).json({ message: 'Error fetching cash record', error: error.message });
  }
});

// POST new cash record
router.post('/daily-cash', auth, async (req, res) => {
  try {
    const record = new DailyCash({ ...req.body, userId: req.user._id });
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating cash record:', error);
    res.status(400).json({ message: 'Error creating cash record', error: error.message });
  }
});

// PUT update cash record
router.put('/daily-cash/:id', auth, async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const record = await DailyCash.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ message: 'Cash record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error updating cash record:', error);
    res.status(400).json({ message: 'Error updating cash record', error: error.message });
  }
});

// DELETE cash record
router.delete('/daily-cash/:id', auth, async (req, res) => {
  try {
    const record = await DailyCash.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Cash record not found' });
    }
    res.json({ message: 'Cash record deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash record:', error);
    res.status(500).json({ message: 'Error deleting cash record', error: error.message });
  }
});

// MILESTONE ROUTES

// GET all milestones
router.get('/milestones', auth, async (req, res) => {
  try {
    const records = await Milestone.find({ userId: req.user._id }).sort({ startDate: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
});

// GET single milestone
router.get('/milestones/:id', auth, async (req, res) => {
  try {
    const record = await Milestone.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error fetching milestone:', error);
    res.status(500).json({ message: 'Error fetching milestone', error: error.message });
  }
});

// POST new milestone
router.post('/milestones', auth, async (req, res) => {
  try {
    const record = new Milestone({ ...req.body, userId: req.user._id });
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(400).json({ message: 'Error creating milestone', error: error.message });
  }
});

// PUT update milestone
router.put('/milestones/:id', auth, async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const record = await Milestone.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(400).json({ message: 'Error updating milestone', error: error.message });
  }
});

// DELETE milestone
router.delete('/milestones/:id', auth, async (req, res) => {
  try {
    const record = await Milestone.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json({ message: 'Milestone deleted successfully' });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    res.status(500).json({ message: 'Error deleting milestone', error: error.message });
  }
});

// ANALYTICS ROUTES

// GET cheque register analytics
router.get('/analytics/cheque-register', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalRecords = await ChequeRegister.countDocuments({ userId });
    const totalDeposits = await ChequeRegister.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$deposit' } } }
    ]);
    const totalWithdrawals = await ChequeRegister.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$withdrawal' } } }
    ]);
    const avgDelayDays = await ChequeRegister.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: '$difference' } } }
    ]);

    res.json({
      totalRecords,
      totalDeposits: totalDeposits[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      avgDelayDays: Math.round(avgDelayDays[0]?.avg || 0)
    });
  } catch (error) {
    console.error('Error fetching cheque analytics:', error);
    res.status(500).json({ message: 'Error fetching cheque analytics', error: error.message });
  }
});

// GET cash register analytics
router.get('/analytics/daily-cash', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalRecords = await DailyCash.countDocuments({ userId });
    const totalCredits = await DailyCash.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$credit' } } }
    ]);
    const totalDebits = await DailyCash.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$debit' } } }
    ]);
    const categoryBreakdown = await DailyCash.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$credit' } } }
    ]);

    res.json({
      totalRecords,
      totalCredits: totalCredits[0]?.total || 0,
      totalDebits: totalDebits[0]?.total || 0,
      netAmount: (totalCredits[0]?.total || 0) - (totalDebits[0]?.total || 0),
      categoryBreakdown
    });
  } catch (error) {
    console.error('Error fetching cash analytics:', error);
    res.status(500).json({ message: 'Error fetching cash analytics', error: error.message });
  }
});

// GET milestone analytics
router.get('/analytics/milestones', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalMilestones = await Milestone.countDocuments({ userId });
    const statusBreakdown = await Milestone.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const priorityBreakdown = await Milestone.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const avgProgress = await Milestone.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: '$progress' } } }
    ]);

    res.json({
      totalMilestones,
      statusBreakdown,
      priorityBreakdown,
      avgProgress: Math.round(avgProgress[0]?.avg || 0)
    });
  } catch (error) {
    console.error('Error fetching milestone analytics:', error);
    res.status(500).json({ message: 'Error fetching milestone analytics', error: error.message });
  }
});

// Targets for Life Routes
router.get('/targets-for-life', auth, async (req, res) => {
  try {
    const targets = await Target.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(targets);
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({ message: 'Error fetching targets', error: error.message });
  }
});

router.post('/targets-for-life', auth, async (req, res) => {
  try {
    const target = new Target({
      userId: req.user._id,
      goalType: req.body.goalType,
      specificGoal: req.body.specificGoal,
      timeHorizon: req.body.timeHorizon,
      estimatedCost: req.body.estimatedCost,
      recommendedInvestmentVehicle: req.body.recommendedInvestmentVehicle,
      riskTolerance: req.body.riskTolerance,
      targetDate: req.body.targetDate,
      monthlyExpenses: req.body.monthlyExpenses,
      monthsOfCoverage: req.body.monthsOfCoverage
    });
    const savedTarget = await target.save();
    res.status(201).json(savedTarget);
  } catch (error) {
    console.error('Error creating target:', error);
    res.status(400).json({ message: 'Error creating target', error: error.message });
  }
});

router.put('/targets-for-life/:id', auth, async (req, res) => {
  try {
    const target = await Target.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $set: {
          goalType: req.body.goalType,
          specificGoal: req.body.specificGoal,
          timeHorizon: req.body.timeHorizon,
          estimatedCost: req.body.estimatedCost,
          recommendedInvestmentVehicle: req.body.recommendedInvestmentVehicle,
          riskTolerance: req.body.riskTolerance,
          targetDate: req.body.targetDate,
          monthlyExpenses: req.body.monthlyExpenses,
          monthsOfCoverage: req.body.monthsOfCoverage,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    res.json(target);
  } catch (error) {
    console.error('Error updating target:', error);
    res.status(400).json({ message: 'Error updating target', error: error.message });
  }
});

router.delete('/targets-for-life/:id', auth, async (req, res) => {
  try {
    const target = await Target.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    res.json({ message: 'Target deleted successfully' });
  } catch (error) {
    console.error('Error deleting target:', error);
    res.status(500).json({ message: 'Error deleting target', error: error.message });
  }
});

// BUDGET PLAN ROUTES

// POST - Create or update user's budget plan
router.post('/budget-plan', auth, async (req, res) => {
  try {
    const { selectedPlan, monthlyIncome } = req.body;

    if (!selectedPlan || !monthlyIncome) {
      return res.status(400).json({ message: 'Selected plan and monthly income are required' });
    }

    if (monthlyIncome <= 0) {
      return res.status(400).json({ message: 'Monthly income must be greater than 0' });
    }

    const planDetails = BudgetPlan.getPlanDetails(selectedPlan);
    if (!planDetails) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const userId = req.user.id;

    let budgetPlan = await BudgetPlan.findOne({ userId });

    if (budgetPlan) {
      budgetPlan.selectedPlan = selectedPlan;
      budgetPlan.monthlyIncome = monthlyIncome;
      budgetPlan.planDetails = planDetails;
      budgetPlan.updatedAt = new Date();
      await budgetPlan.save();
    } else {
      budgetPlan = new BudgetPlan({
        userId,
        selectedPlan,
        monthlyIncome,
        planDetails
      });
      await budgetPlan.save();
    }

    res.status(200).json({
      message: 'Budget plan saved successfully',
      budgetPlan
    });
  } catch (error) {
    console.error('Error saving budget plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET - Get user's current budget plan
router.get('/budget-plan', auth, async (req, res) => {
  try {
    const budgetPlan = await BudgetPlan.findOne({ userId: req.user.id });

    if (!budgetPlan) {
      return res.status(404).json({ message: 'No budget plan found. Please create one first.' });
    }

    res.status(200).json(budgetPlan);
  } catch (error) {
    console.error('Error fetching budget plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET - Get budget analysis with expense breakdown
router.get('/budget-plan/analysis', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetPlan = await BudgetPlan.findOne({ userId });

    if (!budgetPlan) {
      return res.status(404).json({
        message: 'No budget plan found. Please create a budget plan first.'
      });
    }

    const analysisResult = await BudgetAnalysisService.performCompleteAnalysis(
      userId,
      budgetPlan
    );

    res.status(200).json({
      budgetPlan: {
        selectedPlan: budgetPlan.selectedPlan,
        planName: budgetPlan.planDetails.name,
        monthlyIncome: budgetPlan.monthlyIncome,
        allocations: budgetPlan.planDetails.allocations
      },
      ...analysisResult
    });
  } catch (error) {
    console.error('Error performing budget analysis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET - Get all available budget plans
router.get('/budget-plan/plans', async (req, res) => {
  try {
    const plans = [
      { id: 'bare_minimum', ...BudgetPlan.getPlanDetails('bare_minimum') },
      { id: 'most_popular', ...BudgetPlan.getPlanDetails('most_popular') },
      { id: 'standard', ...BudgetPlan.getPlanDetails('standard') },
      { id: 'stable', ...BudgetPlan.getPlanDetails('stable') },
      { id: 'good', ...BudgetPlan.getPlanDetails('good') }
    ];

    res.status(200).json(plans);
  } catch (error) {
    console.error('Error fetching budget plans:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE - Delete user's budget plan
router.delete('/budget-plan', auth, async (req, res) => {
  try {
    const result = await BudgetPlan.findOneAndDelete({ userId: req.user.id });

    if (!result) {
      return res.status(404).json({ message: 'No budget plan found to delete' });
    }

    res.status(200).json({ message: 'Budget plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget plan:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;