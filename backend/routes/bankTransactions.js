const express = require('express');
const router = express.Router();
const BankTransaction = require('../models/BankTransaction');
const Bank = require('../models/Bank');
const auth = require('../middleware/auth');
const { syncExpenseToBillDates } = require('../utils/billExpenseSync');

// GET all bank transactions for a user
router.get('/', auth, async (req, res) => {
  try {
    const section = req.query.section || 'family';
    const filter = { user: req.user.id, section };
    if (req.query.businessId) filter.businessId = req.query.businessId;
    
    const transactions = await BankTransaction.find(filter)
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
    const { accountId, type, amount, merchant, category, broaderCategory, mainCategory, subCategory, customSubCategory, description, date, currency, transactionType, expenseType, payingFor } = req.body;

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
      broaderCategory,
      mainCategory,
      subCategory,
      customSubCategory,
      description,
      date,
      currency,
      transactionType,
      expenseType,
      payingFor, // Include payingFor for cross-module sync
      user: req.user.id,
      section: req.body.section || 'family',
      businessId: req.body.businessId || null
    });

    const savedTransaction = await newTransaction.save();

    // Update Bank balance - Ensure amount is treated as a Number to avoid string concatenation
    const amountNum = parseFloat(amount || 0);
    const currentBalance = parseFloat(account.balance || 0);
    const isDebit = ['withdrawal', 'payment', 'transfer', 'fee', 'expense', 'debit'].includes(type.toLowerCase());
    const isCredit = ['deposit', 'refund', 'income', 'interest', 'credit'].includes(type.toLowerCase());
    
    console.log(`[BANK_TRACE] POST ${account.name}: old=${currentBalance}, amount=${amountNum}, type=${type}`);

    if (isDebit) {
      account.balance = currentBalance - amountNum;
    } else if (isCredit) {
      account.balance = currentBalance + amountNum;
    }
    
    console.log(`[BANK_TRACE] POST ${account.name}: new=${account.balance}`);
    await account.save();

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
    res.status(500).json({ 
      message: 'Error creating bank transaction', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
});

// PUT update a bank transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const { accountId, type, amount, merchant, category, broaderCategory, mainCategory, subCategory, customSubCategory, description, date, currency, transactionType, expenseType, payingFor } = req.body;

    // Find the transaction and verify ownership
    const transaction = await BankTransaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Bank transaction not found' });
    }

    // ALWAYS fetch the account to avoid ReferenceError if accountId hasn't changed
    const account = await Bank.findById(transaction.accountId);
    if (!account) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Calculate balance adjustment
    const oldAmount = parseFloat(transaction.amount || 0);
    const newAmount = parseFloat(amount || 0);
    const oldType = transaction.type.toLowerCase();
    const newType = type.toLowerCase();
    const currentBalance = parseFloat(account.balance || 0);

    const wasDebit = ['withdrawal', 'payment', 'transfer', 'fee', 'expense', 'debit'].includes(oldType);
    const isDebit = ['withdrawal', 'payment', 'transfer', 'fee', 'expense', 'debit'].includes(newType);
    const wasCredit = ['deposit', 'refund', 'income', 'interest', 'credit'].includes(oldType);
    const isCredit = ['deposit', 'refund', 'income', 'interest', 'credit'].includes(newType);

    console.log(`[BANK_TRACE] PUT ${account.name}: old_bal=${currentBalance}, old_amt=${oldAmount}, new_amt=${newAmount}`);

    let tempBalance = currentBalance;
    // Revert old transaction effect
    if (wasDebit) {
      tempBalance = tempBalance + oldAmount;
    } else if (wasCredit) {
      tempBalance = tempBalance - oldAmount;
    }

    // Apply new transaction effect
    if (isDebit) {
      tempBalance = tempBalance - newAmount;
    } else if (isCredit) {
      tempBalance = tempBalance + newAmount;
    }

    account.balance = tempBalance;
    console.log(`[BANK_TRACE] PUT ${account.name}: new_bal=${account.balance}`);
    await account.save();

    // Update the transaction
    const updatedTransaction = await BankTransaction.findByIdAndUpdate(
      req.params.id,
      { accountId, type, amount, merchant, category, broaderCategory, mainCategory, subCategory, customSubCategory, description, date, currency, transactionType, expenseType, payingFor },
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

    // Update Bank balance before deleting
    const account = await Bank.findById(transaction.accountId);
    if (account) {
      const isDebit = ['withdrawal', 'payment', 'transfer', 'fee', 'expense', 'debit'].includes(transaction.type.toLowerCase());
      const isCredit = ['deposit', 'refund', 'income', 'interest', 'credit'].includes(transaction.type.toLowerCase());
      
      if (isDebit) {
        account.balance = Number(account.balance) + Number(transaction.amount);
      } else if (isCredit) {
        account.balance = Number(account.balance) - Number(transaction.amount);
      }
      await account.save();
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

    const section = req.query.section || 'family';
    const transactions = await BankTransaction.find({
      accountId,
      user: req.user.id,
      section
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

    switch (period) {
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

    const section = req.query.section || 'family';
    const matchCondition = { user: req.user.id, section };
    if (req.query.businessId) matchCondition.businessId = req.query.businessId;

    const summary = await BankTransaction.aggregate([
      { $match: matchCondition },
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
    const section = req.query.section || 'family';
    const matchCondition = { user: req.user.id, section };
    if (req.query.businessId) matchCondition.businessId = req.query.businessId;

    const summary = await BankTransaction.aggregate([
      { $match: matchCondition },
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
    const section = req.query.section || 'family';
    const matchCondition = { user: req.user.id, section };
    if (req.query.businessId) matchCondition.businessId = req.query.businessId;

    const summary = await BankTransaction.aggregate([
      { $match: matchCondition },
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
