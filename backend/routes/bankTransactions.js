const express = require('express');
const router = express.Router();
const BankTransaction = require('../models/BankTransaction');
const Bank = require('../models/Bank');
const auth = require('../middleware/auth');
const { syncExpenseToBillDates } = require('../utils/billExpenseSync');

// GET all bank transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await BankTransaction.find({ user: req.user.id })
      .populate({ path: 'accountId', select: 'name bankName type' })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching bank transactions:', error);
    res.status(500).json({ message: 'Error fetching bank transactions' });
  }
});

// POST a new bank transaction
router.post('/', auth, async (req, res) => {
  try {
    const { accountId, type, amount, merchant, category, description, date, currency, transactionType, expenseType } = req.body;
    
    // Validate that the account belongs to the user
    const account = await Bank.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    const newTransaction = new BankTransaction({
      accountId,
      type,
      amount,
      merchant,
      category,
      description,
      date,
      currency,
      transactionType,
      expenseType,
      user: req.user.id
    });

    const savedTransaction = await newTransaction.save();
    
    // Return the transaction with populated account details
    const populatedTransaction = await BankTransaction.findById(savedTransaction._id)
      .populate({ path: 'accountId', select: 'name bankName type' });
    
    // Auto-sync to Bill Dates if expense is for "jo jo"
    try {
      await syncExpenseToBillDates(populatedTransaction.toObject(), req.user.id);
    } catch (syncError) {
      console.error('Bill sync error (non-blocking):', syncError);
    }
    
    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error('Error creating bank transaction:', error);
    res.status(500).json({ message: 'Error creating bank transaction' });
  }
});

// PUT update a bank transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { accountId, type, amount, merchant, category, description, date, currency, transactionType, expenseType } = req.body;
    
    // Find the transaction and verify ownership
    const transaction = await BankTransaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Bank transaction not found' });
    }

    // If accountId is being changed, validate the new account
    if (accountId && accountId !== transaction.accountId.toString()) {
      const account = await Bank.findOne({ _id: accountId, userId: req.user.id });
      if (!account) {
        return res.status(404).json({ message: 'Bank account not found' });
      }
    }

    // Update the transaction
    const updatedTransaction = await BankTransaction.findByIdAndUpdate(
      req.params.id,
      { accountId, type, amount, merchant, category, description, date, currency, transactionType, expenseType },
      { new: true }
    ).populate({ path: 'accountId', select: 'name bankName type' });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating bank transaction:', error);
    res.status(500).json({ message: 'Error updating bank transaction' });
  }
});

// DELETE a bank transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await BankTransaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Bank transaction not found' });
    }

    await BankTransaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bank transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank transaction:', error);
    res.status(500).json({ message: 'Error deleting bank transaction' });
  }
});

// GET bank transactions by account
router.get('/account/:accountId', auth, async (req, res) => {
  try {
    const { accountId } = req.params;
    
    // Verify the account belongs to the user
    const account = await Bank.findOne({ _id: accountId, userId: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    const transactions = await BankTransaction.find({ 
      accountId, 
      user: req.user.id 
    })
      .populate({ path: 'accountId', select: 'name bankName type' })
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching bank transactions for account:', error);
    res.status(500).json({ message: 'Error fetching bank transactions for account' });
  }
});

// GET bank transactions summary by period
router.get('/summary/period', auth, async (req, res) => {
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

    const summary = await BankTransaction.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: groupBy,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching bank transactions summary:', error);
    res.status(500).json({ message: 'Error fetching bank transactions summary' });
  }
});

// GET bank transactions summary by category
router.get('/summary/category', auth, async (req, res) => {
  try {
    const summary = await BankTransaction.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching bank transactions category summary:', error);
    res.status(500).json({ message: 'Error fetching bank transactions category summary' });
  }
});

// GET bank transactions summary by account
router.get('/summary/account', auth, async (req, res) => {
  try {
    const summary = await BankTransaction.aggregate([
      { $match: { user: req.user.id } },
      {
        $lookup: {
          from: 'banks',
          localField: 'accountId',
          foreignField: '_id',
          as: 'account'
        }
      },
      { $unwind: '$account' },
      {
        $group: {
          _id: '$accountId',
          accountName: { $first: '$account.name' },
          bankName: { $first: '$account.bankName' },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          transactions: { $push: "$$ROOT" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching bank transactions account summary:', error);
    res.status(500).json({ message: 'Error fetching bank transactions account summary' });
  }
});

module.exports = router;
