const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Target = require('../models/Target');

// Cheque Register Schema
const chequeRegisterSchema = new mongoose.Schema({
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
router.get('/cheque-register', async (req, res) => {
  try {
    const records = await ChequeRegister.find().sort({ receivedDate: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching cheque records:', error);
    res.status(500).json({ message: 'Error fetching cheque records', error: error.message });
  }
});

// GET single cheque record
router.get('/cheque-register/:id', async (req, res) => {
  try {
    const record = await ChequeRegister.findById(req.params.id);
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
router.post('/cheque-register', async (req, res) => {
  try {
    // Calculate difference if both dates are provided
    if (req.body.receivedDate && req.body.chequeDepositDate) {
      const receivedDate = new Date(req.body.receivedDate);
      const depositDate = new Date(req.body.chequeDepositDate);
      const diffTime = Math.abs(depositDate - receivedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      req.body.difference = diffDays;
    }

    const record = new ChequeRegister(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating cheque record:', error);
    res.status(400).json({ message: 'Error creating cheque record', error: error.message });
  }
});

// PUT update cheque record
router.put('/cheque-register/:id', async (req, res) => {
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
    const record = await ChequeRegister.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
router.delete('/cheque-register/:id', async (req, res) => {
  try {
    const record = await ChequeRegister.findByIdAndDelete(req.params.id);
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
router.get('/daily-cash', async (req, res) => {
  try {
    const records = await DailyCash.find().sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching cash records:', error);
    res.status(500).json({ message: 'Error fetching cash records', error: error.message });
  }
});

// GET single cash record
router.get('/daily-cash/:id', async (req, res) => {
  try {
    const record = await DailyCash.findById(req.params.id);
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
router.post('/daily-cash', async (req, res) => {
  try {
    const record = new DailyCash(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating cash record:', error);
    res.status(400).json({ message: 'Error creating cash record', error: error.message });
  }
});

// PUT update cash record
router.put('/daily-cash/:id', async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const record = await DailyCash.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
router.delete('/daily-cash/:id', async (req, res) => {
  try {
    const record = await DailyCash.findByIdAndDelete(req.params.id);
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
router.get('/milestones', async (req, res) => {
  try {
    const records = await Milestone.find().sort({ startDate: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
});

// GET single milestone
router.get('/milestones/:id', async (req, res) => {
  try {
    const record = await Milestone.findById(req.params.id);
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
router.post('/milestones', async (req, res) => {
  try {
    const record = new Milestone(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(400).json({ message: 'Error creating milestone', error: error.message });
  }
});

// PUT update milestone
router.put('/milestones/:id', async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const record = await Milestone.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
router.delete('/milestones/:id', async (req, res) => {
  try {
    const record = await Milestone.findByIdAndDelete(req.params.id);
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
router.get('/analytics/cheque-register', async (req, res) => {
  try {
    const totalRecords = await ChequeRegister.countDocuments();
    const totalDeposits = await ChequeRegister.aggregate([
      { $group: { _id: null, total: { $sum: '$deposit' } } }
    ]);
    const totalWithdrawals = await ChequeRegister.aggregate([
      { $group: { _id: null, total: { $sum: '$withdrawal' } } }
    ]);
    const avgDelayDays = await ChequeRegister.aggregate([
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
router.get('/analytics/daily-cash', async (req, res) => {
  try {
    const totalRecords = await DailyCash.countDocuments();
    const totalCredits = await DailyCash.aggregate([
      { $group: { _id: null, total: { $sum: '$credit' } } }
    ]);
    const totalDebits = await DailyCash.aggregate([
      { $group: { _id: null, total: { $sum: '$debit' } } }
    ]);
    const categoryBreakdown = await DailyCash.aggregate([
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
router.get('/analytics/milestones', async (req, res) => {
  try {
    const totalMilestones = await Milestone.countDocuments();
    const statusBreakdown = await Milestone.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const priorityBreakdown = await Milestone.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const avgProgress = await Milestone.aggregate([
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
router.get('/targets-for-life', async (req, res) => {
  try {
    const targets = await Target.find().sort({ createdAt: -1 });
    res.json(targets);
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({ message: 'Error fetching targets', error: error.message });
  }
});

router.post('/targets-for-life', async (req, res) => {
  try {
    const target = new Target({
      goalType: req.body.goalType,
      specificGoal: req.body.specificGoal,
      timeHorizon: req.body.timeHorizon,
      estimatedCost: req.body.estimatedCost,
      recommendedInvestmentVehicle: req.body.recommendedInvestmentVehicle,
      riskTolerance: req.body.riskTolerance,
      targetDate: req.body.targetDate
    });
    const savedTarget = await target.save();
    res.status(201).json(savedTarget);
  } catch (error) {
    console.error('Error creating target:', error);
    res.status(400).json({ message: 'Error creating target', error: error.message });
  }
});

router.put('/targets-for-life/:id', async (req, res) => {
  try {
    const target = await Target.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          goalType: req.body.goalType,
          specificGoal: req.body.specificGoal,
          timeHorizon: req.body.timeHorizon,
          estimatedCost: req.body.estimatedCost,
          recommendedInvestmentVehicle: req.body.recommendedInvestmentVehicle,
          riskTolerance: req.body.riskTolerance,
          targetDate: req.body.targetDate,
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

router.delete('/targets-for-life/:id', async (req, res) => {
  try {
    const target = await Target.findByIdAndDelete(req.params.id);
    if (!target) {
      return res.status(404).json({ message: 'Target not found' });
    }
    res.json({ message: 'Target deleted successfully' });
  } catch (error) {
    console.error('Error deleting target:', error);
    res.status(500).json({ message: 'Error deleting target', error: error.message });
  }
});

module.exports = router;