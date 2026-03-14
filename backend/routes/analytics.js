const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Models
const BankTransaction = require('../models/BankTransaction');
const CashTransaction = require('../models/CashTransaction');
const Transaction = require('../models/Transaction');
const IncomeExpense = require('../models/IncomeExpense');
const Investment = require('../models/Investment');
const MutualFund = require('../models/MutualFund');
const Insurance = require('../models/Insurance');
const Share = require('../models/Share');
const Loan = require('../models/Loan');
const Target = require('../models/Target');
const BudgetPlan = require('../models/BudgetPlan');
const User = require('../models/User');

// ─── HELPER: get all expenses (last N months) ──────────────────────────────
async function getMonthlyExpenses(userIdStr, months = 6) {
  const userId = new mongoose.Types.ObjectId(userIdStr);
  const now = new Date();
  const results = [];

  for (let i = 0; i < months; i++) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [bankTxns, cashTxns] = await Promise.all([
      BankTransaction.find({ user: userId, type: { $in: ['debit','expense','withdrawal','payment','fee'] }, date: { $gte: start, $lte: end } }).lean(),
      CashTransaction.find({ userId: userId, type: 'expense', date: { $gte: start, $lte: end } }).lean(),
    ]);

    const total = [...bankTxns, ...cashTxns].reduce((s, t) => s + (t.amount || 0), 0);
    results.push({ month: start.toISOString().slice(0, 7), total: Math.round(total), start, end });
  }

  return results; // index 0 = most recent month
}

// ─── HELPER: get all income (last N months) ────────────────────────────────
async function getMonthlyIncome(userIdStr, months = 6) {
  const userId = new mongoose.Types.ObjectId(userIdStr);
  const now = new Date();
  const results = [];

  for (let i = 0; i < months; i++) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [incomeRecs, bankCredits] = await Promise.all([
      IncomeExpense.find({ userId: userId, type: 'income', isActive: true, date: { $gte: start, $lte: end } }).lean(),
      BankTransaction.find({ user: userId, type: { $in: ['credit', 'deposit'] }, date: { $gte: start, $lte: end } }).lean(),
    ]);

    const total = [...incomeRecs, ...bankCredits].reduce((s, t) => s + (t.amount || 0), 0);
    results.push({ month: start.toISOString().slice(0, 7), total: Math.round(total), start, end });
  }

  return results;
}

// ─── HELPER: get total investments ─────────────────────────────────────────
async function getTotalInvestments(userId) {
  const [investments, mfs, shares] = await Promise.all([
    Investment.find({ userId, category: { $in: ['nps-ppf', 'gold-sgb', 'bank-schemes', 'valuation'] } }).lean(),
    MutualFund.find({ userId }).lean(),
    Share.find({ userId }).lean(),
  ]);

  const nps = investments.filter(i => i.category === 'nps-ppf').reduce((s, i) => s + (i.amount || 0), 0);
  const gold = investments.filter(i => i.category === 'gold-sgb').reduce((s, i) => s + ((i.quantity || 0) * (i.currentValue || i.purchasePrice || 0)), 0);
  const bank = investments.filter(i => i.category === 'bank-schemes').reduce((s, i) => s + (i.amount || 0), 0);
  const mfVal = mfs.reduce((s, m) => s + (m.marketValue || 0), 0);
  const shareVal = shares.reduce((s, s2) => s + (s2.currentValuation || s2.purchaseAmount || 0), 0);

  return { total: Math.round(nps + gold + bank + mfVal + shareVal), nps, gold, bank, mfVal, shareVal };
}

