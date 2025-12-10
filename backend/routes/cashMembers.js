const express = require('express');
const router = express.Router();
const CashMember = require('../models/CashMember');
const CashTransaction = require('../models/CashTransaction');
const auth = require('../middleware/auth');

// Get all cash members for a user
router.get('/', auth, async (req, res) => {
  try {
    const members = await CashMember.find({ userId: req.user.id, isActive: true }).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    console.error('Error fetching cash members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single cash member with balance calculation
router.get('/:id', auth, async (req, res) => {
  try {
    const member = await CashMember.findOne({ _id: req.params.id, userId: req.user.id });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Calculate current balance from transactions
    const transactions = await CashTransaction.find({ memberId: req.params.id });
    let balance = member.initialBalance;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        balance -= transaction.amount;
      } else if (transaction.type === 'income') {
        balance += transaction.amount;
      }
    });
    
    member.currentBalance = balance;
    await member.save();
    
    res.json(member);
  } catch (error) {
    console.error('Error fetching cash member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new cash member
router.post('/', auth, async (req, res) => {
  try {
    const { name, relation, budget, initialBalance, currency, notes } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ message: 'Name and relation are required' });
    }

    const member = new CashMember({
      userId: req.user.id,
      name,
      relation,
      budget: parseFloat(budget) || 0,
      initialBalance: parseFloat(initialBalance) || 0,
      currentBalance: parseFloat(initialBalance) || 0,
      currency: currency || 'INR',
      notes
    });

    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    console.error('Error creating cash member:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update cash member
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Convert numeric fields
    if (updates.budget !== undefined) {
      updates.budget = parseFloat(updates.budget);
    }
    if (updates.initialBalance !== undefined) {
      updates.initialBalance = parseFloat(updates.initialBalance);
    }
    if (updates.currentBalance !== undefined) {
      updates.currentBalance = parseFloat(updates.currentBalance);
    }
    
    const member = await CashMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Error updating cash member:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete cash member (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await CashMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isActive: false },
      { new: true }
    );
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get member summary with transaction count and spent amount
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const member = await CashMember.findOne({ _id: req.params.id, userId: req.user.id });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const transactions = await CashTransaction.find({ memberId: req.params.id });
    
    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentBalance = member.initialBalance + totalIncome - totalSpent;
    
    res.json({
      member,
      summary: {
        transactionCount: transactions.length,
        totalSpent,
        totalIncome,
        currentBalance,
        budgetRemaining: member.budget - totalSpent
      }
    });
  } catch (error) {
    console.error('Error fetching member summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
