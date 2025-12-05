import React, { useState, useEffect } from 'react';
import { incomeExpenseAPI } from '../../../utils/incomeExpenseAPI';
import api from '../../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiDownload, FiTrendingUp, FiTrendingDown, FiCalendar, FiDollarSign, FiTag, FiRepeat } from 'react-icons/fi';
import './IncomeExpenses.css';

const IncomeExpenses = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  
  // Paid From connectivity states
  const [paidFrom, setPaidFrom] = useState('none'); // none | cash | card | bank
  const [cashLink, setCashLink] = useState({
    type: 'physical-cash',
    location: '',
    walletProvider: '',
    date: new Date().toISOString().slice(0, 10),
    currency: 'INR',
  });
  const [cards, setCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [cardLink, setCardLink] = useState({ cardId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });
  const [bankLink, setBankLink] = useState({ accountId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    count: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    subcategory: '',
    title: '',
    description: '',
    amount: '',
    currency: 'INR',
    date: new Date().toISOString().split('T')[0],
    source: '',
    account: '',
    tags: '',
    isRecurring: false,
    recurringFrequency: '',
    recurringEndDate: '',
    receipt: '',
    attachments: '',
    status: 'confirmed',
    taxDeductible: false,
    taxCategory: '',
    budgetCategory: '',
    notes: '',
    // Add connectivity fields to form data
    paidFrom: 'none',
    cashLink: {
      type: 'physical-cash',
      location: '',
      walletProvider: '',
      date: new Date().toISOString().slice(0, 10),
      currency: 'INR',
    },
    cardLink: { cardId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' },
    bankLink: { accountId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' }
  });

  const categories = {
    income: ['salary', 'business', 'investment', 'rental', 'freelance', 'gift', 'refund', 'other-income'],
    expense: ['food', 'transport', 'shopping', 'entertainment', 'utilities', 'healthcare', 'education', 'rent', 'insurance', 'loan-payment', 'tax', 'other-expense']
  };

  const paymentMethods = ['cash', 'card', 'bank-transfer', 'upi', 'wallet', 'other'];
  const recurringFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];

  // Sync paidFrom with formData.paidFrom
  useEffect(() => {
    setPaidFrom(formData.paidFrom);
    if (formData.cashLink) setCashLink(formData.cashLink);
    if (formData.cardLink) setCardLink(formData.cardLink);
    if (formData.bankLink) setBankLink(formData.bankLink);
  }, [formData.paidFrom, formData.cashLink, formData.cardLink, formData.bankLink]);

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, [filters]);

  useEffect(() => {
    // Fetch cards and bank accounts for connectivity
    const fetchConnectivityData = async () => {
      try {
        console.log('Fetching connectivity data...');
        const [cardsResponse, bankResponse] = await Promise.all([
          api.get('/cards'),
          api.get('/bank')
        ]);
        console.log('Cards response:', cardsResponse.data);
        console.log('Bank response:', bankResponse.data);
        console.log('Bank response length:', bankResponse.data?.length);
        
        setCards(cardsResponse.data || []);
        setBankAccounts(bankResponse.data || []);
        
        // Check if bank data is actually being set
        if (bankResponse.data && bankResponse.data.length > 0) {
          console.log('Bank accounts loaded:', bankResponse.data);
        } else {
          console.log('No bank accounts found or empty response');
        }
      } catch (error) {
        console.error('Error fetching connectivity data:', error);
      }
    };
    
    fetchConnectivityData();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await incomeExpenseAPI.getRecords(filters);
      setRecords(response.data.records);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      console.log('Fetching summary with filters:', filters);
      const response = await incomeExpenseAPI.getSummary({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      console.log('Summary response:', response.data);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      // Set summary to null to trigger fallback calculation
      setSummary(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        amount: parseFloat(formData.amount),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        attachments: formData.attachments ? formData.attachments.split(',').map(att => att.trim()) : [],
        date: new Date(formData.date),
        recurringEndDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
        // Add default paymentMethod for expenses to satisfy backend validation
        paymentMethod: formData.type === 'expense' ? 'other' : undefined,
        // Convert empty strings to undefined for enum fields
        recurringFrequency: formData.recurringFrequency || undefined,
        source: formData.source || undefined,
        taxCategory: formData.taxCategory || undefined,
        receipt: formData.receipt || undefined,
        attachments: formData.attachments ? formData.attachments.split(',').map(att => att.trim()) : [],
        // Only include recurring fields if isRecurring is true
        ...(formData.isRecurring ? {
          recurringFrequency: formData.recurringFrequency || undefined,
          recurringEndDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined
        } : {
          recurringFrequency: undefined,
          recurringEndDate: undefined
        }),
        // Only include tax fields if taxDeductible is true
        ...(formData.taxDeductible ? {
          taxCategory: formData.taxCategory || undefined
        } : {
          taxCategory: undefined
        })
      };

      // Remove empty strings from optional fields
      Object.keys(dataToSubmit).forEach(key => {
        if (dataToSubmit[key] === '') {
          dataToSubmit[key] = undefined;
        }
      });

      // Create income/expense record
      let savedRecord;
      if (editingRecord) {
        savedRecord = await incomeExpenseAPI.updateRecord(editingRecord._id, dataToSubmit);
      } else {
        savedRecord = await incomeExpenseAPI.createRecord(dataToSubmit);
      }

      // Add connectivity logic - create records in cash/cards/bank if paidFrom is selected
      if (paidFrom !== 'none' && formData.status === 'confirmed') {
        const amount = parseFloat(formData.amount) || 0;
        const payDate = formData.date || new Date().toISOString().slice(0, 10);
        
        try {
          if (paidFrom === 'cash') {
            const payload = {
              type: cashLink.type,
              name: `${formData.type === 'income' ? 'Income' : 'Expense'} - ${formData.title}`,
              currency: cashLink.currency || formData.currency || 'INR',
              amount: Math.abs(amount), // Cash model requires positive amount
              date: cashLink.date || payDate,
              location: cashLink.type === 'physical-cash' ? (cashLink.location || 'Wallet') : undefined,
              walletProvider: cashLink.type === 'digital-wallet' ? (cashLink.walletProvider || 'Wallet') : undefined,
              walletType: 'prepaid',
              description: `${formData.category} - ${formData.description || formData.title}`,
              notes: `Auto-linked from Income/Expenses (${formData.type})`,
            };
            await api.post('/cash', payload);
          } else if (paidFrom === 'card' && cardLink.cardId) {
            const payload = {
              cardId: cardLink.cardId,
              type: formData.type === 'income' ? 'credit' : 'payment',
              amount,
              merchant: formData.title,
              category: formData.category,
              description: `${formData.type === 'income' ? 'Income' : 'Expense'} - ${formData.title}`,
              date: cardLink.date || payDate,
              currency: cardLink.currency || formData.currency || 'INR',
            };
            await api.post('/transactions', payload);
          } else if (paidFrom === 'bank' && bankLink.accountId) {
            // Map income/expense categories to bank transaction categories
            const mapToBankCategory = (category) => {
              const bankCategories = ['food', 'shopping', 'transport', 'entertainment', 'utilities', 'healthcare', 'education', 'salary', 'rent', 'other'];
              return bankCategories.includes(category) ? category : 'other';
            };
            
            const payload = {
              accountId: bankLink.accountId,
              type: formData.type === 'income' ? 'deposit' : 'withdrawal',
              amount,
              merchant: formData.title,
              category: mapToBankCategory(formData.category),
              description: `${formData.type === 'income' ? 'Income' : 'Expense'} - ${formData.title}`,
              date: bankLink.date || payDate,
              currency: bankLink.currency || formData.currency || 'INR',
            };
            await api.post('/bank-transactions', payload);
          }
        } catch (connectivityError) {
          console.error('Error creating connectivity record:', connectivityError);
          // Don't fail the main operation if connectivity fails
          // Just log the error and continue
        }
      }

      // Only reset after all operations are complete
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      fetchRecords();
      fetchSummary();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      ...record,
      tags: record.tags ? record.tags.join(', ') : '',
      attachments: record.attachments ? record.attachments.join(', ') : '',
      date: new Date(record.date).toISOString().split('T')[0],
      recurringEndDate: record.recurringEndDate ? new Date(record.recurringEndDate).toISOString().split('T')[0] : '',
      // Ensure connectivity objects exist
      paidFrom: record.paidFrom || 'none',
      cashLink: record.cashLink || {
        type: 'physical-cash',
        location: '',
        walletProvider: '',
        date: new Date().toISOString().slice(0, 10),
        currency: 'INR',
      },
      cardLink: record.cardLink || { cardId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' },
      bankLink: record.bankLink || { accountId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' }
    });
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await incomeExpenseAPI.deleteRecord(id);
        fetchRecords();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      subcategory: '',
      title: '',
      description: '',
      amount: '',
      currency: 'INR',
      date: new Date().toISOString().slice(0, 10),
      source: '',
      account: '',
      tags: '',
      isRecurring: false,
      recurringFrequency: '',
      recurringEndDate: '',
      receipt: '',
      attachments: '',
      status: 'confirmed',
      taxDeductible: false,
      taxCategory: '',
      budgetCategory: '',
      notes: '',
      // Reset connectivity fields
      paidFrom: 'none',
      cashLink: {
        type: 'physical-cash',
        location: '',
        walletProvider: '',
        date: new Date().toISOString().slice(0, 10),
        currency: 'INR',
      },
      cardLink: { cardId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' },
      bankLink: { accountId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' }
    });
    
    // Reset separate states for sync
    setPaidFrom('none');
    setCashLink({
      type: 'physical-cash',
      location: '',
      walletProvider: '',
      date: new Date().toISOString().slice(0, 10),
      currency: 'INR',
    });
    setCardLink({ cardId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });
    setBankLink({ accountId: '', date: new Date().toISOString().slice(0, 10), currency: 'INR' });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openModal = () => {
    resetForm();
    setEditingRecord(null);
    setShowModal(true);
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getSummaryStats = () => {
    // Debug: log the summary data
    console.log('Summary data:', summary);
    
    if (!summary || !summary.summary || summary.summary.length === 0) {
      // Fallback: calculate from records if API doesn't work
      const income = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
      const expense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
      console.log('Fallback calculation - Income:', income, 'Expense:', expense);
      return { income, expense, balance: income - expense };
    }
    
    const income = summary.summary.find(s => s._id === 'income')?.totalAmount || 0;
    const expense = summary.summary.find(s => s._id === 'expense')?.totalAmount || 0;
    console.log('API calculation - Income:', income, 'Expense:', expense);
    
    return { income, expense, balance: income - expense };
  };

  const stats = getSummaryStats();

  return (
    <div className="income-expenses-container">
      <div className="income-expenses-header">
        <h1>Income & Expenses</h1>
        <p>Manage your daily income and expense records</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid">
        <div className="summary-card income-card">
          <div className="summary-card-content">
            <div className="summary-card-info">
              <h3>Total Income</h3>
              <div className="summary-card-amount">{formatCurrency(stats.income)}</div>
            </div>
            <FiTrendingUp className="summary-card-icon" />
          </div>
        </div>
        
        <div className="summary-card expense-card">
          <div className="summary-card-content">
            <div className="summary-card-info">
              <h3>Total Expenses</h3>
              <div className="summary-card-amount">{formatCurrency(stats.expense)}</div>
            </div>
            <FiTrendingDown className="summary-card-icon" />
          </div>
        </div>
        
        <div className={`summary-card balance-card ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-card-content">
            <div className="summary-card-info">
              <h3>Balance</h3>
              <div className="summary-card-amount">{formatCurrency(stats.balance)}</div>
            </div>
            <FiDollarSign className="summary-card-icon" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <FiFilter className="filters-icon" />
          <h3>Filters</h3>
        </div>
        
        <div className="filters-grid">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="form-control"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="form-control"
          >
            <option value="">All Categories</option>
            {categories[filters.type || 'expense']?.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="form-control"
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="form-control"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="actions-bar">
        <button
          onClick={openModal}
          className="btn-primary"
        >
          <FiPlus className="btn-icon" />
          Add Record
        </button>
        
        <div className="records-count">
          Showing {records.length} of {pagination.count} records
        </div>
      </div>

      {/* Records Table */}
      <div className="records-table-container">
        {loading ? (
          <div className="loading-state">
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            No records found
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`type-badge ${record.type}`}>
                        {record.type}
                      </span>
                    </td>
                    <td>{record.category}</td>
                    <td>{record.title}</td>
                    <td className={`amount-${record.type}`}>
                      {formatCurrency(record.amount, record.currency)}
                    </td>
                    <td>
                      {record.tags?.length > 0 && (
                        <div className="tags-container">
                          {record.tags.map((tag, index) => (
                            <span key={index} className="tag-badge">
                              <FiTag className="tag-icon" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        {record.isRecurring && (
                          <FiRepeat className="recurring-icon" title="Recurring" />
                        )}
                        <button
                          onClick={() => handleEdit(record)}
                          className="action-btn edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="action-btn delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => handleFilterChange('page', Math.max(1, pagination.current - 1))}
            disabled={pagination.current === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.current} of {pagination.total}
          </span>
          <button
            onClick={() => handleFilterChange('page', Math.min(pagination.total, pagination.current + 1))}
            disabled={pagination.current === pagination.total}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>
                {editingRecord ? 'Edit Record' : 'Add New Record'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, category: '' }))}
                    className="form-select"
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories[formData.type]?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="form-select"
                  >
                    {currencies.map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                
                {formData.type === 'income' && (
                  <div className="form-group">
                    <label className="form-label required">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Subcategory</label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Account</label>
                  <input
                    type="text"
                    value={formData.account}
                    onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Paid From</label>
                  <select
                    value={formData.paidFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, paidFrom: e.target.value }))}
                    className="form-select"
                  >
                    <option value="none">None</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
                
                {formData.paidFrom === 'cash' && formData.cashLink && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Cash Type</label>
                      <select
                        value={formData.cashLink.type || 'physical-cash'}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cashLink: { ...(prev.cashLink || {}), type: e.target.value }
                        }))}
                        className="form-select"
                      >
                        <option value="physical-cash">Physical Cash</option>
                        <option value="digital-wallet">Digital Wallet</option>
                      </select>
                    </div>
                    {formData.cashLink.type === 'physical-cash' ? (
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          value={formData.cashLink.location || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            cashLink: { ...(prev.cashLink || {}), location: e.target.value }
                          }))}
                          className="form-input"
                          placeholder="e.g., Wallet"
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label className="form-label">Wallet Provider</label>
                        <input
                          type="text"
                          value={formData.cashLink.walletProvider || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            cashLink: { ...(prev.cashLink || {}), walletProvider: e.target.value }
                          }))}
                          className="form-input"
                          placeholder="e.g., Paytm"
                        />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Payment Date</label>
                      <input
                        type="date"
                        value={formData.cashLink.date || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cashLink: { ...(prev.cashLink || {}), date: e.target.value }
                        }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
                
                {formData.paidFrom === 'card' && formData.cardLink && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Select Card</label>
                      <select
                        value={formData.cardLink.cardId || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cardLink: { ...(prev.cardLink || {}), cardId: e.target.value }
                        }))}
                        className="form-select"
                      >
                        <option value="">Choose card...</option>
                        {cards.length > 0 ? (
                          cards.map(c => (
                            <option key={c._id} value={c._id}>{c.name} - {c.issuer}</option>
                          ))
                        ) : (
                          <option value="" disabled>No cards available</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Date</label>
                      <input
                        type="date"
                        value={formData.cardLink.date || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          cardLink: { ...(prev.cardLink || {}), date: e.target.value }
                        }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
                
                {formData.paidFrom === 'bank' && formData.bankLink && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Select Bank Account</label>
                      <select
                        value={formData.bankLink.accountId || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          bankLink: { ...(prev.bankLink || {}), accountId: e.target.value }
                        }))}
                        className="form-select"
                      >
                        <option value="">Choose account...</option>
                        {bankAccounts.map(b => (
                          <option key={b._id} value={b._id}>{b.name} - {b.bankName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Date</label>
                      <input
                        type="date"
                        value={formData.bankLink.date || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          bankLink: { ...(prev.bankLink || {}), date: e.target.value }
                        }))}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="form-input"
                    placeholder="e.g., personal, business, urgent"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="form-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-textarea"
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="form-checkbox-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="form-checkbox"
                  />
                  Recurring
                </label>
                
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.taxDeductible}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxDeductible: e.target.checked }))}
                    className="form-checkbox"
                  />
                  Tax Deductible
                </label>
              </div>
              
              {formData.isRecurring && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Frequency</label>
                    <select
                      value={formData.recurringFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value }))}
                      className="form-select"
                      required
                    >
                      <option value="">Select Frequency</option>
                      {recurringFrequencies.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={formData.recurringEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
              )}
              
              {formData.taxDeductible && (
                <div className="form-group">
                  <label className="form-label required">Tax Category</label>
                  <input
                    type="text"
                    value={formData.taxCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxCategory: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
              )}
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Receipt URL</label>
                  <input
                    type="url"
                    value={formData.receipt}
                    onChange={(e) => setFormData(prev => ({ ...prev, receipt: e.target.value }))}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Budget Category</label>
                  <input
                    type="text"
                    value={formData.budgetCategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetCategory: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Attachment URLs (comma-separated)</label>
                <input
                  type="text"
                  value={formData.attachments}
                  onChange={(e) => setFormData(prev => ({ ...prev, attachments: e.target.value }))}
                  className="form-input"
                  placeholder="e.g., url1, url2, url3"
                />
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                >
                  {editingRecord ? 'Update' : 'Create'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenses;