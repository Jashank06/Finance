const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import models
const Bank = require('../models/Bank');
const BankTransaction = require('../models/BankTransaction');
const CashTransaction = require('../models/CashTransaction');
const Card = require('../models/Card');
const IncomeExpense = require('../models/IncomeExpense');

// Get ScheduledExpense model
const ScheduledExpense = mongoose.model('ScheduledExpense');

// GET cash flow analysis for all banks
router.get('/analysis', auth, async (req, res) => {
  try {
    // Fetch all banks
    const banks = await Bank.find({ userId: req.user.id });

    // Fetch all active scheduled expenses
    const scheduledExpenses = await ScheduledExpense.find({ userId: req.user.id, isActive: true });

    // Fetch all bank transactions
    const bankTransactions = await BankTransaction.find({ user: req.user.id });

    // Calculate cash flow for each bank
    const cashFlowData = banks.map(bank => {
      // Calculate actual balance including transactions
      let actualBalance = parseFloat(bank.balance || 0);

      // Get transactions for this bank
      const accountTransactions = bankTransactions.filter(transaction => {
        const transactionAccountId = typeof transaction.accountId === 'object'
          ? transaction.accountId._id?.toString() || transaction.accountId.toString()
          : transaction.accountId?.toString();

        return transactionAccountId === bank._id.toString();
      });

      // Apply transaction adjustments
      const netTransactionAmount = accountTransactions.reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount || 0);
        if (transaction.type === 'deposit') {
          return total + amount;
        } else if (transaction.type === 'withdrawal' || transaction.type === 'payment' || transaction.type === 'transfer') {
          return total - amount;
        }
        return total;
      }, 0);

      actualBalance += netTransactionAmount;

      // Calculate total monthly expenses for this bank
      const bankExpenses = scheduledExpenses.filter(
        expense => expense.bankAccount === bank.accountNumber
      );

      // Calculate total monthly expense amount
      const monthlyExpenses = bankExpenses.reduce((total, expense) => {
        let monthlyAmount = parseFloat(expense.amount || 0);

        // Convert to monthly equivalent
        switch (expense.frequency) {
          case 'monthly':
            break; // Already monthly
          case 'quarterly':
            monthlyAmount = monthlyAmount / 3;
            break;
          case 'yearly':
            monthlyAmount = monthlyAmount / 12;
            break;
          case 'one-time':
            // Check if due this month
            const dueDate = new Date(expense.dueDate);
            const now = new Date();
            if (dueDate.getMonth() === now.getMonth() &&
              dueDate.getFullYear() === now.getFullYear()) {
              monthlyAmount = monthlyAmount;
            } else {
              monthlyAmount = 0;
            }
            break;
          default:
            break;
        }

        return total + monthlyAmount;
      }, 0);

      // Calculate surplus/deficit
      const cashFlow = actualBalance - monthlyExpenses;
      const status = cashFlow >= 0 ? 'surplus' : 'deficit';

      // Determine health status
      let healthStatus = 'healthy';
      if (cashFlow < 0) {
        healthStatus = 'critical';
      } else if (cashFlow < monthlyExpenses * 0.2) {
        healthStatus = 'warning';
      }

      return {
        bankId: bank._id,
        bankName: bank.bankName,
        accountHolderName: bank.accountHolderName,
        accountNumber: bank.accountNumber,
        actualBalance: Math.round(actualBalance * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        cashFlow: Math.round(cashFlow * 100) / 100,
        status,
        healthStatus,
        expenseCount: bankExpenses.length,
        expenses: bankExpenses.map(exp => ({
          title: exp.title,
          amount: exp.amount,
          dueDate: exp.dueDate,
          frequency: exp.frequency,
          category: exp.category
        }))
      };
    });

    // Generate transfer suggestions
    const suggestions = generateTransferSuggestions(cashFlowData);

    // Calculate summary
    const summary = {
      totalBanks: banks.length,
      totalBalance: cashFlowData.reduce((sum, b) => sum + b.actualBalance, 0),
      totalMonthlyExpenses: cashFlowData.reduce((sum, b) => sum + b.monthlyExpenses, 0),
      totalCashFlow: cashFlowData.reduce((sum, b) => sum + b.cashFlow, 0),
      banksInDeficit: cashFlowData.filter(b => b.status === 'deficit').length,
      banksInSurplus: cashFlowData.filter(b => b.status === 'surplus').length,
      criticalBanks: cashFlowData.filter(b => b.healthStatus === 'critical').length,
      warningBanks: cashFlowData.filter(b => b.healthStatus === 'warning').length
    };

    res.json({
      success: true,
      summary,
      banks: cashFlowData,
      suggestions
    });

  } catch (error) {
    console.error('Error analyzing cash flow:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing cash flow',
      error: error.message
    });
  }
});

// Helper function to generate transfer suggestions
function generateTransferSuggestions(cashFlowData) {
  const suggestions = [];

  // Get banks with deficit and surplus
  const deficitBanks = cashFlowData
    .filter(b => b.status === 'deficit')
    .sort((a, b) => a.cashFlow - b.cashFlow); // Most critical first

  const surplusBanks = cashFlowData
    .filter(b => b.status === 'surplus' && b.cashFlow > b.monthlyExpenses * 0.5) // Has significant surplus
    .sort((a, b) => b.cashFlow - a.cashFlow); // Most surplus first

  // Match deficit banks with surplus banks
  for (const deficitBank of deficitBanks) {
    const amountNeeded = Math.abs(deficitBank.cashFlow);

    for (const surplusBank of surplusBanks) {
      if (surplusBank.cashFlow > 0) {
        // Calculate safe transfer amount (don't drain surplus bank completely)
        const safeTransferAmount = Math.min(
          amountNeeded,
          surplusBank.cashFlow * 0.7, // Transfer max 70% of surplus
          surplusBank.actualBalance * 0.5 // Don't transfer more than 50% of balance
        );

        if (safeTransferAmount >= 1000) { // Only suggest if meaningful amount
          suggestions.push({
            fromBank: {
              name: surplusBank.bankName,
              accountHolder: surplusBank.accountHolderName,
              accountNumber: surplusBank.accountNumber,
              currentBalance: surplusBank.actualBalance,
              surplus: surplusBank.cashFlow
            },
            toBank: {
              name: deficitBank.bankName,
              accountHolder: deficitBank.accountHolderName,
              accountNumber: deficitBank.accountNumber,
              currentBalance: deficitBank.actualBalance,
              deficit: Math.abs(deficitBank.cashFlow)
            },
            suggestedAmount: Math.round(safeTransferAmount),
            reason: `Transfer to cover ₹${Math.abs(deficitBank.cashFlow).toLocaleString('en-IN')} deficit in ${deficitBank.bankName}`,
            priority: deficitBank.healthStatus === 'critical' ? 'high' : 'medium'
          });

          // Reduce available surplus
          surplusBank.cashFlow -= safeTransferAmount;
          break; // Move to next deficit bank
        }
      }
    }
  }

  return suggestions;
}

// GET monthly income calculation for Budget Plan
router.get('/monthly-income', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Calculate last month's date range
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Fetch income from IncomeExpense model
    const incomeExpenseRecords = await IncomeExpense.find({
      userId: userId,
      type: 'income',
      isActive: true,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    
    const incomeExpenseTotal = incomeExpenseRecords.reduce((sum, record) => 
      sum + (parseFloat(record.amount) || 0), 0);
    
    // Fetch income from Bank transactions (deposits that are income)
    const bankTransactions = await BankTransaction.find({
      user: userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      type: 'deposit',
      transactionType: { $ne: 'transfer' } // Exclude internal transfers
    });
    
    const bankIncome = bankTransactions.reduce((sum, txn) => 
      sum + (parseFloat(txn.amount) || 0), 0);
    
    // Fetch income from Cash transactions
    const cashTransactions = await CashTransaction.find({
      userId: userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      type: 'income'
    });
    
    const cashIncome = cashTransactions.reduce((sum, txn) => 
      sum + (parseFloat(txn.amount) || 0), 0);
    
    // Calculate total income
    const totalIncome = incomeExpenseTotal + bankIncome + cashIncome;
    
    res.json({
      success: true,
      data: {
        lastMonthIncome: totalIncome,
        lastMonthPeriod: {
          start: lastMonthStart.toISOString().slice(0, 10),
          end: lastMonthEnd.toISOString().slice(0, 10)
        },
        breakdown: {
          incomeExpense: incomeExpenseTotal,
          bank: bankIncome,
          cash: cashIncome
        }
      }
    });
  } catch (error) {
    console.error('Error calculating monthly income:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating monthly income', 
      error: error.message 
    });
  }
});

// GET monthly expenses calculation for Emergency Fund
router.get('/monthly-expenses', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    // Calculate last month's date range
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Fetch all expense transactions from last month
    const bankTransactions = await BankTransaction.find({
      user: userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      transactionType: 'Expense'
    });
    
    const cashTransactions = await CashTransaction.find({
      userId: userId,
      date: { $gte: lastMonthStart, $lte: lastMonthEnd },
      transactionType: 'Expense'
    });
    
    // Fetch card transactions (expenses)
    const cards = await Card.find({ userId: userId });
    let cardExpenses = 0;
    
    for (const card of cards) {
      if (card.transactions && Array.isArray(card.transactions)) {
        const cardTxns = card.transactions.filter(txn => {
          const txnDate = new Date(txn.date);
          return txnDate >= lastMonthStart && 
                 txnDate <= lastMonthEnd && 
                 txn.transactionType === 'Expense';
        });
        cardExpenses += cardTxns.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0);
      }
    }
    
    // Calculate total expenses
    const bankExpenses = bankTransactions.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0);
    const cashExpensesTotal = cashTransactions.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0);
    
    const totalExpenses = bankExpenses + cashExpensesTotal + cardExpenses;
    
    // Calculate average (in case we want to show current month too)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthTransactions = await BankTransaction.find({
      user: userId,
      date: { $gte: currentMonthStart },
      transactionType: 'Expense'
    });
    
    const currentCashTransactions = await CashTransaction.find({
      userId: userId,
      date: { $gte: currentMonthStart },
      transactionType: 'Expense'
    });
    
    let currentCardExpenses = 0;
    for (const card of cards) {
      if (card.transactions && Array.isArray(card.transactions)) {
        const cardTxns = card.transactions.filter(txn => {
          const txnDate = new Date(txn.date);
          return txnDate >= currentMonthStart && txn.transactionType === 'Expense';
        });
        currentCardExpenses += cardTxns.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0);
      }
    }
    
    const currentMonthExpenses = 
      currentMonthTransactions.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0) +
      currentCashTransactions.reduce((sum, txn) => sum + (parseFloat(txn.amount) || 0), 0) +
      currentCardExpenses;
    
    res.json({
      success: true,
      data: {
        lastMonthExpenses: totalExpenses,
        currentMonthExpenses: currentMonthExpenses,
        lastMonthPeriod: {
          start: lastMonthStart.toISOString().slice(0, 10),
          end: lastMonthEnd.toISOString().slice(0, 10)
        },
        breakdown: {
          bank: bankExpenses,
          cash: cashExpensesTotal,
          card: cardExpenses
        }
      }
    });
  } catch (error) {
    console.error('Error calculating monthly expenses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating monthly expenses', 
      error: error.message 
    });
  }
});

module.exports = router;