// ─── HELPER: get analytics bases (shared logic) ───────────────────────────
async function getAnalyticsBases(userIdStr) {
  const userId = new mongoose.Types.ObjectId(userIdStr);
  
  // Load assumptions from Investment profile
  const profileRec = await Investment.findOne({ userId, category: 'profile', name: '_analytics_assumptions' }).lean();
  const savedAssumptions = profileRec?.notes ? JSON.parse(profileRec.notes) : {};
  
  const finalAssumptions = {
    retirementAge: 60,
    termPlanMultiplier: 50,
    emergencyFundMonths: 6,
    healthInsuranceCover: 500000,
    budgetPlan: 'most_popular',
    expenseBase: 'higher_6m',
    incomeBase: 'lower_6m',
    ...savedAssumptions
  };

  const expHistory = await getMonthlyExpenses(userIdStr, 6);
  const incHistory = await getMonthlyIncome(userIdStr, 6);

  // Compute stats
  const peakExpense = Math.max(...expHistory.map(m => m.total), 0);
  const recentMonthExpense = expHistory[0]?.total || 0;
  
  const validIncomeMonths = incHistory.filter(m => m.total > 0).map(m => m.total);
  const minIncome = validIncomeMonths.length > 0 ? Math.min(...validIncomeMonths) : 0;
  
  const totalIncomeVal = incHistory.reduce((s, m) => s + m.total, 0);
  const meanIncome = totalIncomeVal / Math.max(validIncomeMonths.length, 1);
  const meanExpense = expHistory.reduce((s, m) => s + m.total, 0) / 6;

  // Decide bases
  const finalPresentIncome = finalAssumptions.incomeBase === 'lower_6m' ? (minIncome || meanIncome) : meanIncome;
  const finalPresentExpense = finalAssumptions.expenseBase === 'higher_6m' ? (peakExpense || meanExpense) : (recentMonthExpense || meanExpense);

  const debugInfo = {
    user: userIdStr,
    incBase: finalAssumptions.incomeBase,
    expBase: finalAssumptions.expenseBase,
    minIncome, meanIncome, finalPresentIncome,
    peakExpense, meanExpense, finalPresentExpense
  };
  console.log('[DEBUG-ANALYTICS]', JSON.stringify(debugInfo));

  return { 
    assumptions: finalAssumptions, 
    expenses6m: expHistory, 
    income6m: incHistory, 
    presentIncome: Math.round(finalPresentIncome), 
    presentExpense: Math.round(finalPresentExpense),
    avgMonthlyExpense: Math.round(meanExpense),
    avgMonthlyIncome: Math.round(meanIncome)
  };
}

// ============================================================
// 1. DEFAULT ASSUMPTIONS & MANUAL INPUTS
// GET  /api/analytics/assumptions        → fetch saved
// POST /api/analytics/assumptions        → save user's overrides
// ============================================================

// Build/load assumptions from DB or return defaults
const DEFAULT_ASSUMPTIONS = {
  retirementAge: 60,
  termPlanMultiplier: 50,           // 50× present income
  emergencyFundMonths: 6,
  healthInsuranceCover: 500000,     // ₹5L
  budgetPlan: 'most_popular',       // default plan
  expenseBase: 'higher_6m',        // higher of last 6-month expenses
  incomeBase: 'lower_6m',          // lower of last 6-month income
};

