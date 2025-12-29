import { useState, useEffect, useMemo } from 'react';
import { FiDollarSign, FiCalendar, FiCheckSquare, FiUserPlus, FiTrendingUp, FiBox, FiBell, FiPhoneCall, FiArrowUpRight, FiArrowDownLeft, FiActivity, FiLock, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { investmentAPI } from '../utils/investmentAPI';
import { incomeExpenseAPI } from '../utils/incomeExpenseAPI';
import { staticAPI } from '../utils/staticAPI';
import reminderAPI from '../utils/reminderAPI';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bill-dates');
  const [loading, setLoading] = useState(true);

  // Data States
  const [bills, setBills] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [bankBalances, setBankBalances] = useState([]);
  const [plRecords, setPlRecords] = useState([]); // Renamed from plSummary to avoid confusion
  const [plStats, setPlStats] = useState(null); // New state for stats
  const [reminders, setReminders] = useState([]);
  const [comms, setComms] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    expectedIncome: 0,
    expectedExpense: 0,
    actualIncome: 0,
    actualExpense: 0,
    budgetPlanned: 0,
    budgetActual: 0,
    monthlyExpenses: 0
  });

  // Helper function to normalize dates for comparison
  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  };

  // Helper function to get date string in YYYY-MM-DD format using LOCAL time (not UTC)
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 7-day calendar logic
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      const localDateStr = getLocalDateString(day);

      days.push({
        full: day,
        date: day.getDate(),
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        month: day.toLocaleDateString('en-US', { month: 'short' }),
        iso: localDateStr  // Using local date string instead of UTC ISO
      });
    }

    return days;
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const isoToday = getLocalDateString(today);
      const isoNextWeek = getLocalDateString(nextWeek);

      // console.log('[Dashboard] Fetching data from', isoToday, 'to', isoNextWeek);

      const [
        billsRes,
        tasksRes,
        loansRes,
        onBehalfRes,
        bankRes,
        plRecordsRes,
        plStatsRes,
        remindersRes,
        commsRes,
        ieSummaryRes,
        IEActualRes,
        budgetRes,
        monthlyExpensesRes
      ] = await Promise.all([
        investmentAPI.getBillDatesAnalytics(), // CHANGED: Use analytics endpoint
        staticAPI.getFamilyTasks(),
        investmentAPI.getAll('loan-ledger'),
        investmentAPI.getAll('on-behalf'),
        api.get('/bank'),
        api.get('/profit-loss').catch(e => ({ data: { data: [] } })), // CHANGED: Fetch records, not summary
        api.get('/profit-loss/stats/summary').catch(e => ({ data: { data: {} } })),
        reminderAPI.getAll('').catch(e => ({ data: { reminders: [] } })), // CHANGED: Use reminderAPI
        investmentAPI.getAll('daily-telephone-conversation'),
        incomeExpenseAPI.getRecords({ startDate: isoToday, endDate: isoNextWeek }),
        incomeExpenseAPI.getSummary(),
        api.get('/budget/targets-for-life').catch(() => ({ data: null })),
        api.get('/cashflow-analysis/monthly-expenses').catch(e => ({ data: { success: false, data: { lastMonthExpenses: 0 } } }))
      ]);



      // Extract bills from analytics response - it has upcoming bills array
      const billsData = billsRes.data.upcoming || billsRes.data.investments || [];

      const tasksData = tasksRes.data || [];
      const combinedLoans = [
        ...(loansRes.data.investments || []),
        ...(onBehalfRes.data.investments || [])
      ];



      setBills(billsData);
      setTasks(tasksData);
      setLoans(combinedLoans);
      setBankBalances(bankRes.data || []);
      setPlRecords(plRecordsRes.data.data || []); // NOW LIST OF RECORDS
      setPlStats(plStatsRes.data.data || {});
      setReminders(remindersRes.data.reminders || []);  // reminderAPI returns {reminders: [...]}
      setComms(commsRes.data.investments || []);

      // Calculate Metrics
      const summaryData = IEActualRes.data.summary || [];
      const actualInc = summaryData.find(s => s._id === 'income')?.totalAmount || 0;
      const actualExp = summaryData.find(s => s._id === 'expense')?.totalAmount || 0;

      const weekRecords = ieSummaryRes.data.records || [];
      const expectedIncRecords = weekRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + (r.amount || 0), 0);
      const expectedExpRecords = weekRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + (r.amount || 0), 0);

      const upcomingBillsTotal = billsData
        .filter(b => {
          const bDate = normalizeDate(b.maturityDate || b.dueDate || b.date);
          return bDate && bDate >= isoToday && bDate <= isoNextWeek;
        })
        .reduce((sum, b) => sum + (b.amount || 0), 0);

      const upcomingLoansTotal = combinedLoans
        .filter(l => {
          const lDate = normalizeDate(l.maturityDate || l.finalDateOfReturn || l.startDate);
          return lDate && lDate >= isoToday && lDate <= isoNextWeek;
        })
        .reduce((sum, l) => {
          try {
            const notes = l.notes ? JSON.parse(l.notes) : {};
            return sum + (notes.balanceAmount || l.amount || 0);
          } catch {
            return sum + (l.amount || 0);
          }
        }, 0);



      const budgetData = budgetRes.data || {};
      const monthlyExpensesData = monthlyExpensesRes.data.success ? monthlyExpensesRes.data.data : null;

      setFinancialStats({
        expectedIncome: expectedIncRecords || (actualInc * 0.25),
        expectedExpense: upcomingBillsTotal + upcomingLoansTotal + expectedExpRecords,
        actualIncome: actualInc,
        actualExpense: actualExp,
        budgetPlanned: budgetData.totalSavingsTarget || 0,
        budgetActual: budgetData.savings || 0,
        monthlyExpenses: monthlyExpensesData?.lastMonthExpenses || 0
      });

    } catch (error) {
      console.error('[Dashboard] Fatal error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'bill-dates', icon: <FiDollarSign />, label: 'Bill Dates' },
    { id: 'tasks', icon: <FiCheckSquare />, label: 'Tasks & Appointments' },
    { id: 'loans', icon: <FiUserPlus />, label: 'Lena Dena' },
    { id: 'pl', icon: <FiTrendingUp />, label: 'Valuation & P&L' },
    { id: 'banks', icon: <FiBox />, label: 'Balance in Banks' },
    { id: 'reminders', icon: <FiBell />, label: 'Reminders' },
    { id: 'comms', icon: <FiPhoneCall />, label: 'Communications' },
  ];

  const getDayData = (isoDate) => {
    // console.log(`[getDayData] Tab: ${activeTab}, Date: ${isoDate}`);

    if (activeTab === 'bill-dates') {
      return bills.filter(b => normalizeDate(b.date || b.maturityDate || b.dueDate) === isoDate)
        .map(b => ({
          id: b._id,
          title: b.billType || b.billName || 'Bill',
          subtitle: `₹${b.amount}`,
          type: 'bill'
        }));
    }

    if (activeTab === 'reminders') {
      return reminders.filter(r => normalizeDate(r.dateTime || r.date) === isoDate)
        .map(r => ({
          id: r._id,
          title: r.title || 'Reminder',
          subtitle: r.message || '',
          type: 'reminder'
        }));
    }

    if (activeTab === 'tasks') {
      return tasks.filter(t => normalizeDate(t.dateForUpdate || t.dateOfTaskCreation) === isoDate)
        .map(t => ({
          id: t._id,
          title: t.feature || t.taskDetailsDescription || 'Task',
          subtitle: t.status ? t.status.toUpperCase() : 'PENDING',
          type: 'task'
        }));
    }

    if (activeTab === 'loans') {
      return loans.filter(l => normalizeDate(l.maturityDate || l.finalDateOfReturn || l.startDate) === isoDate)
        .map(l => {
          const isLent = (l.type || 'Lent') === 'Lent';
          const notes = l.notes ? JSON.parse(l.notes) : {};
          const balance = notes.balanceAmount || l.amount;
          return {
            id: l._id,
            title: isLent ? `Lent to ${l.name || 'Unknown'}` : `Borrowed from ${l.name || 'Unknown'}`,
            subtitle: `₹${balance}`,
            type: 'loan'
          };
        });
    }

    if (activeTab === 'pl') {
      // P&L Records: Show Purchases and Sales
      const records = plRecords || [];
      const dayRecords = [];

      records.forEach(r => {
        // Check Purchase Date
        if (normalizeDate(r.dateOfPurchase) === isoDate) {
          dayRecords.push({
            id: r._id + '_buy',
            title: `Buy ${r.nameOfScript}`,
            subtitle: `Qty: ${r.purchaseQuantity}`,
            type: 'pl-buy'
          });
        }
        // Check Sales Date
        if (normalizeDate(r.dateOfSales) === isoDate) {
          dayRecords.push({
            id: r._id + '_sell',
            title: `Sell ${r.nameOfScript}`,
            subtitle: `P/L: ₹${(r.profitLossValue || 0).toFixed(0)}`,
            type: 'pl-sell'
          });
        }
      });
      return dayRecords;
    }

    if (activeTab === 'banks') {
      return bankBalances.filter(b => b.maturityDate && normalizeDate(b.maturityDate) === isoDate)
        .map(b => ({
          id: b._id,
          title: `FD Maturity: ${b.bankName}`,
          subtitle: `₹${b.depositAmount || b.balance}`,
          type: 'bank'
        }));
    }

    if (activeTab === 'comms') {
      return comms.filter(c => normalizeDate(c.date || c.startDate) === isoDate)
        .map(c => {
          let notes = {};
          try { notes = c.notes ? JSON.parse(c.notes) : {}; } catch { notes = {}; }

          return {
            id: c._id,
            title: `${notes.callType || 'Call'}: ${notes.contactName || c.name || 'Unknown'}`,
            subtitle: notes.topic || notes.summary || '',
            type: 'comm'
          };
        });
    }

    return [];
  };

  const renderMetric = (label, value, color, icon) => (
    <div className="metric-card">
      <div className="metric-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="metric-info">
        <span className="metric-label">{label}</span>
        <span className="metric-value">₹{Math.round(value).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Left Rail */}
      <div className="dashboard-sidebar">
        {renderMetric('Expected Income This Week', financialStats.expectedIncome, '#10b981', <FiArrowUpRight />)}
        {renderMetric('Expected Expense This Week', financialStats.expectedExpense, '#ef4444', <FiArrowDownLeft />)}
        {renderMetric('Income & Expenses (Actual)', financialStats.actualIncome - financialStats.actualExpense, '#6366f1', <FiActivity />)}
        {renderMetric('Target vs Actual', financialStats.budgetActual, '#f59e0b', <FiTrendingUp />)}
        <div className="budget-progress">
          <div className="progress-label">
            <span>Budget Performance</span>
            <span>{Math.round((financialStats.budgetActual / (financialStats.budgetPlanned || 1)) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, (financialStats.budgetActual / (financialStats.budgetPlanned || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what's happening this week.</p>
        </div>

        {/* Subscription Alert Banner */}
        {(!user?.subscriptionPlan && user?.subscriptionStatus !== 'active' && user?.subscriptionStatus !== 'trial') && (
          <div className="subscription-alert-banner">
            <div className="alert-icon">
              <FiLock size={32} />
            </div>
            <div className="alert-content">
              <h3>Unlock Full Access</h3>
              <p>You don't have an active subscription. Subscribe now to unlock all premium features and start managing your finances effectively!</p>
            </div>
            <button className="alert-upgrade-btn" onClick={() => navigate('/landing/pricing')}>
              <FiZap size={18} />
              <span>Choose a Plan</span>
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="tab-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Weekly Grid */}
        <div className="weekly-grid-card">
          <div className="grid-header">
            {weekDays.map(day => (
              <div key={day.iso} className={`grid-col-head ${day.iso === getLocalDateString(new Date()) ? 'today' : ''}`}>
                <span className="day-name">{day.dayName}</span>
                <span className="day-date">{day.date}</span>
                <span className="day-month">{day.month}</span>
              </div>
            ))}
          </div>

          <div className="grid-body">
            {weekDays.map(day => {
              const dayData = getDayData(day.iso);
              return (
                <div key={day.iso} className="grid-col">
                  {dayData.length > 0 ? (
                    dayData.map((item, idx) => (
                      <div key={idx} className="grid-item">
                        <span className="item-title">{item.title}</span>
                        {item.subtitle && <span className="item-amount">{item.subtitle}</span>}
                      </div>
                    ))
                  ) : (
                    <div className="grid-empty">No entries</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Global/List Data for non-calendar tabs */}
        {(activeTab === 'pl' || activeTab === 'banks') && (
          <div className="tab-extended-content">
            {activeTab === 'pl' && plStats && (
              <div className="pl-summary-grid">
                <div className="summary-card">Total P/L: <span>₹{Math.round(plStats.totalProfitLoss || 0).toLocaleString('en-IN')}</span></div>
                <div className="summary-card">Profitable: <span>{plStats.profitableTrades || 0}</span></div>
                <div className="summary-card">Losing: <span>{plStats.losingTrades || 0}</span></div>
              </div>
            )}

            {activeTab === 'banks' && (
              <div className="bank-list">
                {bankBalances.map(bank => (
                  <div key={bank._id} className="bank-item">
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{bank.bankName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{bank.accountNumber}</div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>₹{Math.round(Number(bank.balance)).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'reminders' && (
          <div className="reminder-list">
            {reminders.length > 0 ? reminders.map(rem => (
              <div key={rem._id} className="reminder-item">
                <FiBell />
                <span>{rem.title || 'Reminder'}</span>
                <small>{new Date(rem.date).toLocaleDateString()}</small>
              </div>
            )) : <div className="no-data">No reminders found</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
