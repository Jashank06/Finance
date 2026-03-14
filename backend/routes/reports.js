const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Models
const BankTransaction = require('../models/BankTransaction');
const CashTransaction = require('../models/CashTransaction');
const Transaction = require('../models/Transaction'); // Card transactions
const Loan = require('../models/Loan');
const Investment = require('../models/Investment');
const MutualFund = require('../models/MutualFund');
const Insurance = require('../models/Insurance');
const Share = require('../models/Share');
const IncomeExpense = require('../models/IncomeExpense');
const Target = require('../models/Target');

// ============================================================
// HELPER: Combine all expense transactions from all sources
// ============================================================
async function getAllExpenseTransactions(userId, filters = {}) {
  const dateFilter = filters.dateFrom || filters.dateTo
    ? {
        date: {
          ...(filters.dateFrom ? { $gte: new Date(filters.dateFrom) } : {}),
          ...(filters.dateTo ? { $lte: new Date(filters.dateTo) } : {}),
        },
      }
    : {};

  const [bankTxns, cashTxns, cardTxns] = await Promise.all([
    BankTransaction.find({ user: userId, type: { $in: ['debit', 'expense', 'withdrawal', 'payment', 'fee', 'transfer'] }, ...dateFilter })
      .populate({ path: 'accountId', select: 'name bankName' }).lean(),
    CashTransaction.find({ userId, type: 'expense', ...dateFilter }).lean(),
    Transaction.find({ userId, type: 'debit', ...dateFilter }).lean(),
  ]);

  // Normalize to unified format
  const normalize = (txn, source) => ({
    _id: txn._id,
    amount: parseFloat(txn.amount || 0),
    date: txn.date,
    broaderCategory: txn.broaderCategory || 'Uncategorized',
    mainCategory: txn.mainCategory || 'Uncategorized',
    subCategory: txn.subCategory || txn.customSubCategory || 'Uncategorized',
    expenseType: txn.expenseType || null,
    merchant: txn.merchant || txn.description || 'N/A',
    description: txn.description || txn.narration || '',
    source,
    account: source === 'bank' ? txn.accountId : source,
  });

  return [
    ...bankTxns.map(t => normalize(t, 'bank')),
    ...cashTxns.map(t => normalize(t, 'cash')),
    ...cardTxns.map(t => normalize(t, 'card')),
  ];
}

// ============================================================
// REPORT 4: EXPENSES / SPENDING
// GET /api/reports/expenses-spending
// ============================================================
router.get('/expenses-spending', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateFrom, dateTo, period } = req.query;

    // Default to current month if no date provided
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const filters = {
      dateFrom: dateFrom || defaultFrom.toISOString(),
      dateTo: dateTo || defaultTo.toISOString(),
    };

    const allTxns = await getAllExpenseTransactions(userId, filters);

    // Build 3-level hierarchy: broader -> main -> sub
    const hierarchy = {};
    let totalExpenses = 0;

    for (const txn of allTxns) {
      const { broaderCategory, mainCategory, subCategory, amount, expenseType } = txn;
      totalExpenses += amount;

      if (!hierarchy[broaderCategory]) {
        hierarchy[broaderCategory] = { total: 0, mainCategories: {} };
      }
      hierarchy[broaderCategory].total += amount;

      if (!hierarchy[broaderCategory].mainCategories[mainCategory]) {
        hierarchy[broaderCategory].mainCategories[mainCategory] = { total: 0, subCategories: {} };
      }
      hierarchy[broaderCategory].mainCategories[mainCategory].total += amount;

      if (!hierarchy[broaderCategory].mainCategories[mainCategory].subCategories[subCategory]) {
        hierarchy[broaderCategory].mainCategories[mainCategory].subCategories[subCategory] = { total: 0, count: 0, transactions: [] };
      }
      hierarchy[broaderCategory].mainCategories[mainCategory].subCategories[subCategory].total += amount;
      hierarchy[broaderCategory].mainCategories[mainCategory].subCategories[subCategory].count++;
    }

    // ExpenseType breakdown
    const expenseTypeBreakdown = {
      'important-necessary': { total: 0, count: 0, label: 'Important & Necessary' },
      'basic-necessity': { total: 0, count: 0, label: 'Basic Necessity' },
      'less-important': { total: 0, count: 0, label: 'Less Important' },
      'avoidable-loss': { total: 0, count: 0, label: 'Avoidable & Loss' },
      'unnecessary': { total: 0, count: 0, label: 'Unnecessary' },
      'unclassified': { total: 0, count: 0, label: 'Not Classified' },
    };

    for (const txn of allTxns) {
      const key = txn.expenseType || 'unclassified';
      if (expenseTypeBreakdown[key]) {
        expenseTypeBreakdown[key].total += txn.amount;
        expenseTypeBreakdown[key].count++;
      }
    }

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthTxns = await getAllExpenseTransactions(userId, {
        dateFrom: mStart.toISOString(),
        dateTo: mEnd.toISOString(),
      });
      const monthTotal = monthTxns.reduce((s, t) => s + t.amount, 0);
      monthlyTrend.push({
        month: mStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
        total: Math.round(monthTotal),
        count: monthTxns.length,
      });
    }

    // Convert hierarchy to array format for frontend
    const categoryTree = Object.entries(hierarchy).map(([broader, bData]) => ({
      broaderCategory: broader,
      total: Math.round(bData.total * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((bData.total / totalExpenses) * 1000) / 10 : 0,
      mainCategories: Object.entries(bData.mainCategories).map(([main, mData]) => ({
        mainCategory: main,
        total: Math.round(mData.total * 100) / 100,
        percentage: bData.total > 0 ? Math.round((mData.total / bData.total) * 1000) / 10 : 0,
        subCategories: Object.entries(mData.subCategories).map(([sub, sData]) => ({
          subCategory: sub,
          total: Math.round(sData.total * 100) / 100,
          count: sData.count,
        })).sort((a, b) => b.total - a.total),
      })).sort((a, b) => b.total - a.total),
    })).sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      period: { from: filters.dateFrom, to: filters.dateTo },
      summary: {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalTransactions: allTxns.length,
      },
      categoryTree,
      expenseTypeBreakdown: Object.entries(expenseTypeBreakdown).map(([key, val]) => ({
        key,
        ...val,
        total: Math.round(val.total * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((val.total / totalExpenses) * 1000) / 10 : 0,
      })),
      monthlyTrend,
    });
  } catch (error) {
    console.error('Reports - Expenses/Spending error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// REPORT 2: LEARNING
// GET /api/reports/learning
// ============================================================
router.get('/learning', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOf6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const allTxns = await getAllExpenseTransactions(userId, {
      dateFrom: startOf6Months.toISOString(),
      dateTo: now.toISOString(),
    });

    // 1. Sin Expenses: avoidable-loss + unnecessary + "Sin Expenses" broader category
    const sinTxns = allTxns.filter(t =>
      t.expenseType === 'avoidable-loss' ||
      t.expenseType === 'unnecessary' ||
      t.broaderCategory?.toLowerCase().includes('sin')
    );

    const sinBySubCategory = {};
    for (const t of sinTxns) {
      const key = t.subCategory || t.mainCategory || 'Other';
      if (!sinBySubCategory[key]) sinBySubCategory[key] = { total: 0, count: 0 };
      sinBySubCategory[key].total += t.amount;
      sinBySubCategory[key].count++;
    }

    const sinCategories = Object.entries(sinBySubCategory)
      .map(([name, d]) => ({ name, total: Math.round(d.total), count: d.count }))
      .sort((a, b) => b.total - a.total);

    // 2. Monthly sin trend
    const sinMonthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const mTxns = await getAllExpenseTransactions(userId, {
        dateFrom: mStart.toISOString(),
        dateTo: mEnd.toISOString(),
      });
      const sinTotal = mTxns
        .filter(t => t.expenseType === 'avoidable-loss' || t.expenseType === 'unnecessary' || t.broaderCategory?.toLowerCase().includes('sin'))
        .reduce((s, t) => s + t.amount, 0);

      // Income for that month
      const incomeRecs = await IncomeExpense.find({
        userId, type: 'income', isActive: true,
        date: { $gte: mStart, $lte: mEnd },
      });
      const bankCredits = await BankTransaction.find({
        user: userId, type: { $in: ['credit', 'deposit'] },
        date: { $gte: mStart, $lte: mEnd },
      });
      const monthIncome = incomeRecs.reduce((s, r) => s + r.amount, 0) +
        bankCredits.reduce((s, r) => s + r.amount, 0);
      const monthExpenses = mTxns.reduce((s, t) => s + t.amount, 0);

      sinMonthlyTrend.push({
        month: mStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
        sinExpenses: Math.round(sinTotal),
        totalExpenses: Math.round(monthExpenses),
        income: Math.round(monthIncome),
        overflow: monthExpenses > monthIncome ? Math.round(monthExpenses - monthIncome) : 0,
        hasOverflow: monthExpenses > monthIncome,
      });
    }

    // 3. Fines & Penalties from transactions
    const fineTxns = allTxns.filter(t =>
      t.subCategory?.toLowerCase().includes('fine') ||
      t.subCategory?.toLowerCase().includes('penalt') ||
      t.subCategory?.toLowerCase().includes('late') ||
      t.subCategory?.toLowerCase().includes('bribe') ||
      t.description?.toLowerCase().includes('fine') ||
      t.description?.toLowerCase().includes('penalt')
    );

    // 4. Expense overflow: months where expense > income
    const overflowMonths = sinMonthlyTrend.filter(m => m.hasOverflow);

    // 5. Investment shortfall: check targets vs actual investments
    const targets = await Target.find({ userId }).lean();
    const investments = await Investment.find({ userId, category: { $in: ['nps-ppf', 'gold-sgb', 'bank-schemes', 'valuation'] } }).lean();
    const totalInvested = investments.reduce((s, inv) => s + (inv.amount || 0), 0);
    const totalTargeted = targets.reduce((s, t) => s + (t.estimatedCost || 0), 0);

    res.json({
      success: true,
      sinExpenses: {
        total: Math.round(sinTxns.reduce((s, t) => s + t.amount, 0)),
        count: sinTxns.length,
        byCategory: sinCategories,
        recentTransactions: sinTxns.slice(0, 10).map(t => ({
          date: t.date,
          merchant: t.merchant,
          amount: t.amount,
          category: t.subCategory || t.mainCategory,
          expenseType: t.expenseType,
        })),
      },
      expenseOverflow: {
        overflowMonths: overflowMonths.length,
        totalOverflow: overflowMonths.reduce((s, m) => s + m.overflow, 0),
        months: overflowMonths,
      },
      investmentShortfall: {
        totalTargeted: Math.round(totalTargeted),
        totalInvested: Math.round(totalInvested),
        shortfall: Math.max(0, Math.round(totalTargeted - totalInvested)),
        targets: targets.map(t => ({
          goal: t.specificGoal,
          goalType: t.goalType,
          estimatedCost: t.estimatedCost,
          targetDate: t.targetDate,
        })),
      },
      finesAndPenalties: {
        total: Math.round(fineTxns.reduce((s, t) => s + t.amount, 0)),
        count: fineTxns.length,
        transactions: fineTxns.map(t => ({
          date: t.date,
          merchant: t.merchant,
          amount: t.amount,
          description: t.description,
          category: t.subCategory,
        })),
      },
      monthlyTrend: sinMonthlyTrend,
    });
  } catch (error) {
    console.error('Reports - Learning error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// REPORT 1: STATUS & MONITORING
// GET /api/reports/status-monitoring
// ============================================================
router.get('/status-monitoring', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all investment types
    const [investments, mutualFunds, insurances, shares, loans] = await Promise.all([
      Investment.find({ userId, category: { $in: ['nps-ppf', 'gold-sgb', 'bank-schemes', 'valuation'] } }).lean(),
      MutualFund.find({ userId }).lean(),
      Insurance.find({ userId }).lean(),
      Share.find({ userId }).lean(),
      Loan.find({ userId }).lean(),
    ]);

    // Asset summary
    const npsTotal = investments.filter(i => i.category === 'nps-ppf').reduce((s, i) => s + (i.amount || 0), 0);
    const goldTotal = investments.filter(i => i.category === 'gold-sgb').reduce((s, i) => {
      return s + ((i.quantity || 0) * (i.currentValue || i.purchasePrice || 0));
    }, 0);
    const bankSchemesTotal = investments.filter(i => i.category === 'bank-schemes').reduce((s, i) => s + (i.amount || 0), 0);
    const mfTotal = mutualFunds.reduce((s, mf) => s + (mf.marketValue || (mf.units * mf.currentNAV) || 0), 0);
    const shareTotal = shares.reduce((s, sh) => s + (sh.currentValuation || (sh.quantity * sh.currentPrice) || sh.purchaseAmount || 0), 0);
    const insuranceTotal = insurances.reduce((s, ins) => s + (ins.sumAssured || ins.premiumAmount || 0), 0);

    const totalAssets = npsTotal + goldTotal + bankSchemesTotal + mfTotal + shareTotal;

    // Liability summary
    const totalLiabilities = loans.reduce((s, l) => s + (l.balance || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    // Active loans status
    const loanStatus = loans.map(l => ({
      name: l.debtorName,
      company: l.companyName,
      type: l.loanType,
      principal: l.principalAmount,
      balance: l.balance,
      emiAmount: l.emiAmount,
      emiDate: l.emiDate,
      status: l.status,
      interestRate: l.interestRate,
    }));

    // Overdue loans (amortizationSchedule entries where paid=false and date < now)
    const today = new Date();
    const overdueEMIs = [];
    for (const loan of loans) {
      if (loan.amortizationSchedule) {
        const overdue = loan.amortizationSchedule.filter(s => !s.paid && new Date(s.date) < today);
        if (overdue.length > 0) {
          overdueEMIs.push({
            loanName: loan.debtorName,
            overdueCount: overdue.length,
            overdueAmount: overdue.reduce((s, e) => s + (e.payment || 0), 0),
          });
        }
      }
    }

    res.json({
      success: true,
      summary: {
        totalAssets: Math.round(totalAssets),
        totalLiabilities: Math.round(totalLiabilities),
        netWorth: Math.round(netWorth),
      },
      assetBreakdown: [
        { name: 'NPS / PPF / Post Office', value: Math.round(npsTotal), color: '#6366f1' },
        { name: 'Gold / SGB / Silver / Bonds', value: Math.round(goldTotal), color: '#f59e0b' },
        { name: 'Bank Schemes (RD/FD)', value: Math.round(bankSchemesTotal), color: '#10b981' },
        { name: 'Mutual Funds', value: Math.round(mfTotal), color: '#3b82f6' },
        { name: 'Shares', value: Math.round(shareTotal), color: '#8b5cf6' },
        { name: 'Insurance (Sum Assured)', value: Math.round(insuranceTotal), color: '#ec4899' },
      ].filter(a => a.value > 0),
      liabilities: {
        total: Math.round(totalLiabilities),
        loans: loanStatus,
        overdueEMIs,
      },
    });
  } catch (error) {
    console.error('Reports - Status/Monitoring error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// REPORT 3: WANT IN ACTION
// GET /api/reports/want-in-action
// ============================================================
router.get('/want-in-action', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Udhar records
    const udharRecords = await Investment.find({
      userId,
      category: { $in: ['loan-ledger', 'daily-loan-ledger', 'on-behalf'] }
    }).lean();

    // Telephone conversations (follow-ups)
    const telephoneRecords = await Investment.find({
      userId,
      category: 'daily-telephone-conversation'
    }).lean();

    // Active loans
    const activeLoans = await Loan.find({ userId, status: { $in: ['active', 'overdue'] } }).lean();

    // Upcoming reminders (next 30 days)
    let upcomingReminders = [];
    try {
      const Reminder = mongoose.model('Reminder');
      const in30days = new Date();
      in30days.setDate(in30days.getDate() + 30);
      upcomingReminders = await Reminder.find({
        userId,
        dueDate: { $gte: new Date(), $lte: in30days },
      }).sort({ dueDate: 1 }).lean();
    } catch (e) { /* Reminder model might not be loaded */ }

    // Next EMIs due
    const today = new Date();
    const nextEMIs = activeLoans.map(loan => {
      const day = parseInt((loan.emiDate || '1').replace(/\D/g, ''));
      let nextDate = new Date(today.getFullYear(), today.getMonth(), day);
      if (nextDate <= today) nextDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
      return {
        loanName: loan.debtorName,
        company: loan.companyName,
        emiAmount: loan.emiAmount,
        balance: loan.balance,
        nextDue: nextDate,
        status: loan.status,
        daysUntilDue: Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24)),
      };
    }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    res.json({
      success: true,
      udhar: {
        total: udharRecords.length,
        records: udharRecords.map(r => ({
          name: r.name,
          type: r.type,
          amount: r.amount,
          date: r.startDate,
          notes: r.notes,
          category: r.category,
        })),
      },
      telephoneFollowups: {
        total: telephoneRecords.length,
        records: telephoneRecords.map(r => ({
          name: r.name,
          date: r.startDate,
          notes: r.notes,
        })),
      },
      loans: {
        activeCount: activeLoans.length,
        totalBalance: Math.round(activeLoans.reduce((s, l) => s + (l.balance || 0), 0)),
        nextEMIs,
        overdueLoans: activeLoans.filter(l => l.status === 'overdue').map(l => ({
          name: l.debtorName,
          emiAmount: l.emiAmount,
          balance: l.balance,
        })),
      },
      reminders: upcomingReminders.map(r => ({
        title: r.title,
        dueDate: r.dueDate,
        type: r.type,
      })),
    });
  } catch (error) {
    console.error('Reports - Want In Action error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// REPORT 5: DATE
// GET /api/reports/date
// ============================================================
router.get('/date', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const in30days = new Date();
    in30days.setDate(today.getDate() + 30);

    // Overdue loan EMIs
    const loans = await Loan.find({ userId }).lean();
    const overdueEMIs = [];
    const upcomingEMIs = [];

    for (const loan of loans) {
      if (loan.amortizationSchedule) {
        const overdue = loan.amortizationSchedule.filter(s => !s.paid && new Date(s.date) < today);
        const upcoming = loan.amortizationSchedule.filter(s => {
          const d = new Date(s.date);
          return !s.paid && d >= today && d <= in30days;
        });
        overdue.forEach(e => overdueEMIs.push({ ...e, loanName: loan.debtorName, loanType: loan.loanType }));
        upcoming.forEach(e => upcomingEMIs.push({ ...e, loanName: loan.debtorName, loanType: loan.loanType }));
      }
    }

    // Calendar events
    let calendarEvents = [];
    let reminders = [];
    try {
      const CalendarEvent = mongoose.model('CalendarEvent');
      calendarEvents = await CalendarEvent.find({
        userId,
        date: { $gte: today, $lte: in30days },
      }).sort({ date: 1 }).lean();
    } catch (e) {}

    try {
      const Reminder = mongoose.model('Reminder');
      reminders = await Reminder.find({
        userId,
        dueDate: { $lte: in30days },
      }).sort({ dueDate: 1 }).lean();
    } catch (e) {}

    // Bill checklist items from investments
    const billItems = await Investment.find({
      userId,
      category: { $in: ['daily-bill-checklist', 'daily-bill-checklist-new', 'bill-checklist-categories'] }
    }).lean();

    res.json({
      success: true,
      overdueEMIs: overdueEMIs.map(e => ({
        loanName: e.loanName,
        loanType: e.loanType,
        date: e.date,
        amount: e.payment,
        daysOverdue: Math.ceil((today - new Date(e.date)) / (1000 * 60 * 60 * 24)),
      })).sort((a, b) => b.daysOverdue - a.daysOverdue),
      upcomingEMIs: upcomingEMIs.map(e => ({
        loanName: e.loanName,
        loanType: e.loanType,
        date: e.date,
        amount: e.payment,
        daysUntilDue: Math.ceil((new Date(e.date) - today) / (1000 * 60 * 60 * 24)),
      })).sort((a, b) => a.daysUntilDue - b.daysUntilDue),
      calendarEvents: calendarEvents.map(e => ({
        title: e.title,
        date: e.date,
        type: e.eventType || e.type,
        description: e.description,
      })),
      reminders: reminders.map(r => ({
        title: r.title || r.name,
        dueDate: r.dueDate || r.date,
        type: r.type,
        isPast: new Date(r.dueDate || r.date) < today,
      })),
      billChecklist: billItems.map(b => ({
        name: b.name,
        amount: b.amount,
        startDate: b.startDate,
        payableDate: b.payableDate,
        notes: b.notes,
      })),
      summary: {
        overdueCount: overdueEMIs.length,
        upcomingBillsCount: upcomingEMIs.length + calendarEvents.length,
        pendingRemindersCount: reminders.filter(r => new Date(r.dueDate || r.date) < today).length,
      },
    });
  } catch (error) {
    console.error('Reports - Date error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// REPORT 6: % COMPLETION
// GET /api/reports/completion
// ============================================================
router.get('/completion', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const checkCompletion = (record, requiredFields) => {
      const filled = requiredFields.filter(f => {
        const val = record[f];
        return val !== null && val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
      });
      return { filled: filled.length, total: requiredFields.length, percentage: Math.round((filled.length / requiredFields.length) * 100) };
    };

    // Investment completeness
    const INVESTMENT_REQUIRED = ['name', 'type', 'amount', 'startDate', 'source'];
    const GOLD_REQUIRED = ['name', 'type', 'quantity', 'purchasePrice', 'purity', 'storageType', 'startDate'];
    const MF_REQUIRED = ['fundName', 'broker', 'investorName', 'folioNumber', 'units', 'purchaseNAV', 'investmentDate'];
    const INSURANCE_REQUIRED = ['policyName', 'insurer', 'policyType', 'premiumAmount', 'startDate', 'maturityDate'];
    const SHARE_REQUIRED = ['scripName', 'quantity', 'purchasePrice', 'purchaseDate', 'broker', 'clientId'];
    const LOAN_REQUIRED = ['debtorName', 'companyName', 'loanType', 'principalAmount', 'interestRate', 'tenure', 'emiAmount', 'commencementDate'];

    const [investments, mutualFunds, insurances, shares, loans] = await Promise.all([
      Investment.find({ userId }).lean(),
      MutualFund.find({ userId }).lean(),
      Insurance.find({ userId }).lean(),
      Share.find({ userId }).lean(),
      Loan.find({ userId }).lean(),
    ]);

    const scoreSection = (items, requiredFields, label) => {
      if (!items.length) return { label, count: 0, average: 0, items: [] };
      const scored = items.map((item, idx) => {
        const c = checkCompletion(item, requiredFields);
        return { index: idx + 1, name: item.name || item.companyName || item.policyName || item.debtorName || `Record ${idx + 1}`, ...c };
      });
      const avg = Math.round(scored.reduce((s, i) => s + i.percentage, 0) / scored.length);
      return { label, count: items.length, average: avg, items: scored };
    };

    const sections = [
      scoreSection(investments.filter(i => i.category === 'nps-ppf'), INVESTMENT_REQUIRED, 'NPS / PPF / Post Office'),
      scoreSection(investments.filter(i => i.category === 'gold-sgb'), GOLD_REQUIRED, 'Gold / SGB / Silver / Bonds'),
      scoreSection(investments.filter(i => i.category === 'bank-schemes'), INVESTMENT_REQUIRED, 'Bank Schemes (RD/FD)'),
      scoreSection(mutualFunds, MF_REQUIRED, 'Mutual Funds'),
      scoreSection(insurances, INSURANCE_REQUIRED, 'Insurance'),
      scoreSection(shares, SHARE_REQUIRED, 'Shares'),
      scoreSection(loans, LOAN_REQUIRED, 'Loans'),
    ].filter(s => s.count > 0);

    const filledSections = sections.filter(s => s.average > 0).length;
    const overallScore = sections.length > 0
      ? Math.round(sections.reduce((s, sec) => s + sec.average, 0) / sections.length)
      : 0;

    res.json({
      success: true,
      overall: { score: overallScore, grade: overallScore >= 80 ? 'A' : overallScore >= 60 ? 'B' : overallScore >= 40 ? 'C' : 'D' },
      sections,
    });
  } catch (error) {
    console.error('Reports - Completion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// REPORT SUMMARY (Daily/Weekly/Monthly auto-gen)
// GET /api/reports/summary?period=daily|weekly|monthly
// ============================================================
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly' } = req.query;
    const now = new Date();

    let dateFrom, dateTo, label;
    if (period === 'daily') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateTo = now;
      label = `Today, ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else if (period === 'weekly') {
      const dayOfWeek = now.getDay();
      dateFrom = new Date(now);
      dateFrom.setDate(now.getDate() - dayOfWeek);
      dateTo = now;
      label = `This Week (${dateFrom.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })})`;
    } else {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      label = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }

    const txns = await getAllExpenseTransactions(userId, {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    });

    const incomeRecs = await IncomeExpense.find({
      userId, type: 'income', isActive: true,
      date: { $gte: dateFrom, $lte: dateTo },
    });
    const bankCredits = await BankTransaction.find({
      user: userId, type: { $in: ['credit', 'deposit'] },
      date: { $gte: dateFrom, $lte: dateTo },
    });
    const totalIncome = incomeRecs.reduce((s, r) => s + r.amount, 0) + bankCredits.reduce((s, r) => s + r.amount, 0);
    const totalExpense = txns.reduce((s, t) => s + t.amount, 0);

    const sinExpense = txns.filter(t => t.expenseType === 'avoidable-loss' || t.expenseType === 'unnecessary').reduce((s, t) => s + t.amount, 0);

    res.json({
      success: true,
      period,
      label,
      dateFrom,
      dateTo,
      totalIncome: Math.round(totalIncome),
      totalExpense: Math.round(totalExpense),
      netSavings: Math.round(totalIncome - totalExpense),
      sinExpense: Math.round(sinExpense),
      transactionCount: txns.length,
      topCategories: Object.entries(
        txns.reduce((acc, t) => {
          const k = t.broaderCategory;
          if (!acc[k]) acc[k] = 0;
          acc[k] += t.amount;
          return acc;
        }, {})
      )
        .map(([cat, total]) => ({ category: cat, total: Math.round(total) }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
    });
  } catch (error) {
    console.error('Reports - Summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