// We store assumptions in the Investment model (category: 'profile') or a simple JS in-memory per-user map
// Use a small dedicated in-memory store (persisted via Investment category:'profile' notes field)
router.get('/assumptions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const shared = await getAnalyticsBases(userId);

    res.json({
      success: true,
      assumptions: shared.assumptions,
      computed: {
        presentMonthlyIncome: shared.presentIncome,
        presentMonthlyExpense: shared.presentExpense,
        termPlanRequired: Math.round(shared.presentIncome * 12 * shared.assumptions.termPlanMultiplier),
        emergencyFundRequired: Math.round(shared.presentExpense * shared.assumptions.emergencyFundMonths),
        income6m: [...shared.income6m].reverse().map(m => ({ month: m.month, total: m.total })),
        expenses6m: [...shared.expenses6m].reverse().map(m => ({ month: m.month, total: m.total })),
      }
    });
  } catch (err) {
    console.error('Analytics - Assumptions GET:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assumptions', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Merge with defaults  
    const merged = { ...DEFAULT_ASSUMPTIONS, ...updates };

    // Save to profile Investment record
    let profileRec = await Investment.findOne({ userId, category: 'profile', name: '_analytics_assumptions' });
    if (profileRec) {
      profileRec.notes = JSON.stringify(merged);
      profileRec.updatedAt = new Date();
      await profileRec.save();
    } else {
      await Investment.create({
        userId,
        category: 'profile',
        name: '_analytics_assumptions',
        type: 'Analytics Config',
        startDate: new Date(),
        notes: JSON.stringify(merged),
      });
    }

    res.json({ success: true, assumptions: merged });
  } catch (err) {
    console.error('Analytics - Assumptions POST:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// 2. RECOMMENDATIONS
// GET /api/analytics/recommendations
// ============================================================
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Use shared bases
    const shared = await getAnalyticsBases(userId);
    const { assumptions, presentIncome, presentExpense, avgMonthlyIncome, avgMonthlyExpense } = shared;

    // Parallel data fetch remaining (strictly cast userId)
    const mid = new mongoose.Types.ObjectId(userId);
    const [investmentData, loans, targets, insurances] = await Promise.all([
      getTotalInvestments(userId),
      Loan.find({ userId: mid, status: { $in: ['active', 'overdue'] } }).lean(),
      Target.find({ userId: mid }).lean(),
      Insurance.find({ userId: mid, status: 'active' }).lean(),
    ]);

    const emergencyFundRequired = presentExpense * assumptions.emergencyFundMonths;
    const termPlanRequired = presentIncome * 12 * assumptions.termPlanMultiplier;
    const totalLoans = loans.reduce((s, l) => s + (l.balance || 0), 0);

    // Check existing term plan
    const termPlan = insurances.find(ins => ins.policyType === 'term');
    const healthPlan = insurances.find(ins => ins.insuranceType === 'health');
    const healthCover = healthPlan ? (healthPlan.sumInsured || 0) : 0;

    const recommendations = [];

    // 1. Emergency Fund
    const emFundDiff = emergencyFundRequired - (investmentData.bank || 0);
    if (emFundDiff > 0) {
      recommendations.push({
        category: 'Emergency Fund',
        priority: 'High',
        icon: '🛡️',
        title: 'Build Emergency Fund',
        detail: `You need ₹${emergencyFundRequired.toLocaleString('en-IN')} (${assumptions.emergencyFundMonths} months of expenses). Currently estimated at ₹${(investmentData.bank || 0).toLocaleString('en-IN')}.`,
        action: `Save ₹${Math.round(emFundDiff / 12).toLocaleString('en-IN')}/month for 12 months to build emergency fund.`,
        amount: Math.round(emFundDiff),
      });
    }

    // 2. Term Insurance
    if (!termPlan) {
      recommendations.push({
        category: 'Term Insurance',
        priority: 'High',
        icon: '🔒',
        title: 'Get Term Life Insurance',
        detail: `As per your assumption (${assumptions.termPlanMultiplier}× annual income), you need a ₹${termPlanRequired.toLocaleString('en-IN')} term plan.`,
        action: `Buy a pure term plan of ₹${termPlanRequired.toLocaleString('en-IN')} from any leading insurer.`,
        amount: Math.round(termPlanRequired),
      });
    } else {
      const existing = termPlan.sumAssured || 0;
      if (existing < termPlanRequired * 0.8) {
        recommendations.push({
          category: 'Term Insurance',
          priority: 'Medium',
          icon: '🔒',
          title: 'Increase Term Cover',
          detail: `Your current term cover (₹${existing.toLocaleString('en-IN')}) is below the recommended ₹${termPlanRequired.toLocaleString('en-IN')}.`,
          action: `Top up your term policy or buy an additional term plan.`,
          amount: Math.round(termPlanRequired - existing),
        });
      }
    }

    // 3. Health Insurance
    if (healthCover < assumptions.healthInsuranceCover) {
      recommendations.push({
        category: 'Health Insurance',
        priority: 'High',
        icon: '🏥',
        title: 'Family Floater Health Insurance',
        detail: `Recommended cover: ₹${(assumptions.healthInsuranceCover / 100000).toFixed(0)} Lakhs. Your current cover: ₹${(healthCover / 100000).toFixed(0)} Lakhs.`,
        action: `Get a family floater health plan with at least ₹${(assumptions.healthInsuranceCover / 100000).toFixed(0)}L cover.`,
        amount: Math.round(assumptions.healthInsuranceCover - healthCover),
      });
    }

    // 4. Loans
    if (totalLoans > presentIncome * 12) {
      recommendations.push({
        category: 'Debt Reduction',
        priority: 'High',
        icon: '📉',
        title: 'High Debt Load — Focus on Repayment',
        detail: `Total outstanding loans ₹${totalLoans.toLocaleString('en-IN')} exceeds your annual income.`,
        action: `Prioritize high-interest loan repayment. Use Debt Avalanche: pay minimums on all, extra on highest-rate loan first.`,
        amount: Math.round(totalLoans),
      });
    }

    // 5. Investment allocation recommendation
    const monthlySavings = Math.max(0, avgMonthlyIncome - avgMonthlyExpense);
    if (monthlySavings > 0) {
      const investSuggested = Math.round(monthlySavings * 0.6);
      recommendations.push({
        category: 'Investments',
        priority: 'Medium',
        icon: '📈',
        title: 'Invest Monthly Surplus',
        detail: `Your estimated monthly surplus is ₹${monthlySavings.toLocaleString('en-IN')}. At least 60% should go into investments.`,
        action: `Invest ₹${investSuggested.toLocaleString('en-IN')}/month into: 40% Equity MF (SIP), 30% PPF/NPS, 20% Gold SGB, 10% RD/FD.`,
        amount: investSuggested,
      });
    }

    // 6. Goals check
    const shortfallGoals = targets.filter(t => t.estimatedCost > 0 && new Date(t.targetDate) > new Date());
    if (shortfallGoals.length > 0) {
      const totalNeeded = shortfallGoals.reduce((s, t) => s + t.estimatedCost, 0);
      recommendations.push({
        category: 'Goals & Targets',
        priority: 'Medium',
        icon: '🎯',
        title: 'Fund Your Goals',
        detail: `You have ${shortfallGoals.length} active goals requiring ₹${totalNeeded.toLocaleString('en-IN')} total.`,
        action: `Set up goal-based SIPs. Calculate monthly SIP needed for each goal based on time horizon and expected returns.`,
        amount: Math.round(totalNeeded),
      });
    }

    // Category-wise spending recommendations
    recommendations.push({
      category: 'Expense Optimization',
      priority: 'Low',
      icon: '✂️',
      title: 'Review Spending by Category',
      detail: `Based on your ${assumptions.budgetPlan.replace(/_/g, ' ')} plan, track each broader category against budget.`,
      action: `Visit Expenses Levels page to see how your spending compares to your chosen budget plan allocation.`,
      amount: 0,
    });

    // SURPLUS DECISION: Use Average Income - Average Expense for Month Surplus
    // This matches the UI label "Income - Avg Expense" and is more helpful for advice.

    res.json({
      success: true,
      summary: {
        presentMonthlyIncome: shared.presentIncome,
        presentMonthlyExpense: shared.presentExpense,
        avgMonthlyIncome: shared.avgMonthlyIncome,
        avgMonthlyExpense: shared.avgMonthlyExpense,
        monthlySavings: Math.round(monthlySavings),
        totalInvestments: investmentData.total,
        totalLoans,
        emergencyFundRequired: Math.round(emergencyFundRequired),
        termPlanRequired: Math.round(termPlanRequired),
      },
      recommendations: recommendations.sort((a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      }),
    });
  } catch (err) {
    console.error('Analytics - Recommendations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// 3. GOALS & TARGETS PLANNED VS ACTUAL VS PROJECTIONS
// GET /api/analytics/goals-targets
// ============================================================
router.get('/goals-targets', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { assumptions, expenses6m, income6m, avgMonthlyIncome, avgMonthlyExpense } = await getAnalyticsBases(userId);

    const mid = new mongoose.Types.ObjectId(userId);
    const [targets, investmentData, loans, udhar] = await Promise.all([
      Target.find({ userId: mid }).lean(),
      getTotalInvestments(userId),
      Loan.find({ userId: mid }).lean(),
      Investment.find({ userId: mid, category: { $in: ['loan-ledger', 'daily-loan-ledger'] } }).lean(),
    ]);

    const avgIncome = avgMonthlyIncome;
    const avgExpense = avgMonthlyExpense;
    const avgSavings = Math.max(0, avgIncome - avgExpense);

    // Project monthly savings for next 12 months (flat projection)
    const monthlyProjections = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      monthlyProjections.push({
        month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
        projectedIncome: Math.round(avgIncome * (1 + 0.005 * i)), // 0.5% growth pm
        projectedExpense: Math.round(avgExpense * (1 + 0.003 * i)),
        projectedSavings: Math.round(avgSavings * (1 + 0.008 * i)),
      });
    }

    // Emergency Fund tracking
    const emergencyFundTarget = avgExpense * 6;
    const emergencyFundActual = investmentData.bank || 0; // bank schemes as proxy

    // Retirement corpus (assumed 25x annual expenses at retirement)
    const retirementTarget = avgExpense * 12 * 25;
    const retirementActual = investmentData.nps || 0;

    // Loan recovery
    const totalLoanPrincipal = loans.reduce((s, l) => s + (l.principalAmount || 0), 0);
    const totalLoanBalance = loans.reduce((s, l) => s + (l.balance || 0), 0);
    const loanRepaid = totalLoanPrincipal - totalLoanBalance;

    // Udhar summary
    const udharTotal = udhar.reduce((s, u) => s + (u.amount || 0), 0);

    // Build goals vs actuals
    const goalsActual = targets.map(t => {
      const monthsLeft = Math.max(0, Math.ceil((new Date(t.targetDate) - now) / (1000 * 60 * 60 * 24 * 30)));
      const monthlyRequired = monthsLeft > 0 ? Math.round(t.estimatedCost / monthsLeft) : 0;
      return {
        goal: t.specificGoal,
        goalType: t.goalType,
        riskTolerance: t.riskTolerance,
        planned: Math.round(t.estimatedCost),
        actual: 0, // Actual goal investment amount (placeholder — can be linked later)
        projected: Math.round(avgSavings * monthsLeft * 0.4), // 40% of savings toward goals
        targetDate: t.targetDate,
        monthsLeft,
        monthlyRequired,
        vehicles: t.recommendedInvestmentVehicle,
      };
    });

    res.json({
      success: true,
      summary: {
        avgMonthlyIncome: Math.round(avgIncome),
        avgMonthlyExpense: Math.round(avgExpense),
        avgMonthlySavings: Math.round(avgSavings),
      },
      income: {
        planned: Math.round(avgIncome),
        actual6m: income6m.reverse().map(m => ({ month: m.month, total: m.total })),
        projectedNextMonth: Math.round(avgIncome * 1.005),
      },
      expenses: {
        planned: Math.round(avgExpense),
        actual6m: expenses6m.reverse().map(m => ({ month: m.month, total: m.total })),
        projectedNextMonth: Math.round(avgExpense * 1.003),
      },
      emergencyFund: {
        required: Math.round(emergencyFundTarget),
        actual: Math.round(emergencyFundActual),
        percentage: emergencyFundTarget > 0 ? Math.round((emergencyFundActual / emergencyFundTarget) * 100) : 0,
        monthsLeft: Math.ceil(Math.max(0, emergencyFundTarget - emergencyFundActual) / Math.max(avgSavings * 0.2, 1)),
      },
      retirementCorpus: {
        required: Math.round(retirementTarget),
        actual: Math.round(retirementActual),
        percentage: retirementTarget > 0 ? Math.round((retirementActual / retirementTarget) * 100) : 0,
      },
      loanRecovery: {
        totalPrincipal: Math.round(totalLoanPrincipal),
        repaid: Math.round(loanRepaid),
        remaining: Math.round(totalLoanBalance),
        percentage: totalLoanPrincipal > 0 ? Math.round((loanRepaid / totalLoanPrincipal) * 100) : 0,
      },
      udhar: {
        total: Math.round(udharTotal),
        count: udhar.length,
      },
      goals: goalsActual,
      projections: monthlyProjections,
    });
  } catch (err) {
    console.error('Analytics - Goals & Targets:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// 4. EXPENSES LEVELS
// GET /api/analytics/expenses-levels
// ============================================================
const PLAN_DEFINITIONS = {
  bare_minimum: { name: 'Bare Minimum', needs: 80, wants: 0, savings: 0, investment: 0, survivalBuffer: 20 },
  most_popular: { name: 'Most Popular (50-30-20)', needs: 50, wants: 30, savings: 20, investment: 0, survivalBuffer: 0 },
  standard: { name: 'Standard (40-30-30)', needs: 40, wants: 30, savings: 30, investment: 0, survivalBuffer: 0 },
  stable: { name: 'Stable (60-30-10)', needs: 60, wants: 30, savings: 10, investment: 0, survivalBuffer: 0 },
  good: { name: 'Good (60-20-10-10)', needs: 60, wants: 20, savings: 10, investment: 10, survivalBuffer: 0 },
};

// Broader category → bucket mapping (for ALL plans, needs are always Fixed + Variable)
const CATEGORY_BUCKETS = {
  'Fixed & Contractual Costs': 'needs',
  'Variable Living Expenses': 'needs',
  'Financial Protection & Security': 'wants',
  'Long-Term Savings & Investments': 'wants',
  'Discretionary & Lifestyle': 'savings',
  'Periodic & Large Expenses': 'savings',
};

router.get('/expenses-levels', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const shared = await getAnalyticsBases(userId);

    // Get user's budget plan from database record (if they used Family > Static > Budget Page)
    const dbBudgetPlan = await BudgetPlan.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean();
    
    // DECISION: Match Assumptions page absolutely by using shared.presentIncome/Expense
    const planKey = dbBudgetPlan?.selectedPlan || shared.assumptions.budgetPlan || 'most_popular';
    const planAlloc = PLAN_DEFINITIONS[planKey];
    
    // Benchmark values must match Assumptions page exactly
    const matchedIncome = shared.presentIncome;
    const matchedExpense = shared.presentExpense;

    // Get last 6 months expenses by broader category
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [bankTxns, cashTxns] = await Promise.all([
      BankTransaction.find({
        user: new mongoose.Types.ObjectId(userId),
        type: { $in: ['debit', 'expense', 'withdrawal', 'payment', 'fee'] },
        date: { $gte: sixMonthsAgo }
      }).lean(),
      CashTransaction.find({
        userId: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: sixMonthsAgo }
      }).lean(),
    ]);

    const allTxns = [...bankTxns.map(t => ({ ...t, source: 'bank' })), ...cashTxns.map(t => ({ ...t, source: 'cash' }))];

    // Aggregate by broaderCategory
    const byCategory = {};
    for (const txn of allTxns) {
      const cat = txn.broaderCategory || 'Uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
      byCategory[cat].total += txn.amount || 0;
      byCategory[cat].count++;
    }

    const totalExpenseVal6m = Object.values(byCategory).reduce((s, c) => s + c.total, 0);
    // Use the same presentExpense as shown in Assumptions "Calculated Planning Bases"
    const displayExpense = matchedExpense;

    // Compute monthly averages per category and assign to bucket
    const bucketActuals = { needs: 0, wants: 0, savings: 0, investment: 0, survivalBuffer: 0 };

    const categoryBreakdown = Object.entries(byCategory).map(([cat, data]) => {
      const monthlyAvg = Math.round(data.total / 6);
      const bucket = CATEGORY_BUCKETS[cat] || 'savings';
      bucketActuals[bucket] = (bucketActuals[bucket] || 0) + monthlyAvg;
      return {
        category: cat,
        monthlyAvg,
        total6m: Math.round(data.total),
        count: data.count,
        bucket,
        pctOfExpense: matchedExpense > 0 ? Math.round((monthlyAvg / matchedExpense) * 100) : 0,
        pctOfIncome: matchedIncome > 0 ? Math.round((monthlyAvg / matchedIncome) * 100) : 0,
      };
    }).sort((a, b) => b.monthlyAvg - a.monthlyAvg);

    // Compare actuals to plan targets
    const bucketComparison = Object.entries(planAlloc).filter(([k]) => !['name'].includes(k)).map(([bucket, targetPct]) => {
      if (bucket === 'name') return null;
      const targetAmount = matchedIncome > 0 ? Math.round(matchedIncome * targetPct / 100) : 0;
      const actualAmount = bucketActuals[bucket] || 0;
      const diff = actualAmount - targetAmount;
      return {
        bucket,
        targetPct,
        targetAmount,
        actualAmount,
        diff: Math.round(diff),
        status: diff > 0 ? 'over' : diff < 0 ? 'under' : 'on-track',
        pctOfActualIncome: matchedIncome > 0 ? Math.round((actualAmount / matchedIncome) * 100) : 0,
      };
    }).filter(Boolean);

    // Monthly trend last 6 months
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthTxns = allTxns.filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });
      const needsAmt = monthTxns.filter(t => ['Fixed & Contractual Costs', 'Variable Living Expenses'].includes(t.broaderCategory)).reduce((s, t) => s + t.amount, 0);
      const wantsAmt = monthTxns.filter(t => ['Financial Protection & Security', 'Long-Term Savings & Investments'].includes(t.broaderCategory)).reduce((s, t) => s + t.amount, 0);
      const savingsAmt = monthTxns.filter(t => ['Discretionary & Lifestyle', 'Periodic & Large Expenses'].includes(t.broaderCategory)).reduce((s, t) => s + t.amount, 0);
      const otherAmt = monthTxns.filter(t => !CATEGORY_BUCKETS[t.broaderCategory]).reduce((s, t) => s + t.amount, 0);

      monthlyTrend.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        needs: Math.round(needsAmt),
        wants: Math.round(wantsAmt),
        savings: Math.round(savingsAmt),
        other: Math.round(otherAmt),
        total: Math.round(needsAmt + wantsAmt + savingsAmt + otherAmt),
      });
    }

    res.json({
      success: true,
      budgetPlan: {
        planKey,
        planName: planAlloc.name,
        monthlyIncome: matchedIncome,
        allocations: planAlloc,
      },
      summary: {
        avgMonthlyExpense: displayExpense,
        totalExpense6m: Math.round(totalExpenseVal6m),
        incomeExpenseRatio: matchedIncome > 0 ? Math.round((displayExpense / matchedIncome) * 100) : null,
      },
      categoryBreakdown,
      bucketComparison,
      monthlyTrend,
      allPlans: Object.entries(PLAN_DEFINITIONS).map(([key, p]) => ({
        key,
        ...p,
        targetAmounts: matchedIncome > 0 ? {
          needs: Math.round(matchedIncome * p.needs / 100),
          wants: Math.round(matchedIncome * (p.wants || 0) / 100),
          savings: Math.round(matchedIncome * (p.savings || 0) / 100),
          investment: Math.round(matchedIncome * (p.investment || 0) / 100),
          survivalBuffer: Math.round(matchedIncome * (p.survivalBuffer || 0) / 100),
        } : null,
      })),
    });
  } catch (err) {
    console.error('Analytics - Expenses Levels:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
