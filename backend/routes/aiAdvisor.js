const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const Bank = require('../models/Bank');
const Cash = require('../models/Cash');
const Investment = require('../models/Investment');
const IncomeExpense = require('../models/IncomeExpense');
const fs = require('fs');
const path = require('path');

const BankTransaction = require('../models/BankTransaction');
const CashTransaction = require('../models/CashTransaction');
const Transaction = require('../models/Transaction'); // Card transactions
const Card = require('../models/Card');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const toNum = (v) => parseFloat(v) || 0;

// Helper to format date for AI
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Load project knowledge once
let projectKnowledge = '';
try {
    const knowledgePath = path.join(__dirname, '../docs/project_knowledge.md');
    projectKnowledge = fs.readFileSync(knowledgePath, 'utf8');
} catch (err) {
    console.error('Failed to load project knowledge:', err);
}

// Build rich financial context for the AI
async function buildFinancialContext(userId, currentPath = '') {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
        banks, cashes, investments, cards,
        thisMonthIE, lastMonthIE,
        bankTxns, cashTxns, cardTxns
    ] = await Promise.all([
        Bank.find({ userId }),
        Cash.find({ userId }),
        Investment.find({ userId }),
        Card.find({ userId }),
        IncomeExpense.find({ userId, date: { $gte: thisMonthStart } }),
        IncomeExpense.find({ userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
        BankTransaction.find({ user: userId, date: { $gte: ninetyDaysAgo } }).sort({ date: -1 }),
        CashTransaction.find({ userId, date: { $gte: ninetyDaysAgo } }).sort({ date: -1 }),
        Transaction.find({ userId, date: { $gte: ninetyDaysAgo } }).sort({ date: -1 })
    ]);

    // Compute summary numbers
    const totalBankBalance = banks.reduce((s, b) => s + toNum(b.balance), 0);
    const totalCash = cashes.reduce((s, c) => s + toNum(c.balance || c.openingBalance), 0);

    const thisMonthIncome = thisMonthIE.filter(r => r.type === 'income').reduce((s, r) => s + toNum(r.amount), 0);
    const thisMonthExpense = thisMonthIE.filter(r => r.type === 'expense').reduce((s, r) => s + toNum(r.amount), 0);
    const lastMonthIncome = lastMonthIE.filter(r => r.type === 'income').reduce((s, r) => s + toNum(r.amount), 0);
    const lastMonthExpense = lastMonthIE.filter(r => r.type === 'expense').reduce((s, r) => s + toNum(r.amount), 0);

    const totalInvestments = investments
        .filter(i => !['loan', 'on-behalf'].some(k => (i.category || '').toLowerCase().includes(k)))
        .reduce((s, i) => s + toNum(i.currentValue || i.maturityAmount || i.amount), 0);

    const totalLoans = investments
        .filter(i => ['loan'].some(k => (i.category || '').toLowerCase().includes(k)))
        .reduce((s, i) => {
            try { const n = i.notes ? JSON.parse(i.notes) : {}; return s + toNum(n.balanceAmount || i.amount); }
            catch { return s + toNum(i.amount); }
        }, 0);

    const netWorth = totalBankBalance + totalCash + totalInvestments - totalLoans;
    const savingsRate = lastMonthIncome > 0 ? ((lastMonthIncome - lastMonthExpense) / lastMonthIncome * 100).toFixed(1) : 0;

    // Process Transaction Logs for better analysis
    const allTxns = [
        ...bankTxns.map(t => ({ d: t.date, a: t.amount, type: t.type, src: 'Bank', desc: t.description || t.narration, cat: t.mainCategory || t.category })),
        ...cashTxns.map(t => ({ d: t.date, a: t.amount, type: t.transactionType || t.type, src: 'Cash', desc: t.description || t.narration, cat: t.mainCategory || t.category })),
        ...cardTxns.map(t => ({ d: t.date, a: t.amount, type: t.type, src: 'Card', desc: t.description || t.narration, cat: t.mainCategory || t.category }))
    ].sort((a, b) => b.d - a.d);

    // Limit to recent 40 for prompt space
    const recentTxnLogs = allTxns.slice(0, 40).map(t =>
        `- ${fmtDate(t.d)}: ${t.type === 'debit' || t.type === 'expense' ? 'OUT' : 'IN'} ₹${t.a.toLocaleString('en-IN')} | ${t.src} | ${t.desc} (${t.cat || 'Uncategorized'})`
    ).join('\n');

    return `
${projectKnowledge}

---

📊 USER'S FINANCIAL DATA:
Current Page: ${currentPath || 'Unknown'}
Net Worth: ₹${Math.round(netWorth).toLocaleString('en-IN')}
• Bank Balances: ₹${Math.round(totalBankBalance).toLocaleString('en-IN')}
• Cash: ₹${Math.round(totalCash).toLocaleString('en-IN')}
• Investments: ₹${Math.round(totalInvestments).toLocaleString('en-IN')}
• Loans: ₹${Math.round(totalLoans).toLocaleString('en-IN')}

📅 SUMMARY:
- This Month: In: ₹${thisMonthIncome}, Out: ₹${thisMonthExpense}
- Last Month: In: ₹${lastMonthIncome}, Out: ₹${lastMonthExpense}

📝 RECENT RAW LOGS:
${recentTxnLogs || 'No raw transactions found.'}

---
You are the expert Financial Advisor. You know the whole project! If a user asks about a page like Loans, refer to the "Sitemap" in your knowledge. If they ask about their money, use the data above. Be the ultimate financial expert for Palbamb.
`;
}

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, history = [], currentPath = '' } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const systemContext = await buildFinancialContext(req.user.id, currentPath);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        // Build chat with history for context
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemContext }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Namaste! I am your Financial Advisor. I have full knowledge of the Palbamb platform and your financial data. How can I assist you today? 🙏' }]
                },
                // Include previous messages for multi-turn conversation
                ...history.flatMap(msg => [
                    { role: 'user', parts: [{ text: msg.user }] },
                    { role: 'model', parts: [{ text: msg.ai }] }
                ])
            ]
        });

        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        res.json({ success: true, reply });

    } catch (error) {
        console.error('AI Advisor error:', error);
        res.status(500).json({
            success: false,
            message: 'AI Advisor is temporarily unavailable',
            error: error.message
        });
    }
});

// POST /api/ai/insights — proactive insights without a question
router.post('/insights', auth, async (req, res) => {
    try {
        const { currentPath = '' } = req.body;
        const systemContext = await buildFinancialContext(req.user.id, currentPath);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        const prompt = `${systemContext}

Based on this user's financial data, provide 3-4 specific, actionable financial insights. Format as a JSON array with this structure:
[
  {
    "type": "warning" | "tip" | "celebration" | "alert",
    "title": "Short title (max 8 words)",
    "message": "Detailed insight (2-3 sentences)",
    "emoji": "relevant emoji"
  }
]
Only return the JSON array, no other text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Parse JSON from AI response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        res.json({ success: true, insights });

    } catch (error) {
        console.error('AI Insights error:', error);
        res.status(500).json({ success: false, insights: [], error: error.message });
    }
});

module.exports = router;
