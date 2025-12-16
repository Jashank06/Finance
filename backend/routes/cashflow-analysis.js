const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Import models
const Bank = require('../models/Bank');
const BankTransaction = require('../models/BankTransaction');

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

module.exports = router;
