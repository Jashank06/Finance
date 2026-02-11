const express = require('express');
const Investment = require('../models/Investment');
const authMiddleware = require('../middleware/auth');
const { BasicDetails } = require('../controllers/staticController');
const CalendarEvent = require('../models/monitoring/CalendarEvent');
const Reminder = require('../models/monitoring/Reminder');
const Notification = require('../models/monitoring/Notification');
const { syncBillStatusToExpenses, BILL_CATEGORY_KEY } = require('../utils/billExpenseSync');
const { syncBillPaymentToScheduledExpense } = require('../utils/manageFinanceBillSync');
const { syncInsuranceToReminders, syncLoanToReminders, syncInvestmentToReminders } = require('../utils/reminderSyncUtil');
const { syncInvestmentToAll, deleteLinkedEntries } = require('../utils/crossModuleSync');

const router = express.Router();

// Get all investments for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { userId: req.userId };

    if (category) {
      query.category = category;
    }

    const investments = await Investment.find(query).sort({ createdAt: -1 });
    res.json({ investments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments', error: error.message });
  }
});

// Get single investment
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json({ investment });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment', error: error.message });
  }
});

// Create new investment
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('Creating investment with data:', req.body);
    console.log('User ID:', req.userId);

    // Normalize incoming fields across categories
    const investmentData = {
      ...req.body,
      userId: req.userId,
    };

    // Map purchaseDate to startDate for consistency
    if (investmentData.purchaseDate) {
      investmentData.startDate = investmentData.purchaseDate;
      delete investmentData.purchaseDate;
    }

    // Map bankName to provider for bank-schemes
    if (investmentData.bankName && !investmentData.provider) {
      investmentData.provider = investmentData.bankName;
    }

    // Calculate amount if quantity and purchasePrice are provided
    if (investmentData.quantity && investmentData.purchasePrice) {
      investmentData.amount = investmentData.quantity * investmentData.purchasePrice;
    }

    // Calculate returns for quantity-based and amount-based investments
    if (investmentData.currentValue) {
      if (investmentData.quantity && investmentData.amount) {
        const currentTotal = investmentData.quantity * investmentData.currentValue;
        investmentData.returns = currentTotal - investmentData.amount;
        investmentData.returnsPercentage = investmentData.amount > 0 ? (investmentData.returns / investmentData.amount * 100) : 0;
      } else if (typeof investmentData.amount === 'number') {
        investmentData.returns = investmentData.currentValue - investmentData.amount;
        investmentData.returnsPercentage = investmentData.amount > 0 ? (investmentData.returns / investmentData.amount * 100) : 0;
      }
    }

    const investment = new Investment(investmentData);
    await investment.save();

    // Sync to Calendar and Reminders
    try {
      await syncInvestmentToAll(investment);
    } catch (syncError) {
      console.error('Error syncing investment to all modules:', syncError);
    }

    res.status(201).json({
      message: 'Investment created successfully',
      investment,
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ message: 'Error creating investment', error: error.message });
  }
});

// Update investment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Normalize incoming fields across categories
    const updateData = { ...req.body };

    // Map purchaseDate to startDate for consistency
    if (updateData.purchaseDate) {
      updateData.startDate = updateData.purchaseDate;
      delete updateData.purchaseDate;
    }

    // Map bankName to provider for bank-schemes
    if (updateData.bankName && !updateData.provider) {
      updateData.provider = updateData.bankName;
    }

    // Calculate amount if quantity and purchasePrice are provided
    if (updateData.quantity && updateData.purchasePrice) {
      updateData.amount = updateData.quantity * updateData.purchasePrice;
    }

    // Calculate returns for quantity-based and amount-based investments
    if (updateData.currentValue) {
      if (updateData.quantity && updateData.amount) {
        const currentTotal = updateData.quantity * updateData.currentValue;
        updateData.returns = currentTotal - updateData.amount;
        updateData.returnsPercentage = updateData.amount > 0 ? (updateData.returns / updateData.amount * 100) : 0;
      } else if (typeof updateData.amount === 'number') {
        updateData.returns = updateData.currentValue - updateData.amount;
        updateData.returnsPercentage = updateData.amount > 0 ? (updateData.returns / updateData.amount * 100) : 0;
      }
    }

    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    );

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // If this is a bill update, sync status back to expenses and scheduled expenses
    if (investment.category === BILL_CATEGORY_KEY) {
      try {
        await syncBillStatusToExpenses(investment);
        await syncBillPaymentToScheduledExpense(investment);
      } catch (syncError) {
        console.error('Bill status sync error (non-blocking):', syncError);
      }
    }

    // Sync to Calendar and Reminders
    try {
      await syncInvestmentToAll(investment);
    } catch (syncError) {
      console.error('Error syncing investment to all modules:', syncError);
    }

    res.json({
      message: 'Investment updated successfully',
      investment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating investment', error: error.message });
  }
});

// Delete investment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Delete linked entries in Calendar and Reminders
    try {
      await deleteLinkedEntries(investment._id);
    } catch (syncError) {
      console.error('Error deleting linked entries:', syncError);
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting investment', error: error.message });
  }
});

