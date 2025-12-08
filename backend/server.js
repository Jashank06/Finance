const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
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
const categoriesRoutes = require('./routes/categories');
const remindersRoutes = require('./routes/reminders');
const notificationsRoutes = require('./routes/notifications');
const testRoutes = require('./routes/test');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Atlas Connected Successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
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
app.use('/api/categories', categoriesRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/test', testRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
