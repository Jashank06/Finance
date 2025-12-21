const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const authMiddleware = require('../middleware/auth');
const { syncExpenseToBillDates } = require('../utils/billExpenseSync');

// Get all transactions for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate({
        path: 'cardId',
        select: 'name issuer type'
      })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Get single transaction
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('cardId', 'name issuer type');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
});

// Create new transaction
router.post('/', authMiddleware, async (req, res) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.user.id
    };
    
    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    // Update card balance if needed (for credit cards, update available credit)
    if (transaction.type === 'purchase' || transaction.type === 'withdrawal') {
      const card = await Card.findById(transaction.cardId);
      if (card && card.type === 'credit-card' && card.availableCredit !== undefined) {
        card.availableCredit = Math.max(0, card.availableCredit - transaction.amount);
        await card.save();
      }
    }
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate({
        path: 'cardId',
        select: 'name issuer type'
      });
    
    // Auto-sync to Bill Dates if expense is for "jo jo"
    try {
      await syncExpenseToBillDates(populatedTransaction.toObject(), req.user.id);
    } catch (syncError) {
      console.error('Bill sync error (non-blocking):', syncError);
    }
    
    res.status(201).json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
});

// Update transaction
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    Object.assign(transaction, req.body);
    await transaction.save();
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate({
        path: 'cardId',
        select: 'name issuer type'
      });
    
    res.json(populatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Restore card balance if it was a purchase/withdrawal
    if (transaction.type === 'purchase' || transaction.type === 'withdrawal') {
      const card = await Card.findById(transaction.cardId);
      if (card && card.type === 'credit-card' && card.availableCredit !== undefined) {
        card.availableCredit = card.availableCredit + transaction.amount;
        await card.save();
      }
    }
    
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
});

// Get transactions by card
router.get('/card/:cardId', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      userId: req.user.id, 
      cardId: req.params.cardId 
    }).populate('cardId', 'name issuer type').sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching card transactions', error: error.message });
  }
});

// Get transaction summary
router.get('/summary/stats', authMiddleware, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy;
    
    switch(period) {
      case 'daily':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
        break;
      case 'weekly':
        groupBy = { $dateToString: { format: "%Y-%U", date: "$date" } };
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
        break;
      case 'yearly':
        groupBy = { $dateToString: { format: "%Y", date: "$date" } };
        break;
      default:
        groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
    }
    
    const summary = await Transaction.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    
    // Category-wise summary
    const categorySummary = await Transaction.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    // Card-wise summary
    const cardSummary = await Transaction.aggregate([
      { $match: { userId: req.user.id } },
      {
        $lookup: {
          from: 'cards',
          localField: 'cardId',
          foreignField: '_id',
          as: 'card'
        }
      },
      { $unwind: '$card' },
      {
        $group: {
          _id: '$cardId',
          cardName: { $first: '$card.name' },
          cardIssuer: { $first: '$card.issuer' },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    res.json({
      periodSummary: summary,
      categorySummary,
      cardSummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
});

module.exports = router;
