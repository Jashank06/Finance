const express = require('express');
const router = express.Router();
const CashTransaction = require('../models/CashTransaction');
const CashMember = require('../models/CashMember');
const auth = require('../middleware/auth');
const { syncExpenseToBillDates } = require('../utils/billExpenseSync');

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await CashTransaction.find({ userId: req.user.id })
      .populate('memberId', 'name relation')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching cash transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transactions for a specific member
router.get('/member/:memberId', auth, async (req, res) => {
  try {
    const transactions = await CashTransaction.find({ 
      userId: req.user.id, 
      memberId: req.params.memberId 
    })
    .populate('memberId', 'name relation')
    .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching member transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await CashTransaction.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('memberId', 'name relation');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new transaction
router.post('/', auth, async (req, res) => {
  try {
    const {
      memberId,
      type,
      amount,
      category,
      description,
      date,
      transactionType,
      expenseType,
      modeOfTransaction,
      paymentMethod,
      location,
      notes,
      narration
    } = req.body;

    if (!memberId || !type || !amount || !description) {
      return res.status(400).json({ message: 'Member, type, amount, and description are required' });
    }

    // Verify member exists and belongs to user
    const member = await CashMember.findOne({ _id: memberId, userId: req.user.id });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const amountNum = parseFloat(amount);

    const transaction = new CashTransaction({
      userId: req.user.id,
      memberId,
      type,
      amount: amountNum,
      category,
      description,
      date: date || Date.now(),
      transactionType,
      expenseType,
      modeOfTransaction: modeOfTransaction || 'cash',
      paymentMethod,
      location,
      notes,
      narration
    });

    const savedTransaction = await transaction.save();
    
    // Update member's current balance
    let newBalance = member.currentBalance;
    if (type === 'expense') {
      newBalance -= amountNum;
    } else if (type === 'income') {
      newBalance += amountNum;
    }
    
    member.currentBalance = newBalance;
    await member.save();
    
    // Populate member info before returning
    await savedTransaction.populate('memberId', 'name relation');
    
    // Auto-sync to Bill Dates if expense is for "jo jo"
    try {
      await syncExpenseToBillDates(savedTransaction.toObject(), req.user.id);
    } catch (syncError) {
      console.error('Bill sync error (non-blocking):', syncError);
    }
    
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const oldTransaction = await CashTransaction.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Get member to update balance
    const member = await CashMember.findById(oldTransaction.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Reverse old transaction effect on balance
    if (oldTransaction.type === 'expense') {
      member.currentBalance += oldTransaction.amount;
    } else if (oldTransaction.type === 'income') {
      member.currentBalance -= oldTransaction.amount;
    }

    // Update transaction
    const updates = { ...req.body };
    if (updates.amount !== undefined) {
      updates.amount = parseFloat(updates.amount);
    }
    
    const transaction = await CashTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    ).populate('memberId', 'name relation');

    // Apply new transaction effect on balance
    if (transaction.type === 'expense') {
      member.currentBalance -= transaction.amount;
    } else if (transaction.type === 'income') {
      member.currentBalance += transaction.amount;
    }
    
    await member.save();

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await CashTransaction.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Get member to update balance
    const member = await CashMember.findById(transaction.memberId);
    if (member) {
      // Reverse transaction effect on balance
      if (transaction.type === 'expense') {
        member.currentBalance += transaction.amount;
      } else if (transaction.type === 'income') {
        member.currentBalance -= transaction.amount;
      }
      await member.save();
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction statistics for a member
router.get('/member/:memberId/stats', auth, async (req, res) => {
  try {
    const stats = await CashTransaction.aggregate([
      { 
        $match: { 
          userId: req.user.id, 
          memberId: mongoose.Types.ObjectId(req.params.memberId) 
        } 
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