// Get investment statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId });

    const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
    const totalReturns = totalCurrentValue - totalInvestment;

    const categoryWise = investments.reduce((acc, inv) => {
      if (!acc[inv.category]) {
        acc[inv.category] = { count: 0, amount: 0 };
      }
      acc[inv.category].count += 1;
      acc[inv.category].amount += inv.amount;
      return acc;
    }, {});

    res.json({
      totalInvestment,
      totalCurrentValue,
      totalReturns,
      returnsPercentage: totalInvestment > 0 ? ((totalReturns / totalInvestment) * 100).toFixed(2) : 0,
      totalCount: investments.length,
      categoryWise,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Gold/SGB specific routes

// Get gold market prices (mock data for now)
router.get('/gold-sgb/prices', authMiddleware, async (req, res) => {
  try {
    // Mock gold prices - in real app, this would fetch from actual API
    const prices = {
      'Digital Gold': { price: 5800, change: +50, changePercent: 0.87 },
      'Physical Gold 24K': { price: 5850, change: +75, changePercent: 1.30 },
      'SGB': { price: 5900, change: +100, changePercent: 1.72 },
      'Silver': { price: 72000, change: +500, changePercent: 0.70 },
    };

    res.json({ prices, lastUpdated: new Date() });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gold prices', error: error.message });
  }
});

// Get gold/sgb investment analytics
router.get('/gold-sgb/analytics', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({
      userId: req.userId,
      category: 'gold-sgb'
    });

    // Calculate analytics
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + (inv.currentValue * inv.quantity || inv.amount), 0);
    const totalReturns = totalCurrent - totalInvested;

    // Type-wise distribution
    const typeDistribution = investments.reduce((acc, inv) => {
      if (!acc[inv.type]) {
        acc[inv.type] = { count: 0, invested: 0, current: 0, quantity: 0 };
      }
      acc[inv.type].count += 1;
      acc[inv.type].invested += inv.amount;
      acc[inv.type].current += inv.currentValue * inv.quantity || inv.amount;
      acc[inv.type].quantity += inv.quantity || 0;
      return acc;
    }, {});

    // Provider-wise distribution
    const providerDistribution = investments.reduce((acc, inv) => {
      if (!acc[inv.provider]) {
        acc[inv.provider] = { count: 0, invested: 0, current: 0, quantity: 0 };
      }
      acc[inv.provider].count += 1;
      acc[inv.provider].invested += inv.amount;
      acc[inv.provider].current += inv.currentValue * inv.quantity || inv.amount;
      acc[inv.provider].quantity += inv.quantity || 0;
      return acc;
    }, {});

    // Storage type distribution
    const storageDistribution = investments.reduce((acc, inv) => {
      if (!acc[inv.storageType]) {
        acc[inv.storageType] = { count: 0, invested: 0, quantity: 0 };
      }
      acc[inv.storageType].count += 1;
      acc[inv.storageType].invested += inv.amount;
      acc[inv.storageType].quantity += inv.quantity || 0;
      return acc;
    }, {});

    // Performance data
    const performanceData = investments.map(inv => ({
      name: inv.name,
      type: inv.type,
      provider: inv.provider,
      invested: inv.amount,
      current: inv.currentValue * inv.quantity || inv.amount,
      returns: (inv.currentValue * inv.quantity || inv.amount) - inv.amount,
      returnsPercent: inv.returnsPercentage || 0,
      purchaseDate: inv.startDate,
      quantity: inv.quantity,
      purity: inv.purity,
    }));

    res.json({
      summary: {
        totalInvested,
        totalCurrent,
        totalReturns,
        returnsPercentage: totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0,
        totalQuantity: investments.reduce((sum, inv) => sum + (inv.quantity || 0), 0),
        totalCount: investments.length,
      },
      typeDistribution,
      providerDistribution,
      storageDistribution,
      performanceData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// Update current market prices for all gold/sgb investments
router.put('/gold-sgb/update-prices', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({
      userId: req.userId,
      category: 'gold-sgb'
    });

    // Mock price updates - in real app, fetch from market API
    const priceUpdates = {
      'Digital Gold': 5800,
      'Physical Gold': 5850,
      'SGB': 5900,
      'Silver': 72000,
    };

    const updatedInvestments = [];

    for (const investment of investments) {
      const newPrice = priceUpdates[investment.type];
      if (newPrice) {
        investment.currentValue = newPrice;
        await investment.save();
        updatedInvestments.push(investment);
      }
    }

    res.json({
      message: 'Prices updated successfully',
      updatedCount: updatedInvestments.length,
      investments: updatedInvestments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating prices', error: error.message });
  }
});

// Get SGB maturity alerts
router.get('/gold-sgb/maturity-alerts', authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({
      userId: req.userId,
      category: 'gold-sgb',
      type: 'SGB',
      maturityDate: { $exists: true }
    });

    const currentDate = new Date();
    const alerts = [];

    for (const investment of investments) {
      const maturityDate = new Date(investment.maturityDate);
      const daysToMaturity = Math.ceil((maturityDate - currentDate) / (1000 * 60 * 60 * 24));

      if (daysToMaturity <= 365 && daysToMaturity > 0) { // Within 1 year
        alerts.push({
          investmentId: investment._id,
          name: investment.name,
          maturityDate: investment.maturityDate,
          daysToMaturity,
          alertType: daysToMaturity <= 30 ? 'critical' : daysToMaturity <= 90 ? 'warning' : 'info'
        });
      }
    }

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maturity alerts', error: error.message });
  }
});

// Bill Dates analytics (Monthly Provisions, Yearly Schedule, Upcoming)
router.get('/bill-dates/analytics', authMiddleware, async (req, res) => {
  try {
    const yearParam = parseInt(req.query.year, 10);
    const horizonDaysParam = parseInt(req.query.horizonDays, 10);
    const now = new Date();
    const currentYear = !isNaN(yearParam) ? yearParam : now.getFullYear();
    const horizonDays = !isNaN(horizonDaysParam) ? horizonDaysParam : 60;

    const investments = await Investment.find({ userId: req.userId, category: 'daily-bill-checklist' });

    const normalize = (inv) => {
      let notes = {};
      try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
      return {
        billType: notes.billType || 'Bill',
        billName: notes.billName || '',
        provider: inv.provider || notes.provider || '',
        accountNumber: inv.accountNumber || notes.accountNumber || '',
        cycle: inv.frequency || notes.cycle || 'monthly',
        amount: inv.amount || notes.amount || 0,
        dueDate: inv.maturityDate || (notes.dueDate ? new Date(notes.dueDate) : null),
        payableDate: inv.payableDate || (notes.payableDate ? new Date(notes.payableDate) : null),
        startDate: inv.startDate || (notes.startDate ? new Date(notes.startDate) : null),
        status: notes.status || 'pending',
      };
    };

    const entries = investments.map(normalize);

    const months = Array.from({ length: 12 }, (_, i) => ({ idx: i, name: new Date(currentYear, i, 1).toLocaleString('en-US', { month: 'short' }), total: 0 }));
    const addToMonth = (monthIdx, amt) => { if (monthIdx >= 0 && monthIdx < 12) months[monthIdx].total += amt; };

    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      if (!amt) continue;
      const due = e.dueDate ? new Date(e.dueDate) : null;
      const start = e.startDate ? new Date(e.startDate) : null;
      const startMonth = start && start.getFullYear() === currentYear ? start.getMonth() : 0;
      const baseMonth = due && due.getFullYear() === currentYear ? due.getMonth() : startMonth;
      if (e.cycle === 'monthly') {
        for (let m = Math.max(0, startMonth); m < 12; m++) addToMonth(m, amt);
      } else if (e.cycle === 'quarterly') {
        const first = Math.max(0, baseMonth);
        for (let m = first; m < 12; m += 3) addToMonth(m, amt);
      } else if (e.cycle === 'yearly' || e.cycle === 'one-time') {
        addToMonth(Math.max(0, baseMonth), amt);
      } else {
        addToMonth(Math.max(0, baseMonth), amt);
      }
    }

    const monthlyProvisions = months.map(m => ({ name: m.name, total: m.total }));
    const annualTotal = monthlyProvisions.reduce((s, m) => s + m.total, 0);

    const cycleMixMap = new Map();
    for (const e of entries) {
      const key = e.cycle || 'monthly';
      const prev = cycleMixMap.get(key) || { name: key, value: 0 };
      prev.value += 1;
      cycleMixMap.set(key, prev);
    }
    const cycleMix = Array.from(cycleMixMap.values());

    const byMonth = Array.from({ length: 12 }, (_, i) => ({
      monthIdx: i,
      name: new Date(currentYear, i, 1).toLocaleString('en-US', { month: 'long' }),
      items: [],
      total: 0,
    }));

    // Generate recurring bill instances based on cycle
    for (const e of entries) {
      // Use payableDate if available, otherwise fall back to dueDate
      const dateToUse = e.payableDate || e.dueDate;
      if (!dateToUse) continue;

      const billDate = new Date(dateToUse);
      const billDay = billDate.getDate();
      const start = e.startDate ? new Date(e.startDate) : null;
      const startMonth = start && start.getFullYear() === currentYear ? start.getMonth() : 0;

      if (e.cycle === 'monthly') {
        // Generate bill for each month starting from startMonth
        for (let m = Math.max(0, startMonth); m < 12; m++) {
          const bucket = byMonth[m];
          bucket.items.push({
            day: billDay,
            provider: e.billName || e.provider || e.billType,
            billType: e.billType,
            cycle: e.cycle,
            amount: Number(e.amount) || 0
          });
          bucket.total += Number(e.amount) || 0;
        }
      } else if (e.cycle === 'quarterly') {
        // Generate bill every 3 months
        const baseMonth = billDate.getFullYear() === currentYear ? billDate.getMonth() : startMonth;
        const first = Math.max(0, baseMonth);
        for (let m = first; m < 12; m += 3) {
          const bucket = byMonth[m];
          bucket.items.push({
            day: billDay,
            provider: e.billName || e.provider || e.billType,
            billType: e.billType,
            cycle: e.cycle,
            amount: Number(e.amount) || 0
          });
          bucket.total += Number(e.amount) || 0;
        }
      } else if (e.cycle === 'yearly') {
        // Generate bill once for the year
        if (billDate.getFullYear() === currentYear) {
          const bucket = byMonth[billDate.getMonth()];
          bucket.items.push({
            day: billDay,
            provider: e.billName || e.provider || e.billType,
            billType: e.billType,
            cycle: e.cycle,
            amount: Number(e.amount) || 0
          });
          bucket.total += Number(e.amount) || 0;
        }
      } else if (e.cycle === 'daily') {
        // For daily bills, add to every day of every month (this might be too many, but following the requirement)
        for (let m = Math.max(0, startMonth); m < 12; m++) {
          const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
          for (let day = 1; day <= daysInMonth; day++) {
            const bucket = byMonth[m];
            bucket.items.push({
              day: day,
              provider: e.billName || e.provider || e.billType,
              billType: e.billType,
              cycle: e.cycle,
              amount: Number(e.amount) || 0
            });
            bucket.total += Number(e.amount) || 0;
          }
        }
      } else {
        // one-time or unknown cycle - add only once
        // For one-time bills, show them in any year if they fall in that year
        if (billDate.getFullYear() === currentYear) {
          const bucket = byMonth[billDate.getMonth()];
          bucket.items.push({
            day: billDay,
            provider: e.billName || e.provider || e.billType,
            billType: e.billType,
            cycle: e.cycle || 'one-time',
            amount: Number(e.amount) || 0,
            fullDate: billDate.toISOString().slice(0, 10) // Store full date for one-time bills
          });
          bucket.total += Number(e.amount) || 0;
        }
      }
    }

    for (const m of byMonth) { m.items.sort((a, b) => a.day - b.day); }
    const yearlySchedule = byMonth;

    const end = new Date(now);
    end.setDate(end.getDate() + horizonDays);
    const upcoming = [];

    // Generate recurring bill instances for upcoming period
    for (const e of entries) {
      // Use payableDate if available, otherwise fall back to dueDate
      const dateToUse = e.payableDate || e.dueDate;
      if (!dateToUse) continue;

      const billDate = new Date(dateToUse);
      const billDay = billDate.getDate();

      if (e.cycle === 'monthly') {
        // Generate monthly instances within the horizon
        const current = new Date(now.getFullYear(), now.getMonth(), billDay);
        while (current <= end) {
          if (current >= now) {
            upcoming.push({
              date: current.toISOString().slice(0, 10),
              provider: e.billName || e.provider || e.billType,
              billType: e.billType,
              amount: Number(e.amount) || 0,
              cycle: e.cycle
            });
          }
          current.setMonth(current.getMonth() + 1);
        }
      } else if (e.cycle === 'quarterly') {
        // Generate quarterly instances within the horizon
        const current = new Date(billDate);
        // Find next occurrence from now
        while (current < now) {
          current.setMonth(current.getMonth() + 3);
        }
        while (current <= end) {
          if (current >= now) {
            upcoming.push({
              date: current.toISOString().slice(0, 10),
              provider: e.billName || e.provider || e.billType,
              billType: e.billType,
              amount: Number(e.amount) || 0,
              cycle: e.cycle
            });
          }
          current.setMonth(current.getMonth() + 3);
        }
      } else if (e.cycle === 'yearly') {
        // Check if the yearly bill falls within the horizon
        const yearlyDate = new Date(now.getFullYear(), billDate.getMonth(), billDay);
        if (yearlyDate >= now && yearlyDate <= end) {
          upcoming.push({
            date: yearlyDate.toISOString().slice(0, 10),
            provider: e.billName || e.provider || e.billType,
            billType: e.billType,
            amount: Number(e.amount) || 0,
            cycle: e.cycle
          });
        }
        // Check next year if we're near year end
        const nextYearDate = new Date(now.getFullYear() + 1, billDate.getMonth(), billDay);
        if (nextYearDate >= now && nextYearDate <= end) {
          upcoming.push({
            date: nextYearDate.toISOString().slice(0, 10),
            provider: e.billName || e.provider || e.billType,
            billType: e.billType,
            amount: Number(e.amount) || 0,
            cycle: e.cycle
          });
        }
      } else if (e.cycle === 'daily') {
        // Generate daily instances within the horizon
        const current = new Date(now);
        current.setHours(0, 0, 0, 0);
        while (current <= end) {
          if (current >= now) {
            upcoming.push({
              date: current.toISOString().slice(0, 10),
              provider: e.billName || e.provider || e.billType,
              billType: e.billType,
              amount: Number(e.amount) || 0,
              cycle: e.cycle
            });
          }
          current.setDate(current.getDate() + 1);
        }
      } else {
        // one-time bill
        const d = new Date(dateToUse);
        if (d >= now && d <= end) {
          upcoming.push({
            date: d.toISOString().slice(0, 10),
            provider: e.billName || e.provider || e.billType,
            billType: e.billType,
            amount: Number(e.amount) || 0,
            cycle: e.cycle || 'one-time'
          });
        }
      }
    }

    upcoming.sort((a, b) => (a.date > b.date ? 1 : -1));
    const upcomingTotal = upcoming.reduce((s, i) => s + i.amount, 0);
    const scheduledCount = yearlySchedule.reduce((s, m) => s + m.items.length, 0);

    res.json({
      summary: {
        annualTotal,
        upcomingTotal,
        scheduledCount,
        year: currentYear,
        horizonDays,
      },
      monthlyProvisions,
      cycleMix,
      yearlySchedule,
      upcoming,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bill dates analytics', error: error.message });
  }
});

// Weekly Appointments analytics (for Telephone Conversation entries)
router.get('/appointments/weekly', authMiddleware, async (req, res) => {
  try {
    const weekStartParam = req.query.weekStart ? new Date(req.query.weekStart) : null;
    const now = new Date();
    const day = now.getDay(); // 0=Sun..6=Sat
    const mondayOffset = (day === 0 ? -6 : 1 - day); // shift to Monday
    const defaultStart = new Date(now);
    defaultStart.setDate(now.getDate() + mondayOffset);
    defaultStart.setHours(0, 0, 0, 0);
    const weekStart = weekStartParam && !isNaN(weekStartParam) ? new Date(weekStartParam) : defaultStart;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const investments = await Investment.find({
      userId: req.userId,
      category: 'daily-telephone-conversation',
      $or: [
        { startDate: { $gte: weekStart, $lte: weekEnd } },
        { maturityDate: { $gte: weekStart, $lte: weekEnd } },
      ]
    }).sort({ startDate: 1 });

    const billInvestments = await Investment.find({
      userId: req.userId,
      category: 'daily-bill-checklist',
      $or: [
        { maturityDate: { $gte: weekStart, $lte: weekEnd } },
        { startDate: { $gte: weekStart, $lte: weekEnd } },
      ]
    }).sort({ maturityDate: 1 });

    const loanInvestments = await Investment.find({
      userId: req.userId,
      category: 'daily-loan-ledger',
      $or: [
        { maturityDate: { $gte: weekStart, $lte: weekEnd } },
        { startDate: { $gte: weekStart, $lte: weekEnd } },
      ]
    }).sort({ maturityDate: 1 });

    const calendarEvents = await CalendarEvent.find({
      userId: req.userId,
      date: { $gte: weekStart, $lte: weekEnd },
      status: { $ne: 'cancelled' }
    }).sort({ date: 1, time: 1 });

    const reminders = await Reminder.find({
      userId: req.userId,
      dateTime: { $gte: weekStart, $lte: weekEnd },
      status: { $ne: 'completed' }
    }).sort({ dateTime: 1 });

    const notifications = await Notification.find({
      userId: req.userId,
      scheduledTime: { $gte: weekStart, $lte: weekEnd }
    }).sort({ scheduledTime: 1 });

    const normalize = (inv) => {
      let notes = {};
      try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
      const dateTime = notes.dateTime ? new Date(notes.dateTime) : (inv.startDate ? new Date(inv.startDate) : null);
      const followUpDate = notes.followUpDate ? new Date(notes.followUpDate) : (inv.maturityDate ? new Date(inv.maturityDate) : null);
      return {
        contactName: notes.contactName || '',
        phoneNumber: inv.provider || notes.phoneNumber || '',
        callType: notes.callType || 'Outgoing',
        status: notes.status || 'open',
        priority: notes.priority || 'medium',
        dateTime,
        followUpDate,
      };
    };

    const entries = investments.map(normalize);
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = Array.from({ length: 7 }, (_, i) => ({ name: weekdays[i], count: 0 }));
    const statusMap = new Map();
    const upcoming = [];
    const scheduleDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const name = d.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
      return { date: d, label, name };
    });
    const startHour = parseInt(req.query.startHour || '8', 10);
    const endHour = parseInt(req.query.endHour || '20', 10);
    const stepMin = parseInt(req.query.stepMin || '30', 10);
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += stepMin) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const time = `${hh}:${mm}`;
        slots.push({ time, cells: Array.from({ length: 7 }, () => []) });
      }
    }
    const slotIndexFor = (date) => {
      const h = date.getHours();
      const m = date.getMinutes();
      const total = (h - startHour) * 60 + m;
      if (total < 0) return -1;
      const idx = Math.floor(total / stepMin);
      return idx >= 0 && idx < slots.length ? idx : -1;
    };
    const slotIndexForHM = (h, m) => {
      const total = (h - startHour) * 60 + m;
      if (total < 0) return 0;
      const idx = Math.floor(total / stepMin);
      return idx >= 0 && idx < slots.length ? idx : (slots.length - 1);
    };
    for (const e of entries) {
      const d = e.dateTime || e.followUpDate;
      if (d) {
        const index = (d.getDay() + 6) % 7; // convert Sun(0) to 6
        counts[index].count += 1;
        upcoming.push({
          date: d.toISOString().slice(0, 16).replace('T', ' '),
          contactName: e.contactName || e.phoneNumber,
          callType: e.callType,
          status: e.status,
          priority: e.priority,
        });

        // Fill schedule grid
        if (d >= weekStart && d <= weekEnd) {
          const sIdx = slotIndexFor(d);
          if (sIdx >= 0) {
            slots[sIdx].cells[index].push({
              title: e.contactName || e.phoneNumber,
              status: e.status || 'open',
              priority: e.priority || 'medium',
              type: e.callType || 'Outgoing',
            });
          }
        }
      }
      const sKey = e.status || 'open';
      const prev = statusMap.get(sKey) || { name: sKey, value: 0 };
      prev.value += 1;
      statusMap.set(sKey, prev);
    }

    for (const inv of billInvestments) {
      let notes = {};
      try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
      const d = inv.maturityDate ? new Date(inv.maturityDate) : (notes.dueDate ? new Date(notes.dueDate) : null);
      if (!d) continue;
      const index = (d.getDay() + 6) % 7;
      counts[index].count += 1;
      const sIdx = 0;
      slots[sIdx].cells[index].push({ title: notes.billType || inv.name || 'Bill', type: 'Bill' });
    }

    for (const inv of loanInvestments) {
      let notes = {};
      try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
      const d = inv.maturityDate ? new Date(inv.maturityDate) : (notes.dueDate ? new Date(notes.dueDate) : null);
      if (!d) continue;
      const index = (d.getDay() + 6) % 7;
      counts[index].count += 1;
      const sIdx = 0;
      slots[sIdx].cells[index].push({ title: inv.name || 'Loan', type: 'Loan' });
    }

    for (const ev of calendarEvents) {
      const d = new Date(ev.date);
      const index = (d.getDay() + 6) % 7;
      counts[index].count += 1;
      let sIdx = 0;
      if (ev.time && /\d{1,2}:\d{2}/.test(ev.time)) {
        const parts = ev.time.match(/(\d{1,2}):(\d{2})/);
        const h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        sIdx = slotIndexForHM(h, m);
      }
      slots[sIdx].cells[index].push({ title: ev.title, type: 'Event' });
    }

    for (const r of reminders) {
      const d = new Date(r.dateTime);
      const index = (d.getDay() + 6) % 7;
      counts[index].count += 1;
      const sIdx = slotIndexFor(d);
      slots[(sIdx >= 0 ? sIdx : 0)].cells[index].push({ title: r.title, type: 'Reminder' });
    }

    for (const n of notifications) {
      const d = new Date(n.scheduledTime);
      const index = (d.getDay() + 6) % 7;
      counts[index].count += 1;
      const sIdx = slotIndexFor(d);
      slots[(sIdx >= 0 ? sIdx : 0)].cells[index].push({ title: n.title, type: 'Notification' });
    }
    upcoming.sort((a, b) => (a.date > b.date ? 1 : -1));

    const total = entries.length + billInvestments.length + loanInvestments.length + calendarEvents.length + reminders.length + notifications.length;
    const summary = {
      total,
      open: (statusMap.get('open')?.value || 0),
      closed: (statusMap.get('closed')?.value || 0),
      weekStart: weekStart,
      weekEnd: weekEnd,
    };

    res.json({
      summary,
      weekdayCounts: counts,
      statusDistribution: Array.from(statusMap.values()),
      upcoming,
      schedule: {
        weekStart,
        weekEnd,
        days: scheduleDays.map(d => ({ date: d.date, label: d.label, name: d.name })),
        slots,
        stepMin,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly appointments', error: error.message });
  }
});

// Yearly Calendar analytics combining multiple categories
router.get('/calendar/yearly', authMiddleware, async (req, res) => {
  try {
    const yearParam = parseInt(req.query.year, 10);
    const currentYear = !isNaN(yearParam) ? yearParam : (new Date()).getFullYear();
    const categoriesParam = (req.query.categories || '').split(',').filter(Boolean);
    const categories = categoriesParam.length ? categoriesParam : ['daily-bill-checklist', 'daily-telephone-conversation', 'daily-loan-ledger'];

    const investments = await Investment.find({ userId: req.userId, category: { $in: categories } }).sort({ startDate: 1 });
    const basicDetails = await BasicDetails.find({ userId: req.userId });

    const normalize = (inv) => {
      let notes = {};
      try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
      const base = {
        category: inv.category,
        type: inv.type,
        name: inv.name,
        provider: inv.provider,
        amount: inv.amount || 0,
        startDate: inv.startDate ? new Date(inv.startDate) : null,
        maturityDate: inv.maturityDate ? new Date(inv.maturityDate) : null,
      };
      if (inv.category === 'daily-bill-checklist') {
        return {
          ...base,
          billType: notes.billType || inv.name,
          dueDate: base.maturityDate || (notes.dueDate ? new Date(notes.dueDate) : null),
        };
      } else if (inv.category === 'daily-telephone-conversation') {
        const dateTime = notes.dateTime ? new Date(notes.dateTime) : base.startDate;
        const followUpDate = notes.followUpDate ? new Date(notes.followUpDate) : base.maturityDate;
        return {
          ...base,
          contactName: notes.contactName || base.provider,
          callType: notes.callType || 'Outgoing',
          dateTime,
          followUpDate,
        };
      } else if (inv.category === 'daily-loan-ledger') {
        const interestType = notes.interestType || 'simple';
        const frequency = notes.frequency || inv.frequency || 'monthly';
        const start = base.startDate;
        const end = base.maturityDate || (notes.dueDate ? new Date(notes.dueDate) : null);
        return {
          ...base,
          interestType,
          frequency,
          start,
          end,
          partyName: notes.partyName || base.provider,
        };
      }
      return base;
    };

    const entries = investments.map(normalize);

    const months = Array.from({ length: 12 }, (_, i) => ({
      idx: i,
      name: new Date(currentYear, i, 1).toLocaleString('en-US', { month: 'short' }),
      count: 0,
      amount: 0,
      days: {},
    }));

    const categoryMix = new Map();

    for (const e of entries) {
      let eventDate = null;
      if (e.category === 'daily-bill-checklist') {
        eventDate = e.dueDate;
      } else if (e.category === 'daily-telephone-conversation') {
        eventDate = e.dateTime || e.followUpDate;
      } else if (e.category === 'daily-loan-ledger') {
        if (e.frequency === 'monthly' && e.interestType === 'emi' && e.start) {
          const start = new Date(e.start);
          const end = e.end ? new Date(e.end) : new Date(start);
          if (!e.end) end.setMonth(end.getMonth() + 12);
          const schedule = [];
          const cur = new Date(start);
          while (cur <= end) {
            schedule.push(new Date(cur));
            cur.setMonth(cur.getMonth() + 1);
          }
          for (const d of schedule) {
            if (d.getFullYear() !== currentYear) continue;
            const m = months[d.getMonth()];
            const dayKey = String(d.getDate()).padStart(2, '0');
            if (!m.days[dayKey]) m.days[dayKey] = [];
            m.days[dayKey].push({
              category: e.category,
              title: e.partyName || e.name,
              subtitle: 'EMI',
              amount: e.amount || 0,
              label: 'emi',
            });
            m.count += 1;
            const cmPrev = categoryMix.get(e.category) || { name: e.category, value: 0 };
            cmPrev.value += 1;
            categoryMix.set(e.category, cmPrev);
          }
          continue;
        }
      } else {
        eventDate = e.startDate || e.maturityDate;
      }
      if (!eventDate) continue;
      const d = new Date(eventDate);
      if (d.getFullYear() !== currentYear) continue;
      const m = months[d.getMonth()];
      const dayKey = String(d.getDate()).padStart(2, '0');
      if (!m.days[dayKey]) m.days[dayKey] = [];
      m.days[dayKey].push({
        category: e.category,
        title: e.category === 'daily-bill-checklist' ? (e.billType || e.name) : (e.contactName || e.name),
        subtitle: e.category === 'daily-bill-checklist' ? (e.provider || '') : (e.callType || ''),
        amount: e.amount || 0,
        label: e.category === 'daily-bill-checklist' && ((e.billType || '').toLowerCase().includes('insurance') || (e.name || '').toLowerCase().includes('insurance')) ? 'policy-renewal' : (e.category === 'daily-telephone-conversation' ? 'call' : 'bill'),
      });
      m.count += 1;
      if (e.category === 'daily-bill-checklist') m.amount += Number(e.amount) || 0;
      const cmPrev = categoryMix.get(e.category) || { name: e.category, value: 0 };
      cmPrev.value += 1;
      categoryMix.set(e.category, cmPrev);
    }

    for (const bd of basicDetails) {
      const name = [bd.firstName, bd.lastName].filter(Boolean).join(' ') || 'Member';
      if (bd.dateOfBirth) {
        const dob = new Date(bd.dateOfBirth);
        const d = new Date(currentYear, dob.getMonth(), dob.getDate());
        const m = months[d.getMonth()];
        const dayKey = String(d.getDate()).padStart(2, '0');
        if (!m.days[dayKey]) m.days[dayKey] = [];
        m.days[dayKey].push({ category: 'static', title: name, subtitle: 'Birthday', amount: 0, label: 'birthday' });
        m.count += 1;
        const cmPrev = categoryMix.get('static') || { name: 'static', value: 0 };
        cmPrev.value += 1;
        categoryMix.set('static', cmPrev);
      }
      if (bd.anniversaryDate) {
        const ann = new Date(bd.anniversaryDate);
        const d = new Date(currentYear, ann.getMonth(), ann.getDate());
        const m = months[d.getMonth()];
        const dayKey = String(d.getDate()).padStart(2, '0');
        if (!m.days[dayKey]) m.days[dayKey] = [];
        m.days[dayKey].push({ category: 'static', title: name, subtitle: 'Anniversary', amount: 0, label: 'anniversary' });
        m.count += 1;
        const cmPrev = categoryMix.get('static') || { name: 'static', value: 0 };
        cmPrev.value += 1;
        categoryMix.set('static', cmPrev);
      }
    }

    const eventsPerMonth = months.map(m => ({ name: m.name, count: m.count }));
    const billAmountPerMonth = months.map(m => ({ name: m.name, amount: m.amount }));
    const calendar = months.map(m => ({ name: m.name, days: m.days, count: m.count, amount: m.amount }));
    const summary = {
      year: currentYear,
      totalEvents: eventsPerMonth.reduce((s, x) => s + x.count, 0),
      totalBillsAmount: billAmountPerMonth.reduce((s, x) => s + x.amount, 0),
      busiestMonth: eventsPerMonth.reduce((max, x) => (x.count > (max.count || 0) ? x : max), {}).name || '',
    };

    res.json({ summary, eventsPerMonth, billAmountPerMonth, categoryMix: Array.from(categoryMix.values()), calendar });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching yearly calendar', error: error.message });
  }
});

// Loan Amortization Routes

// Mark payment as paid/unpaid
router.patch('/:id/payment/:paymentNumber', authMiddleware, async (req, res) => {
  try {
    const { isPaid, paidDate, paidAmount, extraPayment } = req.body;

    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.userId,
      category: 'loan-amortization'
    });

    if (!investment) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const paymentIndex = investment.paymentSchedule.findIndex(
      p => p.paymentNumber === parseInt(req.params.paymentNumber)
    );

    if (paymentIndex === -1) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    investment.paymentSchedule[paymentIndex].isPaid = isPaid;
    if (isPaid) {
      investment.paymentSchedule[paymentIndex].paidDate = paidDate || new Date();
      investment.paymentSchedule[paymentIndex].paidAmount = paidAmount || investment.paymentSchedule[paymentIndex].payment;
      if (extraPayment !== undefined) {
        investment.paymentSchedule[paymentIndex].extraPayment = extraPayment;
      }
    } else {
      investment.paymentSchedule[paymentIndex].paidDate = null;
      investment.paymentSchedule[paymentIndex].paidAmount = null;
    }

    investment.updatedAt = Date.now();
    await investment.save();

    res.json({
      message: 'Payment status updated successfully',
      payment: investment.paymentSchedule[paymentIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Get all loans
router.get('/loans/list', authMiddleware, async (req, res) => {
  try {
    const loans = await Investment.find({
      userId: req.userId,
      category: 'loan-amortization'
    }).sort({ createdAt: -1 });

    // Calculate summary for each loan
    const loansWithSummary = loans.map(loan => {
      const totalPayments = loan.paymentSchedule?.length || 0;
      const paidPayments = loan.paymentSchedule?.filter(p => p.isPaid).length || 0;
      const remainingPayments = totalPayments - paidPayments;

      const totalAmount = loan.amount || 0;
      const paidAmount = loan.paymentSchedule?.filter(p => p.isPaid)
        .reduce((sum, p) => sum + (p.paidAmount || 0), 0) || 0;
      const remainingAmount = loan.paymentSchedule?.filter(p => !p.isPaid)
        .reduce((sum, p) => sum + p.endingBalance, 0) || 0;

      // Get current EMI: first unpaid payment's EMI, or first payment if all paid, or from notes
      const firstUnpaid = loan.paymentSchedule?.find(p => !p.isPaid);
      let currentEmi = firstUnpaid?.payment || loan.paymentSchedule?.[0]?.payment || 0;

      // Fallback: read from notes if schedule is empty
      if (currentEmi === 0) {
        try {
          const notes = JSON.parse(loan.notes || '{}');
          currentEmi = notes.emiAmount || 0;
        } catch { }
      }

      return {
        _id: loan._id,
        name: loan.name,
        type: loan.type,
        amount: totalAmount,
        interestRate: loan.interestRate,
        startDate: loan.startDate,
        maturityDate: loan.maturityDate,
        totalPayments,
        paidPayments,
        remainingPayments,
        paidAmount,
        remainingAmount,
        monthlyPayment: currentEmi,
        createdAt: loan.createdAt
      };
    });

    res.json({ loans: loansWithSummary });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
});

// Record payment from bank transaction to specific loan
router.post('/loans/:id/record-payment', authMiddleware, async (req, res) => {
  try {
    const { amount, paymentDate, bankTransactionId, source } = req.body;

    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.userId,
      category: 'loan-amortization'
    });

    if (!investment) {
      return res.status(404).json({ message: 'Loan record not found' });
    }

    // Find the first unpaid payment in the schedule
    const firstUnpaidIndex = investment.paymentSchedule.findIndex(p => !p.isPaid);

    if (firstUnpaidIndex === -1) {
      return res.status(400).json({ message: 'All installments for this loan are already paid' });
    }

    const emi = investment.paymentSchedule[firstUnpaidIndex];

    // Update the payment details
    emi.isPaid = true;
    emi.paidDate = paymentDate || new Date();
    emi.paidAmount = Number(amount) || emi.payment;

    // Check if there's an extra payment
    if (Number(amount) > emi.payment) {
      emi.extraPayment = Number(amount) - emi.payment;
      // Recalculate the remaining schedule
      recalculateSchedule(investment.paymentSchedule, firstUnpaidIndex, investment.interestRate);
    }

    // Add record to notes history
    let notes = {};
    try { notes = JSON.parse(investment.notes || '{}'); } catch (e) { }
    const payments = notes.payments || [];
    payments.push({
      date: emi.paidDate,
      amount: emi.paidAmount,
      type: 'EMI Payment from Bank',
      paymentDetails: source || 'Bank Transaction',
      bankTransactionId,
      emiNumber: emi.paymentNumber
    });

    investment.notes = JSON.stringify({ ...notes, payments });
    investment.updatedAt = Date.now();

    await investment.save();

    res.json({
      success: true,
      message: `EMI #${emi.paymentNumber} recorded successfully`,
      investment
    });
  } catch (error) {
    console.error('Error recording loan payment:', error);
    res.status(500).json({ message: 'Error recording loan payment', error: error.message });
  }
});

// Get unique person names from Udhar Liya (Borrowed) records
router.get('/loan-ledger/persons', authMiddleware, async (req, res) => {
  try {
    const loans = await Investment.find({
      userId: req.userId,
      category: 'loan-ledger'
    }).select('name type').sort({ name: 1 });

    // Extract unique person-type combinations
    const personMap = new Map();
    loans.forEach(loan => {
      const type = loan.type || 'Lent';
      const key = `${loan.name.trim().toLowerCase()}|${type}`;
      if (loan.name && !personMap.has(key)) {
        personMap.set(key, {
          name: loan.name.trim(),
          type: type
        });
      }
    });

    const persons = Array.from(personMap.values());
    res.json({ persons });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching loan ledger persons', error: error.message });
  }
});

// Get unique person names from On Behalf records
router.get('/on-behalf/persons', authMiddleware, async (req, res) => {
  try {
    const onBehalfRecords = await Investment.find({
      userId: req.userId,
      category: 'on-behalf'
    }).select('name').sort({ name: 1 });

    // Extract unique person names
    const personMap = new Map();
    onBehalfRecords.forEach(record => {
      if (record.name && !personMap.has(record.name)) {
        personMap.set(record.name, { name: record.name });
      }
    });

    const persons = Array.from(personMap.values());
    res.json({ persons });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching on behalf persons', error: error.message });
  }
});

// Record payment from bank transaction to loan amortization
// Record a transaction (new entry or payment) for loan-ledger module
router.post('/loan-ledger/sync-transaction', authMiddleware, async (req, res) => {
  try {
    const { personName, amount, type, broaderCategory, date, bankTransactionId, description, accountName } = req.body;
    const trimmedName = personName?.trim();

    let isRepayment = false;
    let loanType = broaderCategory === 'Udhar Liya' ? 'Borrowed' : 'Lent';

    // Udhar Liya (Borrowed): Credit = Borrowed more, Debit = Paid back
    // Udhar Diya (Lent): Debit = Lent more, Credit = Received back
    if (broaderCategory === 'Udhar Liya' && type === 'debit') isRepayment = true;
    if ((broaderCategory === 'Udhar Diya' || broaderCategory === 'Lent') && type === 'credit') isRepayment = true;

    // Find existing record for this person
    const existingRecord = await Investment.findOne({
      userId: req.userId,
      category: 'loan-ledger',
      name: { $regex: new RegExp("^" + trimmedName + "$", "i") },
      type: loanType
    }).sort({ createdAt: -1 });

    if (existingRecord) {
      let notes = {};
      try { notes = JSON.parse(existingRecord.notes || '{}'); } catch (e) { }

      const transAmount = Number(amount);
      const isLentMode = loanType === 'Lent';

      if (isRepayment) {
        // Repayment: Increase totalPaid
        const totalPaid = (notes.totalPaid || 0) + transAmount;
        const balanceAmount = existingRecord.amount - totalPaid;
        const payments = [...(notes.payments || []), {
          date: date,
          amount: transAmount,
          type: 'Repayment',
          paymentDetails: `Bank: ${accountName}`,
          comments: description || 'Repayment from Bank Transaction',
          bankTransactionId
        }];

        existingRecord.notes = JSON.stringify({
          ...notes,
          totalPaid,
          balanceAmount,
          payments
        });
      } else {
        // Borrowing More or Lending More: Increase total amount
        existingRecord.amount = (existingRecord.amount || 0) + transAmount;
        const totalPaid = notes.totalPaid || 0;
        const balanceAmount = existingRecord.amount - totalPaid;
        const payments = [...(notes.payments || []), {
          date: date,
          amount: transAmount,
          type: isLentMode ? 'Additional Lending' : 'Additional Borrowing',
          paymentDetails: `Bank: ${accountName}`,
          comments: description || (isLentMode ? 'Additional lending from Bank Transaction' : 'Additional borrowing from Bank Transaction'),
          bankTransactionId
        }];

        existingRecord.notes = JSON.stringify({
          ...notes,
          totalPaid,
          balanceAmount,
          payments
        });
      }

      await existingRecord.save();
      return res.json({ success: true, message: 'Existing record updated successfully', record: existingRecord });
    }

    // If existing record not found, create NEW record
    const payload = {
      userId: req.userId,
      category: 'loan-ledger',
      type: loanType,
      name: personName,
      amount: Number(amount),
      startDate: date,
      maturityDate: date,
      frequency: 'one-time',
      source: `Bank: ${accountName}`,
      notes: JSON.stringify({
        forPurpose: description || 'Bank Transaction',
        comments: `Created from bank transaction on ${new Date().toLocaleDateString('en-IN')}`,
        totalPaid: 0,
        balanceAmount: Number(amount),
        payments: [],
        bankTransactionId
      })
    };

    const newRecord = new Investment(payload);
    await newRecord.save();
    res.json({ success: true, message: 'New loan ledger record created', record: newRecord });

  } catch (error) {
    console.error('Error in loan-ledger sync:', error);
    res.status(500).json({ message: 'Error recording transaction', error: error.message });
  }
});

// Record a transaction for on-behalf module
router.post('/on-behalf/sync-transaction', authMiddleware, async (req, res) => {
  try {
    const { personName, amount, type, date, bankTransactionId, description, accountName } = req.body;
    const trimmedName = personName?.trim();

    const existingRecord = await Investment.findOne({
      userId: req.userId,
      category: 'on-behalf',
      name: { $regex: new RegExp("^" + trimmedName + "$", "i") }
    }).sort({ createdAt: -1 });

    if (existingRecord) {
      let notes = {};
      try { notes = JSON.parse(existingRecord.notes || '{}'); } catch (e) { }
      const transAmount = Number(amount);

      if (type === 'credit') {
        // Receipt back to me
        const totalReceived = (notes.totalReceived || notes.receivedAmount || 0) + transAmount;
        const receipts = [...(notes.receipts || []), {
          date: date,
          amount: transAmount,
          type: 'Receipt',
          paymentDetails: `Bank: ${accountName}`,
          comments: description || 'Receipt from Bank Transaction',
          bankTransactionId
        }];

        existingRecord.notes = JSON.stringify({
          ...notes,
          totalReceived,
          receivedAmount: totalReceived,
          receipts
        });
      } else {
        // Paid more on behalf
        existingRecord.amount = (existingRecord.amount || 0) + transAmount;
        const totalReceived = notes.totalReceived || notes.receivedAmount || 0;
        const receipts = [...(notes.receipts || []), {
          date: date,
          amount: transAmount,
          type: 'Additional Payment',
          paymentDetails: `Bank: ${accountName}`,
          comments: description || 'Additional payment on behalf from Bank Transaction',
          bankTransactionId
        }];

        existingRecord.notes = JSON.stringify({
          ...notes,
          totalReceived,
          receivedAmount: totalReceived,
          receipts
        });
      }

      await existingRecord.save();
      return res.json({ success: true, message: 'Existing on-behalf record updated', record: existingRecord });
    }

    // If existing record not found, create NEW record
    const payload = {
      userId: req.userId,
      category: 'on-behalf',
      type: 'On Behalf',
      name: trimmedName,
      amount: Number(amount),
      startDate: date,
      maturityDate: date,
      frequency: 'one-time',
      source: `Bank: ${accountName}`,
      notes: JSON.stringify({
        forPurpose: description || 'Bank Transaction',
        comments: `Created from bank transaction on ${new Date().toLocaleDateString('en-IN')}`,
        receivedAmount: 0,
        totalReceived: 0,
        receipts: [],
        bankTransactionId
      })
    };

    const newRecord = new Investment(payload);
    await newRecord.save();
    res.json({ success: true, message: 'New on-behalf record created', record: newRecord });

  } catch (error) {
    console.error('Error in on-behalf sync:', error);
    res.status(500).json({ message: 'Error recording transaction', error: error.message });
  }
});

// Helper function to recalculate schedule after extra payment
function recalculateSchedule(schedule, startIndex, annualRate) {
  const monthlyRate = (annualRate || 0) / 12 / 100;

  for (let i = startIndex; i < schedule.length; i++) {
    const emi = schedule[i];
    const prevBalance = i > 0 ? schedule[i - 1].endingBalance : emi.beginningBalance;

    // Adjust beginning balance if previous EMI had extra payment
    if (i > 0 && schedule[i - 1].extraPayment > 0) {
      emi.beginningBalance = prevBalance - schedule[i - 1].extraPayment;
    }

    // Recalculate interest based on adjusted balance
    emi.interest = emi.beginningBalance * monthlyRate;
    emi.principal = emi.payment - emi.interest + (emi.extraPayment || 0);
    emi.endingBalance = Math.max(0, emi.beginningBalance - emi.principal);
  }
}

// Record a transaction for wallet module (Recharge)
router.post('/wallet/sync-transaction', authMiddleware, async (req, res) => {
  try {
    const { walletId, amount, type, date, bankTransactionId, description, accountName } = req.body;

    const Cash = require('../models/Cash'); // Local require to avoid circular dependency if any
    const wallet = await Cash.findOne({ _id: walletId, userId: req.userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transAmount = Number(amount);

    // For Wallet Recharge (Debit from Bank = Credit to Wallet)
    // If it's a debit from bank, it's an increase in wallet amount
    if (type === 'debit') {
      wallet.amount = (wallet.amount || 0) + transAmount;
    } else {
      // If it's a credit to bank from wallet, it's a decrease in wallet amount
      wallet.amount = (wallet.amount || 0) - transAmount;
    }

    // Add record to notes for history
    let notes = {};
    try { notes = JSON.parse(wallet.notes || '{}'); } catch (e) { }

    const transactions = [...(notes.transactions || []), {
      date: date,
      amount: transAmount,
      type: type === 'debit' ? 'Recharge' : 'Withdrawal',
      source: `Bank: ${accountName}`,
      description: description || 'Transfer from Bank',
      bankTransactionId
    }];

    wallet.notes = JSON.stringify({
      ...notes,
      transactions
    });

    await wallet.save();
    res.json({ success: true, message: 'Wallet balance updated successfully', wallet });

  } catch (error) {
    console.error('Error in wallet sync:', error);
    res.status(500).json({ message: 'Error recording wallet transaction', error: error.message });
  }
});

module.exports = router;
