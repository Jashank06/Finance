const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BankTransaction = require('../models/BankTransaction');
const CashTransaction = require('../models/CashTransaction');
const IncomeExpense = require('../models/IncomeExpense');
const Card = require('../models/Card');

const toNum = (v) => parseFloat(v) || 0;

// Helper: get date range for last N months
function getMonthRange(monthsAgo) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59);
    return { start, end };
}

// GET /api/radar/anomalies — Detect spending anomalies
router.get('/anomalies', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch this month's expenses
        const thisMonthExpenses = await IncomeExpense.find({
            userId,
            type: 'expense',
            date: { $gte: thisMonthStart }
        });

        // Fetch last 3 months for average baseline
        const [m1, m2, m3] = [1, 2, 3].map(getMonthRange);
        const [m1Expenses, m2Expenses, m3Expenses] = await Promise.all([
            IncomeExpense.find({ userId, type: 'expense', date: { $gte: m1.start, $lte: m1.end } }),
            IncomeExpense.find({ userId, type: 'expense', date: { $gte: m2.start, $lte: m2.end } }),
            IncomeExpense.find({ userId, type: 'expense', date: { $gte: m3.start, $lte: m3.end } })
        ]);

        // Get bank transactions for this month
        const thisMonthBankTxns = await BankTransaction.find({
            user: userId,
            date: { $gte: thisMonthStart },
            transactionType: 'Expense'
        });

        // Compute category spending
        const computeCatSpend = (records) => {
            const map = {};
            records.forEach(r => {
                const cat = r.category || 'Others';
                map[cat] = (map[cat] || 0) + toNum(r.amount);
            });
            return map;
        };

        const thisCat = computeCatSpend(thisMonthExpenses);
        const m1Cat = computeCatSpend(m1Expenses);
        const m2Cat = computeCatSpend(m2Expenses);
        const m3Cat = computeCatSpend(m3Expenses);

        const allCategories = new Set([
            ...Object.keys(thisCat),
            ...Object.keys(m1Cat),
            ...Object.keys(m2Cat),
            ...Object.keys(m3Cat)
        ]);

        // Anomaly detection
        const anomalies = [];
        const categoryComparison = [];

        for (const cat of allCategories) {
            const thisAmount = thisCat[cat] || 0;
            const months = [m1Cat[cat] || 0, m2Cat[cat] || 0, m3Cat[cat] || 0];
            const avgAmount = months.reduce((s, v) => s + v, 0) / 3;

            categoryComparison.push({
                category: cat,
                thisMonth: Math.round(thisAmount),
                average: Math.round(avgAmount),
                change: avgAmount > 0 ? Math.round(((thisAmount - avgAmount) / avgAmount) * 100) : 0
            });

            if (avgAmount > 500 && thisAmount > avgAmount * 1.5) {
                const pct = Math.round(((thisAmount - avgAmount) / avgAmount) * 100);
                anomalies.push({
                    id: `cat-${cat}`,
                    type: 'overspending',
                    severity: thisAmount > avgAmount * 2.5 ? 'critical' : 'warning',
                    emoji: thisAmount > avgAmount * 2.5 ? '🔴' : '🟡',
                    title: `High ${cat} Spending`,
                    message: `You've spent ₹${Math.round(thisAmount).toLocaleString('en-IN')} on ${cat} this month — ${pct}% above your 3-month average of ₹${Math.round(avgAmount).toLocaleString('en-IN')}.`,
                    category: cat,
                    thisMonth: Math.round(thisAmount),
                    average: Math.round(avgAmount),
                    excess: Math.round(thisAmount - avgAmount)
                });
            }
        }

        // ── Subscription duplicate detector ──────────────────────────────
        // Look for same/similar amount in last 3 months from bank transactions
        const [pastBankTxns] = await Promise.all([
            BankTransaction.find({
                user: userId,
                transactionType: 'Expense',
                date: { $gte: m3.start }
            })
        ]);

        // Group by description + amount
        const merchantFreq = {};
        pastBankTxns.forEach(txn => {
            const desc = (txn.description || txn.notes || '').toLowerCase().trim().slice(0, 30);
            const amt = Math.round(toNum(txn.amount) / 10) * 10; // round to nearest 10
            if (desc && amt > 0) {
                const key = `${desc}-${amt}`;
                merchantFreq[key] = (merchantFreq[key] || []);
                merchantFreq[key].push(txn);
            }
        });

        const duplicates = [];
        for (const [key, txns] of Object.entries(merchantFreq)) {
            if (txns.length >= 3) {
                // Appeared 3+ months → likely recurring subscription
                const totalPaid = txns.reduce((s, t) => s + toNum(t.amount), 0);
                const desc = (txns[0].description || txns[0].notes || 'Unknown').slice(0, 40);
                duplicates.push({
                    merchant: desc,
                    occurrences: txns.length,
                    amountEach: toNum(txns[0].amount),
                    totalPaid: Math.round(totalPaid)
                });
            }
        }

        // ── Total anomaly spend ───────────────────────────────────────────
        const totalExcessSpend = anomalies.reduce((s, a) => s + (a.excess || 0), 0);

        // ── Healthy checks (green) ────────────────────────────────────────
        const healthyChecks = [];
        const totalThisMonth = thisMonthExpenses.reduce((s, r) => s + toNum(r.amount), 0);
        const totalAvg = Object.values(m1Cat).reduce((s, v) => s + v, 0);
        if (totalThisMonth < totalAvg * 0.9) {
            healthyChecks.push({
                id: 'total-spend-ok',
                type: 'healthy',
                severity: 'good',
                emoji: '🟢',
                title: 'Total Spending On Track!',
                message: `Your total spending this month is ₹${Math.round(totalThisMonth).toLocaleString('en-IN')}, which is below your monthly average. Great job! 🎉`
            });
        }

        // ── Sort: critical first, then warning ───────────────────────────
        anomalies.sort((a, b) => {
            const order = { critical: 0, warning: 1 };
            return (order[a.severity] || 2) - (order[b.severity] || 2);
        });

        categoryComparison.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

        res.json({
            success: true,
            data: {
                anomalies: [...anomalies, ...healthyChecks],
                totalAnomalies: anomalies.length,
                totalExcessSpend,
                categoryComparison: categoryComparison.slice(0, 8),
                subscriptions: duplicates.slice(0, 5),
                summary: {
                    totalThisMonth: Math.round(totalThisMonth),
                    criticalAlerts: anomalies.filter(a => a.severity === 'critical').length,
                    warningAlerts: anomalies.filter(a => a.severity === 'warning').length
                }
            }
        });

    } catch (error) {
        console.error('Finance Radar error:', error);
        res.status(500).json({ success: false, message: 'Error running Finance Radar', error: error.message });
    }
});

module.exports = router;
