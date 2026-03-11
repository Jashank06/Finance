const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bank = require('../models/Bank');
const Cash = require('../models/Cash');
const Investment = require('../models/Investment');
const NetWorthSnapshot = require('../models/NetWorthSnapshot');

// Helper: safely parse number
const toNum = (v) => parseFloat(v) || 0;

// GET /api/net-worth/snapshot — Aggregate all assets & liabilities
router.get('/snapshot', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all data sources in parallel
        const [banks, cashes, investments] = await Promise.all([
            Bank.find({ userId }),
            Cash.find({ userId }),
            Investment.find({ userId, isActive: { $ne: false } })
        ]);

        console.log(`[NW_DEBUG] User: ${userId} | Banks: ${banks.length} | Cash: ${cashes.length} | Invs: ${investments.length}`);

        // ── ASSETS ──────────────────────────────────────────────
        // 1) Bank balances
        const bankBalance = banks.reduce((sum, b) => sum + toNum(b.balance), 0);

        // 2) Cash balances
        const cashBalance = cashes.reduce((sum, c) => sum + toNum(c.amount), 0);

        // 3) Investments by category
        const investmentCategories = {
            'nps-ppf': ['nps', 'ppf', 'post-office'],
            'gold': ['gold', 'sgb', 'silver', 'bonds'],
            'fd-rd': ['fd', 'rd', 'bank-schemes'],
            'mutual-fund': ['mutual-fund', 'mf'],
            'shares': ['shares', 'stocks', 'equity'],
            'insurance': ['insurance', 'lic']
        };

        let totalInvestments = 0;
        let totalGold = 0;
        const investmentBreakdown = {};

        investments.forEach(inv => {
            const category = (inv.category || inv.investmentType || '').toLowerCase();
            
            // Valuation Logic:
            // 1. If quantity-based (like Gold/SGB), use quantity * currentValue
            // 2. Otherwise use currentValue, maturityAmount, amount, or investedAmount as fallback
            let amount = 0;
            const q = parseFloat(inv.quantity);
            const cv = toNum(inv.currentValue);
            const amt = toNum(inv.amount);
            
            if (q > 0) {
                amount = (cv || amt) * q;
                console.log(`[NW_TRACE] ${inv.name} (qty-based): q=${q}, cv=${cv}, amt=${amt} => result=${amount}`);
            } else {
                amount = toNum(inv.currentValue || inv.maturityAmount || inv.amount || inv.investedAmount);
                console.log(`[NW_TRACE] ${inv.name} (direct): cv=${cv}, result=${amount}`);
            }

            // Separate gold from other investments
            if (investmentCategories.gold.some(k => category.includes(k))) {
                totalGold += amount;
            } else {
                totalInvestments += amount;
            }

            // Build breakdown
            let catKey = 'Other';
            for (const [key, keywords] of Object.entries(investmentCategories)) {
                if (keywords.some(k => category.includes(k))) {
                    catKey = key;
                    break;
                }
            }
            investmentBreakdown[catKey] = (investmentBreakdown[catKey] || 0) + amount;
        });

        const totalAssets = bankBalance + cashBalance + totalInvestments + totalGold;

        // ── LIABILITIES ──────────────────────────────────────────
        // Loans: loan-ledger and on-behalf (lent to others = asset, borrowed = liability)
        const loanInvestments = investments.filter(inv => {
            const cat = (inv.category || '').toLowerCase();
            return cat.includes('loan') || cat === 'on-behalf' || inv.type === 'Borrowed';
        });

        const totalLoans = loanInvestments
            .filter(l => l.type === 'Borrowed' || (l.category || '').toLowerCase().includes('loan-amortization'))
            .reduce((sum, l) => {
                try {
                    const notes = l.notes ? JSON.parse(l.notes) : {};
                    return sum + toNum(notes.balanceAmount || l.amount);
                } catch {
                    return sum + toNum(l.amount);
                }
            }, 0);

        const totalLiabilities = totalLoans;
        const netWorth = totalAssets - totalLiabilities;

        // ── Save snapshot ────────────────────────────────────────
        // Save/update current month snapshot
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        await NetWorthSnapshot.findOneAndUpdate(
            { userId, date: { $gte: monthStart } },
            {
                userId,
                date: now,
                netWorth,
                totalAssets,
                totalLiabilities,
                breakdown: {
                    bankBalance,
                    cashBalance,
                    investments: totalInvestments,
                    gold: totalGold,
                    loans: totalLoans
                }
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            data: {
                netWorth,
                totalAssets,
                totalLiabilities,
                breakdown: {
                    banks: {
                        total: bankBalance,
                        count: banks.length,
                        accounts: banks.map(b => ({ name: b.bankName, balance: toNum(b.balance), accountNumber: b.accountNumber }))
                    },
                    cash: {
                        total: cashBalance,
                        count: cashes.length
                    },
                    investments: {
                        total: totalInvestments,
                        byCategory: investmentBreakdown
                    },
                    gold: {
                        total: totalGold
                    },
                    liabilities: {
                        loans: totalLoans,
                        count: loanInvestments.length
                    }
                }
            }
        });

    } catch (error) {
        console.error('Net Worth snapshot error:', error);
        res.status(500).json({ success: false, message: 'Error calculating net worth', error: error.message });
    }
});

// GET /api/net-worth/history — Last 6 months trend
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const snapshots = await NetWorthSnapshot.find({
            userId,
            date: { $gte: sixMonthsAgo }
        }).sort({ date: 1 }).limit(12);

        res.json({ success: true, data: snapshots });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching history', error: error.message });
    }
});

module.exports = router;
