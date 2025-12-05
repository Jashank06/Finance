const express = require('express');
const Investment = require('../models/Investment');
const authMiddleware = require('../middleware/auth');

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
        provider: inv.provider || notes.provider || '',
        accountNumber: inv.accountNumber || notes.accountNumber || '',
        cycle: inv.frequency || notes.cycle || 'monthly',
        amount: inv.amount || notes.amount || 0,
        dueDate: inv.maturityDate || (notes.dueDate ? new Date(notes.dueDate) : null),
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
    for (const e of entries) {
      if (!e.dueDate) continue;
      const d = new Date(e.dueDate);
      if (d.getFullYear() !== currentYear) continue;
      const bucket = byMonth[d.getMonth()];
      bucket.items.push({ day: d.getDate(), provider: e.provider || e.billType, billType: e.billType, cycle: e.cycle, amount: Number(e.amount) || 0 });
      bucket.total += Number(e.amount) || 0;
    }
    for (const m of byMonth) { m.items.sort((a, b) => a.day - b.day); }
    const yearlySchedule = byMonth;

    const end = new Date(now);
    end.setDate(end.getDate() + horizonDays);
    const upcoming = [];
    for (const e of entries) {
      if (!e.dueDate) continue;
      const d = new Date(e.dueDate);
      if (d >= now && d <= end) {
        upcoming.push({ date: d.toISOString().slice(0,10), provider: e.provider || e.billType, billType: e.billType, amount: Number(e.amount) || 0, cycle: e.cycle });
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
    defaultStart.setHours(0,0,0,0);
    const weekStart = weekStartParam && !isNaN(weekStartParam) ? new Date(weekStartParam) : defaultStart;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23,59,59,999);

    const investments = await Investment.find({
      userId: req.userId,
      category: 'daily-telephone-conversation',
      $or: [
        { startDate: { $gte: weekStart, $lte: weekEnd } },
        { maturityDate: { $gte: weekStart, $lte: weekEnd } },
      ]
    }).sort({ startDate: 1 });

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
    const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const counts = Array.from({ length: 7 }, (_, i) => ({ name: weekdays[i], count: 0 }));
    const statusMap = new Map();
    const upcoming = [];
    for (const e of entries) {
      const d = e.dateTime || e.followUpDate;
      if (d) {
        const index = (d.getDay() + 6) % 7; // convert Sun(0) to 6
        counts[index].count += 1;
        upcoming.push({
          date: d.toISOString().slice(0,16).replace('T',' '),
          contactName: e.contactName || e.phoneNumber,
          callType: e.callType,
          status: e.status,
          priority: e.priority,
        });
      }
      const sKey = e.status || 'open';
      const prev = statusMap.get(sKey) || { name: sKey, value: 0 };
      prev.value += 1;
      statusMap.set(sKey, prev);
    }
    upcoming.sort((a, b) => (a.date > b.date ? 1 : -1));

    const total = entries.length;
    const summary = {
      total,
      open: (statusMap.get('open')?.value || 0),
      closed: (statusMap.get('closed')?.value || 0),
      weekStart: weekStart,
      weekEnd: weekEnd,
    };

    res.json({ summary, weekdayCounts: counts, statusDistribution: Array.from(statusMap.values()), upcoming });
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
    const categories = categoriesParam.length ? categoriesParam : ['daily-bill-checklist', 'daily-telephone-conversation'];

    const investments = await Investment.find({ userId: req.userId, category: { $in: categories } }).sort({ startDate: 1 });

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
      });
      m.count += 1;
      if (e.category === 'daily-bill-checklist') m.amount += Number(e.amount) || 0;
      const cmPrev = categoryMix.get(e.category) || { name: e.category, value: 0 };
      cmPrev.value += 1;
      categoryMix.set(e.category, cmPrev);
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

module.exports = router;
