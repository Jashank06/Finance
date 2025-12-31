const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const usersRoutes = require('./routes/users');
const featureUsageRoutes = require('./routes/featureUsage');
const paymentRoutes = require('./routes/payment');
const investmentRoutes = require('./routes/investment');
const goldSgbRoutes = require('./routes/goldSgb');
const staticRoutes = require('./routes/static');
const cashRoutes = require('./routes/cash');
const cardRoutes = require('./routes/cards');
const bankRoutes = require('./routes/bank');
const transactionRoutes = require('./routes/transactions');
const bankTransactionRoutes = require('./routes/bankTransactions');
const incomeExpenseRoutes = require('./routes/incomeExpense');
const calendarRoutes = require('./routes/calendar');
const calendarTypesRoutes = require('./routes/calendarTypes');
const categoriesRoutes = require('./routes/categories');
const remindersRoutes = require('./routes/reminders');
const notificationsRoutes = require('./routes/notifications');
const projectRoutes = require('./routes/projects');
const testRoutes = require('./routes/test');
const investmentValuationRoutes = require('./routes/investmentValuation');
const investmentProfileRoutes = require('./routes/investmentProfile');
const cashMembersRoutes = require('./routes/cashMembers');
const cashTransactionsRoutes = require('./routes/cashTransactions');
const budgetRoutes = require('./routes/budget');
const scheduledExpensesRoutes = require('./routes/scheduledExpenses');
const cashflowAnalysisRoutes = require('./routes/cashflow-analysis');
const transactionCategoriesRoutes = require('./routes/transactionCategories');
const tradingDetailsRoutes = require('./routes/tradingDetails');
const profitLossRoutes = require('./routes/profitLoss');
const blogsRoutes = require('./routes/blogs');
const successStoriesRoutes = require('./routes/successStories');
const careersRoutes = require('./routes/careers');
const contactMessagesRoutes = require('./routes/contactMessages');
const subscriptionPlansRoutes = require('./routes/subscriptionPlans');
const couponsRoutes = require('./routes/coupons');
const spacePlansRoutes = require('./routes/spacePlans');
const uploadRoutes = require('./routes/upload');
const folderRoutes = require('./routes/folders');
const documentRoutes = require('./routes/documents');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Get allowed origins from environment variable or use defaults
    const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5001',
      'http://13.235.53.147',
      'http://13.235.53.147:5001',
      'https://jashank06.github.io',
      // Production domains
      'http://palbamb.com',
      'https://palbamb.com',
      'http://www.palbamb.com',
      'https://www.palbamb.com',
      'http://palbamb.in',
      'https://palbamb.in',
      'http://www.palbamb.in',
      'https://www.palbamb.in',
      ...envOrigins
    ];

    // Allow localhost in development
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, log rejected origins for debugging
      console.log('CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Atlas Connected Successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/feature-usage', featureUsageRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/gold-sgb', goldSgbRoutes);
app.use('/api/static', staticRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bank-transactions', bankTransactionRoutes);
app.use('/api/income-expense', incomeExpenseRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/calendar-types', calendarTypesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/test', testRoutes);
app.use('/api/investment-valuation', investmentValuationRoutes);
app.use('/api/investment-profile', investmentProfileRoutes);
app.use('/api/cash-members', cashMembersRoutes);
app.use('/api/cash-transactions', cashTransactionsRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/scheduled-expenses', scheduledExpensesRoutes);
app.use('/api/cashflow', cashflowAnalysisRoutes);
app.use('/api/transaction-categories', transactionCategoriesRoutes);
app.use('/api/trading-details', tradingDetailsRoutes);
app.use('/api/profit-loss', profitLossRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/success-stories', successStoriesRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/contact-messages', contactMessagesRoutes);
app.use('/api/subscription-plans', subscriptionPlansRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/space-plans', spacePlansRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
