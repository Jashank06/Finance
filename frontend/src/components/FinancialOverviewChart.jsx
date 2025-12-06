import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const FinancialOverviewChart = ({ cashRecords, cardRecords, bankRecords, cardTransactions, bankTransactions }) => {
  const [selectedMonth, setSelectedMonth] = useState('current');
  
  // Get current month
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Get all months in current year
  const getAllMonthsInYear = () => {
    const currentYear = new Date().getFullYear();
    const months = [];
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${currentYear}-${String(month).padStart(2, '0')}`;
      const monthName = new Date(currentYear, month - 1).toLocaleString('default', { month: 'long' });
      months.push({ key: monthKey, name: monthName });
    }
    return months;
  };
  
  const allMonthsInYear = getAllMonthsInYear();
  const currentMonth = getCurrentMonth();
  
  // Get available months from transactions
  const getAvailableMonths = () => {
    const months = new Set();
    const allTransactions = [...cashRecords, ...cardTransactions, ...bankTransactions];
    
    allTransactions.forEach(record => {
      // Use date field for cash records, fallback to createdAt
      const dateField = record.date || record.createdAt;
      const date = new Date(dateField);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    return Array.from(months).sort().reverse();
  };
  
  const availableMonths = getAvailableMonths();
  
  // Filter records by selected month
  const filterByMonth = (records) => {
    if (selectedMonth === 'all') return records;
    
    const targetMonth = selectedMonth === 'current' ? currentMonth : selectedMonth;
    
    return records.filter(record => {
      // Use date field for cash records, fallback to createdAt
      const dateField = record.date || record.createdAt;
      const date = new Date(dateField);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === targetMonth;
    });
  };
  
  const filteredCashRecords = filterByMonth(cashRecords);
  const filteredCardRecords = filterByMonth(cardRecords);
  const filteredBankRecords = filterByMonth(bankRecords);
  const filteredCardTransactions = filterByMonth(cardTransactions);
  const filteredBankTransactions = filterByMonth(bankTransactions);
  // Prepare data for charts
  const prepareChartData = () => {
    // Aggregate data by currency
    const currencyData = {};
    
    // Process cash records
    filteredCashRecords.forEach(record => {
      const currency = record.currency || 'INR';
      if (!currencyData[currency]) {
        currencyData[currency] = { cash: 0, cards: 0, bank: 0, bankBalance: 0, total: 0 };
      }
      currencyData[currency].cash += parseFloat(record.amount) || 0;
      currencyData[currency].total += parseFloat(record.amount) || 0;
    });

    // Process card records (show transaction amounts instead of limits)
    filteredCardRecords.forEach(card => {
      const currency = card.currency || 'INR';
      if (!currencyData[currency]) {
        currencyData[currency] = { cash: 0, cards: 0, bank: 0, bankBalance: 0, total: 0 };
      }
      // We'll calculate card value based on transactions instead of limits
      // Initialize with 0, transactions will be processed separately
    });

    // Process bank records (calculate total balance first)
    filteredBankRecords.forEach(account => {
      const currency = account.currency || 'INR';
      if (!currencyData[currency]) {
        currencyData[currency] = { cash: 0, cards: 0, bank: 0, bankBalance: 0, total: 0 };
      }
      const balance = parseFloat(account.balance) || 0;
      currencyData[currency].bankBalance += balance;
      // Don't add to total here, we'll calculate net total at the end
    });
    
    // Process card transactions
    filteredCardTransactions.forEach(transaction => {
      const currency = transaction.currency || 'INR';
      if (!currencyData[currency]) {
        currencyData[currency] = { cash: 0, cards: 0, bank: 0, bankBalance: 0, total: 0 };
      }
      const amount = parseFloat(transaction.amount) || 0;
      
      // Add ALL transaction amounts to cards section (user wants all transactions)
      currencyData[currency].cards += amount;
      currencyData[currency].total += amount;
    });

    // Process bank transactions (subtract from total to show net effect)
    filteredBankTransactions.forEach(transaction => {
      const currency = transaction.currency || 'INR';
      if (!currencyData[currency]) {
        currencyData[currency] = { cash: 0, cards: 0, bank: 0, bankBalance: 0, total: 0 };
      }
      const amount = parseFloat(transaction.amount) || 0;
      
      // Add to bank activity for display
      currencyData[currency].bank += amount;
      // Subtract from total to show net effect
      currencyData[currency].total -= amount;
    });
    
    // Calculate net total: spending (cash + cards + bank transactions), not bank balance
    Object.keys(currencyData).forEach(currency => {
      const data = currencyData[currency];
      data.total = data.cash + data.cards + data.bank;
      // Update bankBalance to show net balance after transactions
      data.bankBalance = data.bankBalance - data.bank;
    });

    return Object.entries(currencyData).map(([currency, data]) => ({
      currency,
      ...data
    }));
  };

  // Prepare balance and limits data
  const prepareBalanceData = () => {
    const balanceData = {};
    
    // Process bank records for balance
    bankRecords.forEach(account => {
      const currency = account.currency || 'INR';
      if (!balanceData[currency]) {
        balanceData[currency] = { bankBalance: 0, cardLimits: 0, total: 0 };
      }
      const balance = parseFloat(account.balance) || 0;
      balanceData[currency].bankBalance += balance;
      balanceData[currency].total += balance;
    });
    
    // Process card records for available limits
    cardRecords.forEach(card => {
      const currency = card.currency || 'INR';
      if (!balanceData[currency]) {
        balanceData[currency] = { bankBalance: 0, cardLimits: 0, total: 0 };
      }
      // Use availableCredit if available, otherwise use creditLimit
      const limit = parseFloat(card.availableCredit) || parseFloat(card.creditLimit) || 0;
      balanceData[currency].cardLimits += limit;
      balanceData[currency].total += limit;
    });
    
    return Object.entries(balanceData).map(([currency, data]) => ({
      currency,
      ...data
    }));
  };

  // Prepare type distribution data
  const prepareTypeData = () => {
    const typeData = {};
    
    // Cash types
    cashRecords.forEach(record => {
      const type = record.type.replace('-', ' ');
      if (!typeData[type]) {
        typeData[type] = { name: type, value: 0, category: 'Cash' };
      }
      typeData[type].value += parseFloat(record.amount) || 0;
    });

    // Card types
    cardRecords.forEach(card => {
      const type = card.type.replace('-', ' ');
      if (!typeData[type]) {
        typeData[type] = { name: type, value: 0, category: 'Cards' };
      }
      typeData[type].value += parseFloat(card.creditLimit) || 0;
    });

    // Bank types
    bankRecords.forEach(account => {
      const type = account.type.replace('-', ' ');
      if (!typeData[type]) {
        typeData[type] = { name: type, value: 0, category: 'Bank' };
      }
      typeData[type].value += parseFloat(account.balance) || 0;
    });

    return Object.values(typeData);
  };

  const chartData = prepareChartData();
  const balanceData = prepareBalanceData();
  const typeData = prepareTypeData();

  // Prepare transaction type data
  const prepareTransactionTypeData = () => {
    const transactionTypeData = {};
    
    // Process all records for transaction types
    const allRecords = [...filteredCashRecords, ...filteredCardRecords, ...filteredBankRecords, ...filteredCardTransactions, ...filteredBankTransactions];
    
    allRecords.forEach(record => {
      if (record.transactionType) {
        const type = record.transactionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (!transactionTypeData[type]) {
          transactionTypeData[type] = { name: type, value: 0 };
        }
        const amount = parseFloat(record.amount) || 0;
        transactionTypeData[type].value += amount;
      }
    });

    return Object.values(transactionTypeData).filter(item => item.value > 0);
  };

  // Prepare expense type data
  const prepareExpenseTypeData = () => {
    const expenseTypeData = {};
    
    // Process all records for expense types
    const allRecords = [...filteredCashRecords, ...filteredCardRecords, ...filteredBankRecords, ...filteredCardTransactions, ...filteredBankTransactions];
    
    allRecords.forEach(record => {
      if (record.expenseType) {
        const type = record.expenseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (!expenseTypeData[type]) {
          expenseTypeData[type] = { name: type, value: 0 };
        }
        const amount = parseFloat(record.amount) || 0;
        expenseTypeData[type].value += amount;
      }
    });

    return Object.values(expenseTypeData).filter(item => item.value > 0);
  };

  // Debug logs
  console.log('Chart Data:', chartData);

  // Custom formatter for Y-axis to show abbreviated numbers
  const formatYAxis = (value) => {
    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Colors for charts
  const COLORS = ['#28a745', '#007bff', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#ffc107', '#17a2b8'];
  const CATEGORY_COLORS = {
    cash: '#28a745',
    cards: '#007bff', 
    bank: '#6f42c1'
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom pie tooltip
  const CustomBalanceTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.currency}</p>
          <p className="tooltip-detail">Bank Balance: {data.bankBalance.toLocaleString()}</p>
          <p className="tooltip-detail">Card Limits: {data.cardLimits.toLocaleString()}</p>
          <p className="tooltip-value">Total: {data.total.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  const totalValue = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="financial-overview-chart">
      {/* Month Selector */}
      <div className="month-selector" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>Select Month:</h3>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#fff'
              }}
            >
              <option value="current">Current Month ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</option>
              {allMonthsInYear.map(month => (
                <option key={month.key} value={month.key}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button 
              className={`month-btn ${selectedMonth === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedMonth('all')}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: selectedMonth === 'all' ? '#007bff' : '#fff',
                color: selectedMonth === 'all' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              All Time
            </button>
          </div>
        </div>
      </div>
      
      <div className="chart-header">
        <h2>Financial Overview</h2>
        <div className="summary-cards">
          <div className="summary-card cash">
            <h3>Cash</h3>
            <p>{chartData.reduce((sum, item) => sum + item.cash, 0).toLocaleString()}</p>
          </div>
          <div className="summary-card cards">
            <h3>Card Spending</h3>
            <p>{chartData.reduce((sum, item) => sum + item.cards, 0).toLocaleString()}</p>
          </div>
          <div className="summary-card bank">
            <h3>Bank Transactions</h3>
            <p>{chartData.reduce((sum, item) => sum + item.bank, 0).toLocaleString()}</p>
          </div>
          <div className="summary-card bank-balance" style={{ backgroundColor: '#fff5f5', borderLeft: '4px solid #ff6b6b' }}>
            <h3>Net Bank Balance</h3>
            <p>{chartData.reduce((sum, item) => sum + item.bankBalance, 0).toLocaleString()}</p>
          </div>
          <div className="summary-card net-total" style={{ backgroundColor: '#f0f8ff', borderLeft: '4px solid #007bff' }}>
            <h3>Net Total Spending</h3>
            <p>{totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Combined Bar Chart */}
        <div className="chart-container">
          <h3>Assets by Currency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="currency" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="cash" fill={CATEGORY_COLORS.cash} name="Cash" />
              <Bar dataKey="cards" fill={CATEGORY_COLORS.cards} name="Card Spending" />
              <Bar dataKey="bank" fill={CATEGORY_COLORS.bank} name="Bank Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Balance & Limits Chart */}
        <div className="chart-container">
          <h3>Bank Balance & Card Limits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={balanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="currency" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip content={<CustomBalanceTooltip />} />
              <Legend />
              <Bar dataKey="bankBalance" fill="#ff6b6b" name="Bank Balance" />
              <Bar dataKey="cardLimits" fill="#007bff" name="Available Card Limits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transaction Type Chart */}
        <div className="chart-container">
          <h3>Transaction Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareTransactionTypeData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareTransactionTypeData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Type Chart */}
        <div className="chart-container">
          <h3>Expense Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareExpenseTypeData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {prepareExpenseTypeData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

              </div>
    </div>
  );
};

export default FinancialOverviewChart;
