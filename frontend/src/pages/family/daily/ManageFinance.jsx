import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import './ManageFinance.css';

const ManageFinance = () => {
  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [cards, setCards] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [scheduledExpenses, setScheduledExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [bankFilter, setBankFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth());
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly',
    bankAccount: '',
    category: 'bill',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [banksRes, cardsRes, bankTransactionsRes, expensesRes] = await Promise.all([
        api.get('/bank'),
        api.get('/cards'),
        api.get('/bank-transactions'),
        api.get('/scheduled-expenses')
      ]);
      
      setBanks(banksRes.data || []);
      setCards(cardsRes.data || []);
      setBankTransactions(bankTransactionsRes.data || []);
      setScheduledExpenses(expensesRes.data || []);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    }
    setLoading(false);
  };

  // Get filtered month's scheduled expenses
  const getCurrentMonthExpenses = () => {
    const currentDate = new Date();
    const selectedMonth = monthFilter;
    const selectedYear = yearFilter;
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    let filteredExpenses = scheduledExpenses.filter(expense => expense.isActive);
    
    // Apply bank filter
    if (bankFilter !== 'all') {
      filteredExpenses = filteredExpenses.filter(expense => expense.bankAccount === bankFilter);
    }
    
    return filteredExpenses
      .map(expense => {
        const dueDate = new Date(expense.dueDate);
        const expenseDate = new Date(selectedYear, selectedMonth, dueDate.getDate());
        
        return {
          ...expense,
          actualDueDate: expenseDate,
          daysUntilDue: Math.ceil((expenseDate - currentDate) / (1000 * 60 * 60 * 24)),
          isOverdue: expenseDate < currentDate,
          isDueToday: expenseDate.toDateString() === currentDate.toDateString(),
          isDueSoon: Math.ceil((expenseDate - currentDate) / (1000 * 60 * 60 * 24)) <= 7 && expenseDate >= currentDate
        };
      })
      .sort((a, b) => a.actualDueDate - b.actualDueDate);
  };

  // Function to calculate actual balance including transactions (same as CashCardsBank)
  const calculateAccountBalance = (account) => {
    let balance = parseFloat(account.balance || 0);
    
    // Get all transactions for this account
    const accountTransactions = bankTransactions.filter(transaction => {
      // Handle both string and object accountId
      const transactionAccountId = typeof transaction.accountId === 'object' 
        ? transaction.accountId._id || transaction.accountId
        : transaction.accountId;
      
      return transactionAccountId === account._id;
    });
    
    // Calculate net transaction amount
    const netTransactionAmount = accountTransactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount || 0);
      if (transaction.type === 'deposit') {
        return total + amount;
      } else if (transaction.type === 'withdrawal' || transaction.type === 'payment' || transaction.type === 'transfer') {
        return total - amount;
      } else {
        return total; // For other types like fee, interest, etc.
      }
    }, 0);
    
    const finalBalance = balance + netTransactionAmount;
    return finalBalance;
  };

  // Calculate total balance across all banks (using real-time balances)
  const getTotalBalance = () => {
    return banks.reduce((total, bank) => total + calculateAccountBalance(bank), 0);
  };

  // Calculate total upcoming expenses
  const getTotalUpcomingExpenses = () => {
    return getCurrentMonthExpenses()
      .filter(exp => !exp.isOverdue)
      .reduce((total, exp) => total + (exp.amount || 0), 0);
  };

  // Get bank by account number
  const getBankByAccount = (accountNumber) => {
    return banks.find(bank => bank.accountNumber === accountNumber) || {};
  };

  // Handle expense form
  const resetExpenseForm = () => {
    setExpenseForm({
      title: '',
      amount: '',
      dueDate: '',
      frequency: 'monthly',
      bankAccount: '',
      category: 'bill',
      description: '',
      isActive: true
    });
    setEditingExpense(null);
  };

  const handleExpenseSave = async () => {
    try {
      if (editingExpense) {
        await api.put(`/scheduled-expenses/${editingExpense._id}`, expenseForm);
      } else {
        await api.post('/scheduled-expenses', expenseForm);
      }
      fetchData();
      setShowExpenseForm(false);
      resetExpenseForm();
    } catch (error) {
      console.error('Error saving scheduled expense:', error);
      alert('Error saving scheduled expense');
    }
  };

  const handleExpenseEdit = (expense) => {
    setExpenseForm(expense);
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleExpenseDelete = async (id) => {
    if (confirm('Are you sure you want to delete this scheduled expense?')) {
      try {
        await api.delete(`/scheduled-expenses/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting scheduled expense:', error);
        alert('Error deleting scheduled expense');
      }
    }
  };

  const toggleExpenseStatus = async (expense) => {
    try {
      await api.put(`/scheduled-expenses/${expense._id}`, {
        ...expense,
        isActive: !expense.isActive
      });
      fetchData();
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading finance data...</div>;
  }

  const currentMonthExpenses = getCurrentMonthExpenses();
  const totalBalance = getTotalBalance();
  const totalUpcomingExpenses = getTotalUpcomingExpenses();
  const remainingBalance = totalBalance - totalUpcomingExpenses;

  return (
    <div className="manage-finance-container">
      <div className="page-header">
        <h1>Manage Finance Dashboard</h1>
        <div className="date-filters">
          <div className="filter-group">
            <label>Month:</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              className="filter-select"
            >
              <option value={0}>January</option>
              <option value={1}>February</option>
              <option value={2}>March</option>
              <option value={3}>April</option>
              <option value={4}>May</option>
              <option value={5}>June</option>
              <option value={6}>July</option>
              <option value={7}>August</option>
              <option value={8}>September</option>
              <option value={9}>October</option>
              <option value={10}>November</option>
              <option value={11}>December</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              className="filter-select"
            >
              {Array.from({length: 5}, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="finance-summary">
        <div className="summary-card total-balance">
          <h3>Total Balance</h3>
          <div className="amount">₹{totalBalance.toLocaleString('en-IN')}</div>
          <small>Across {banks.length} banks</small>
        </div>
        <div className="summary-card upcoming-expenses">
          <h3>Upcoming Expenses</h3>
          <div className="amount">₹{totalUpcomingExpenses.toLocaleString('en-IN')}</div>
          <small>This month</small>
        </div>
        <div className="summary-card remaining-balance">
          <h3>Remaining Balance</h3>
          <div className={`amount ${remainingBalance < 0 ? 'negative' : ''}`}>
            ₹{remainingBalance.toLocaleString('en-IN')}
          </div>
          <small>After expenses</small>
        </div>
      </div>

      <div className="finance-content">
        {/* Bank Balances Section */}
        <div className="section bank-balances">
          <div className="section-header">
            <h2>Bank Account Balances</h2>
          </div>
          
          {/* Bank Filter */}
          <div className="bank-filter-container">
            <div className="filter-group">
              <label>Filter by Bank Account:</label>
              <select
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Banks</option>
                {banks.map(bank => (
                  <option key={bank._id} value={bank.accountNumber}>
                    {bank.accountHolderName} - {bank.bankName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="bank-grid">
            {banks.length === 0 ? (
              <div className="no-data">
                No bank accounts found. Add banks in Cash, Cards & Bank section.
              </div>
            ) : (
              banks
                .filter(bank => bankFilter === 'all' || bank.accountNumber === bankFilter)
                .map((bank) => (
                <div key={bank._id} className="bank-card">
                  <div className="bank-header">
                    <h4>{bank.accountHolderName}</h4>
                    <span className="bank-name">{bank.bankName}</span>
                  </div>
                  <div className="bank-details">
                    <div className="account-info">
                      <span>A/C: ****{bank.accountNumber?.slice(-4)}</span>
                      <span className="account-type">{bank.accountType}</span>
                    </div>
                    <div className="balance">
                      ₹{calculateAccountBalance(bank).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="bank-expenses">
                    <div className="expenses-header">
                      <span>Upcoming Expenses</span>
                    </div>
                    {currentMonthExpenses
                      .filter(exp => exp.bankAccount === bank.accountNumber)
                      .length === 0 ? (
                      <div className="no-expenses">
                        No scheduled expenses
                      </div>
                    ) : (
                      currentMonthExpenses
                        .filter(exp => exp.bankAccount === bank.accountNumber)
                        .slice(0, 4)
                        .map(exp => (
                          <div key={exp._id} className={`mini-expense ${
                            exp.isOverdue ? 'overdue' : 
                            exp.isDueToday ? 'due-today' : 
                            exp.isDueSoon ? 'due-soon' : ''
                          }`}>
                            <div className="expense-info">
                              <span className="expense-title">{exp.title}</span>
                              <span className="expense-date">
                                {exp.actualDueDate.toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <div className="expense-amount">
                              ₹{exp.amount?.toLocaleString('en-IN')}
                            </div>
                            {(exp.isOverdue || exp.isDueToday || exp.isDueSoon) && (
                              <div className="status-indicator">
                                {exp.isOverdue && <span className="status overdue">!</span>}
                                {exp.isDueToday && <span className="status today">•</span>}
                                {exp.isDueSoon && <span className="status soon">⚠</span>}
                              </div>
                            )}
                          </div>
                        ))
                    )}
                    {currentMonthExpenses.filter(exp => exp.bankAccount === bank.accountNumber).length > 4 && (
                      <div className="more-expenses">
                        +{currentMonthExpenses.filter(exp => exp.bankAccount === bank.accountNumber).length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scheduled Expenses Section */}
        <div className="section scheduled-expenses">
          <div className="section-header">
            <h2>Scheduled Expenses & EMIs</h2>
            <button
              className="add-btn"
              onClick={() => {
                resetExpenseForm();
                setShowExpenseForm(true);
              }}
            >
              Add Expense
            </button>
          </div>

          {/* Quick Stats */}
          <div className="expense-stats">
            <div className="stat">
              <span>Overdue</span>
              <span className="count overdue">
                {currentMonthExpenses.filter(exp => exp.isOverdue).length}
              </span>
            </div>
            <div className="stat">
              <span>Due Today</span>
              <span className="count today">
                {currentMonthExpenses.filter(exp => exp.isDueToday).length}
              </span>
            </div>
            <div className="stat">
              <span>Due Soon</span>
              <span className="count soon">
                {currentMonthExpenses.filter(exp => exp.isDueSoon).length}
              </span>
            </div>
          </div>

          {/* Expenses List */}
          <div className="expenses-list">
            {currentMonthExpenses.length === 0 ? (
              <div className="no-data">No scheduled expenses found</div>
            ) : (
              currentMonthExpenses.map((expense) => {
                const bank = getBankByAccount(expense.bankAccount);
                return (
                  <div
                    key={expense._id}
                    className={`expense-item ${
                      expense.isOverdue ? 'overdue' : 
                      expense.isDueToday ? 'due-today' : 
                      expense.isDueSoon ? 'due-soon' : ''
                    } ${!expense.isActive ? 'inactive' : ''}`}
                  >
                    <div className="expense-main">
                      <div className="expense-info">
                        <h4>{expense.title}</h4>
                        <p>{expense.description}</p>
                        <div className="expense-meta">
                          <span className="category">{expense.category}</span>
                          <span className="frequency">{expense.frequency}</span>
                        </div>
                      </div>
                      <div className="expense-details">
                        <div className="amount">₹{expense.amount?.toLocaleString('en-IN')}</div>
                        <div className="due-date">
                          {expense.actualDueDate.toLocaleDateString('en-IN')}
                        </div>
                        <div className="bank-info">
                          {bank.accountHolderName} - {bank.bankName}
                        </div>
                      </div>
                      <div className="expense-status">
                        {expense.isOverdue && (
                          <span className="status-badge overdue">Overdue</span>
                        )}
                        {expense.isDueToday && (
                          <span className="status-badge today">Due Today</span>
                        )}
                        {expense.isDueSoon && (
                          <span className="status-badge soon">Due Soon</span>
                        )}
                        <div className="days-info">
                          {expense.isOverdue ? 
                            `${Math.abs(expense.daysUntilDue)} days overdue` :
                            expense.isDueToday ?
                            'Due today' :
                            `${expense.daysUntilDue} days left`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="expense-actions">
                      <button
                        onClick={() => toggleExpenseStatus(expense)}
                        className={`toggle-btn ${expense.isActive ? 'active' : 'inactive'}`}
                      >
                        {expense.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => handleExpenseEdit(expense)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleExpenseDelete(expense._id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showExpenseForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingExpense ? 'Edit' : 'Add'} Scheduled Expense</h3>
              <button onClick={() => setShowExpenseForm(false)} className="close-btn">×</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                  placeholder="e.g., Credit Card Bill, Home Rent"
                />
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({...expenseForm, amount: parseFloat(e.target.value) || 0})}
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={expenseForm.dueDate}
                  onChange={(e) => setExpenseForm({...expenseForm, dueDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={expenseForm.frequency}
                  onChange={(e) => setExpenseForm({...expenseForm, frequency: e.target.value})}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One Time</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bank Account</label>
                <select
                  value={expenseForm.bankAccount}
                  onChange={(e) => setExpenseForm({...expenseForm, bankAccount: e.target.value})}
                >
                  <option value="">Select Bank Account</option>
                  {banks.map(bank => (
                    <option key={bank._id} value={bank.accountNumber}>
                      {bank.accountHolderName} - {bank.bankName} (****{bank.accountNumber?.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                >
                  <option value="bill">Bill Payment</option>
                  <option value="emi">EMI</option>
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="insurance">Insurance</option>
                  <option value="loan">Loan Payment</option>
                  <option value="credit-card">Credit Card</option>
                  <option value="subscription">Subscription</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                  rows="3"
                  placeholder="Additional details about this expense"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleExpenseSave} className="save-btn">Save</button>
              <button onClick={() => setShowExpenseForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFinance;