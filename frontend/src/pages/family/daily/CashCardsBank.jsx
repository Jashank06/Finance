import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../utils/api';
import FinancialOverviewChart from '../../../components/FinancialOverviewChart';
import './CashCardsBank.css';

const CashCardsBank = () => {
  const [activeTab, setActiveTab] = useState('cash');
  const [cashRecords, setCashRecords] = useState([]);
  const [cardRecords, setCardRecords] = useState([]);
  const [bankRecords, setBankRecords] = useState([]);
  const [showCashForm, setShowCashForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [cardTransactions, setCardTransactions] = useState([]);
  const [bankTransactionForm, setBankTransactionForm] = useState({
    accountId: '',
    type: 'withdrawal',
    amount: '',
    merchant: '',
    category: 'other',
    description: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'INR',
    transactionType: '',
    expenseType: ''
  });
  const [showBankTransactionForm, setShowBankTransactionForm] = useState(false);
  const [editingBankTransaction, setEditingBankTransaction] = useState(null);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(true);
  const [selectedBankFilter, setSelectedBankFilter] = useState('all');
  const [selectedCardFilter, setSelectedCardFilter] = useState('all');

  // Form states
  const [cashForm, setCashForm] = useState({
    type: 'cash',
    amount: '',
    currency: 'INR',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    location: '',
    transactionType: '',
    expenseType: '',
    walletProvider: '',
    walletNumber: '',
    walletType: 'prepaid',
    cryptoType: '',
    exchange: '',
    walletAddress: '',
    notes: ''
  });

  const [cardForm, setCardForm] = useState({
    type: 'credit-card',
    name: '',
    issuer: '',
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    creditLimit: '',
    availableCredit: '',
    interestRate: '',
    minimumPayment: '',
    billingCycle: 'monthly',
    dueDate: '',
    linkedAccount: '',
    bankName: '',
    currency: 'INR',
    isInternational: false,
    contactless: false,
    transactionType: '',
    expenseType: '',
    description: '',
    notes: ''
  });

  const [bankForm, setBankForm] = useState({
    type: 'savings',
    name: '',
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    currency: 'INR',
    balance: '0',
    depositAmount: '',
    interestRate: '',
    tenure: '',
    maturityDate: '',
    autoRenewal: false,
    jointHolders: [],
    ifscCode: '',
    micrCode: '',
    branchName: '',
    branchAddress: '',
    city: '',
    state: '',
    pincode: '',
    netBankingEnabled: false,
    mobileBankingEnabled: false,
    upiEnabled: false,
    upiId: '',
    nomineeName: '',
    nomineeRelationship: '',
    nomineeAge: '',
    nomineeContact: '',
    transactionType: '',
    expenseType: '',
    description: '',
    notes: ''
  });

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    cardId: '',
    type: 'purchase',
    amount: '',
    merchant: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'INR',
    transactionType: '',
    expenseType: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cashRes, cardRes, bankRes, transactionRes, bankTransactionRes] = await Promise.all([
        api.get('/cash'),
        api.get('/cards'),
        api.get('/bank'),
        api.get('/transactions'),
        api.get('/bank-transactions')
      ]);
      
      setCashRecords(cashRes.data);
      setCardRecords(cardRes.data);
      setBankRecords(bankRes.data);
      setCardTransactions(transactionRes.data);
      setBankTransactions(bankTransactionRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const resetCashForm = () => {
    setCashForm({
      type: 'physical-cash',
      name: '',
      currency: 'INR',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      walletProvider: '',
      walletNumber: '',
      walletType: 'prepaid',
      cryptoType: '',
      exchange: '',
      walletAddress: '',
      transactionType: '',
      expenseType: '',
      description: '',
      notes: ''
    });
  };

  const resetCardForm = () => {
    setCardForm({
      type: 'credit-card',
      name: '',
      issuer: '',
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
      creditLimit: '',
      availableCredit: '',
      interestRate: '',
      minimumPayment: '',
      billingCycle: 'monthly',
      dueDate: '',
      linkedAccount: '',
      bankName: '',
      currency: 'INR',
      isInternational: false,
      contactless: false,
      transactionType: '',
      expenseType: '',
      description: '',
      notes: ''
    });
  };

  const resetBankForm = () => {
    setBankForm({
      type: 'savings',
      name: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      currency: 'INR',
      balance: '0',
      depositAmount: '',
      interestRate: '',
      tenure: '',
      maturityDate: '',
      autoRenewal: false,
      jointHolders: [],
      ifscCode: '',
      micrCode: '',
      branchName: '',
      branchAddress: '',
      city: '',
      state: '',
      pincode: '',
      netBankingEnabled: false,
      mobileBankingEnabled: false,
      upiEnabled: false,
      upiId: '',
      nomineeName: '',
      nomineeRelationship: '',
      nomineeAge: '',
      nomineeContact: '',
      transactionType: '',
      expenseType: '',
      description: '',
      notes: ''
    });
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      cardId: '',
      type: 'purchase',
      amount: '',
      merchant: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'INR',
      transactionType: '',
      expenseType: ''
    });
  };

  const resetBankTransactionForm = () => {
    setBankTransactionForm({
      accountId: '',
      type: 'withdrawal',
      amount: '',
      merchant: '',
      category: 'other',
      description: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'INR',
      transactionType: '',
      expenseType: ''
    });
  };

  const handleCashSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/cash/${editingItem._id}`, cashForm);
      } else {
        await api.post('/cash', cashForm);
      }
      resetCashForm();
      setShowCashForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving cash record:', error);
      alert('Error saving cash record');
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/cards/${editingItem._id}`, cardForm);
      } else {
        await api.post('/cards', cardForm);
      }
      resetCardForm();
      setShowCardForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Error saving card');
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/bank/${editingItem._id}`, bankForm);
      } else {
        await api.post('/bank', bankForm);
      }
      resetBankForm();
      setShowBankForm(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving bank account:', error);
      alert('Error saving bank account');
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      
      if (editingTransaction) {
        // Update existing transaction
        response = await api.put(`/transactions/${editingTransaction._id}`, transactionForm);
        
        // Update local state
        setCardTransactions(cardTransactions.map(t => 
          t._id === editingTransaction._id ? response.data : t
        ));
      } else {
        // Create new transaction
        response = await api.post('/transactions', transactionForm);
        
        // Add to local state for immediate display
        const newTransaction = response.data;
        setCardTransactions([...cardTransactions, newTransaction]);
      }
      
      resetTransactionForm();
      setShowTransactionForm(false);
      setEditingTransaction(null);
      
      // Refresh data to update chart
      fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error saving transaction');
    }
  };

  const handleBankTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      
      if (editingBankTransaction) {
        // Update existing bank transaction
        response = await api.put(`/bank-transactions/${editingBankTransaction._id}`, bankTransactionForm);
        
        // Update local state
        setBankTransactions(bankTransactions.map(t => 
          t._id === editingBankTransaction._id ? response.data : t
        ));
      } else {
        // Create new bank transaction
        response = await api.post('/bank-transactions', bankTransactionForm);
        
        // Add to local state for immediate display
        const newTransaction = response.data;
        setBankTransactions([...bankTransactions, newTransaction]);
      }
      
      resetBankTransactionForm();
      setShowBankTransactionForm(false);
      setEditingBankTransaction(null);
      
      // Refresh data to update chart
      fetchData();
    } catch (error) {
      console.error('Error saving bank transaction:', error);
      alert('Error saving bank transaction');
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    if (type === 'cash') {
      // Handle date field for existing records (use createdAt if date doesn't exist)
      const cashData = {
        ...item,
        date: item.date ? item.date.split('T')[0] : new Date(item.createdAt).toISOString().split('T')[0]
      };
      setCashForm(cashData);
      setShowCashForm(true);
      setActiveTab('cash');
    } else if (type === 'card') {
      console.log('Editing card:', item);
      setCardForm(item);
      setShowCardForm(true);
      setActiveTab('cards');
      console.log('showCardForm set to true, current value:', showCardForm);
    } else if (type === 'bank') {
      setBankForm(item);
      setShowBankForm(true);
      setActiveTab('bank');
    } else if (type === 'transaction') {
      setTransactionForm({
        cardId: item.cardId._id || item.cardId,
        type: item.type,
        amount: item.amount,
        merchant: item.merchant,
        category: item.category,
        description: item.description,
        date: new Date(item.date).toISOString().split('T')[0],
        currency: item.currency
      });
      setEditingTransaction(item);
      setShowTransactionForm(true);
      setActiveTab('cards');
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/${type}/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const handleTransactionEdit = (transaction) => {
    handleEdit(transaction, 'transaction');
  };

  const handleTransactionDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${transactionId}`);
        
        // Update local state immediately
        setCardTransactions(cardTransactions.filter(t => t._id !== transactionId));
        
        // Refresh data to update chart
        fetchData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction');
      }
    }
  };

  const handleBankTransactionEdit = (transaction) => {
    setBankTransactionForm({
      accountId: transaction.accountId._id || transaction.accountId,
      type: transaction.type,
      amount: transaction.amount,
      merchant: transaction.merchant,
      category: transaction.category,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0],
      currency: transaction.currency,
      transactionType: transaction.transactionType || '',
      expenseType: transaction.expenseType || ''
    });
    setEditingBankTransaction(transaction);
    setShowBankTransactionForm(true);
    setActiveTab('bank');
  };

  const handleBankTransactionDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this bank transaction?')) {
      try {
        await api.delete(`/bank-transactions/${transactionId}`);
        
        // Update local state immediately
        setBankTransactions(bankTransactions.filter(t => t._id !== transactionId));
        
        // Refresh data to update chart
        fetchData();
      } catch (error) {
        console.error('Error deleting bank transaction:', error);
        alert('Error deleting bank transaction');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Function to calculate actual balance including transactions
  const calculateAccountBalance = (account) => {
    let balance = parseFloat(account.balance || 0);
    
    // Debug: Log account and transactions
    console.log('Account:', account);
    console.log('All bank transactions:', bankTransactions);
    
    // Get all transactions for this account
    const accountTransactions = bankTransactions.filter(transaction => {
      // Handle both string and object accountId
      const transactionAccountId = typeof transaction.accountId === 'object' 
        ? transaction.accountId._id || transaction.accountId
        : transaction.accountId;
      
      console.log('Comparing:', transactionAccountId, 'with', account._id);
      return transactionAccountId === account._id;
    });
    
    console.log('Account transactions:', accountTransactions);
    
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
    console.log('Original balance:', balance, 'Net transactions:', netTransactionAmount, 'Final balance:', finalBalance);
    
    return finalBalance;
  };

  return (
    <div className="cash-cards-bank">
      <h1>Cash, Cards & Bank Transactions</h1>
      
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'cash' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash')}
        >
          Cash ({cashRecords.length})
        </button>
        <button 
          className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Cards ({cardRecords.length})
        </button>
        <button 
          className={`tab ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          Bank ({bankRecords.length})
        </button>
        <button 
          className={`tab chart-toggle ${showChart ? 'active' : ''}`}
          onClick={() => setShowChart(!showChart)}
        >
          {showChart ? 'Hide Chart' : 'Show Chart'}
        </button>
      </div>

      {/* Cash Section */}
      {activeTab === 'cash' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Cash Records</h2>
            <button 
              className="add-btn"
              onClick={() => {
                resetCashForm();
                setEditingItem(null);
                setShowCashForm(true);
              }}
            >
              Add Cash Record
            </button>
          </div>

          {showCashForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editingItem ? 'Edit' : 'Add'} Cash Record</h3>
                <form onSubmit={handleCashSubmit} autoComplete="off">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Type:</label>
                      <select 
                        value={cashForm.type} 
                        onChange={(e) => setCashForm({...cashForm, type: e.target.value})}
                      >
                        <option value="physical-cash">Physical Cash</option>
                        <option value="digital-wallet">Digital Wallet</option>
                        <option value="cryptocurrency">Cryptocurrency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Name:</label>
                      <input 
                        type="text" 
                        value={cashForm.name}
                        onChange={(e) => setCashForm({...cashForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency:</label>
                      <select 
                        value={cashForm.currency} 
                        onChange={(e) => setCashForm({...cashForm, currency: e.target.value})}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount:</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={cashForm.amount}
                        onChange={(e) => setCashForm({...cashForm, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Date:</label>
                      <input 
                        type="date" 
                        value={cashForm.date}
                        onChange={(e) => setCashForm({...cashForm, date: e.target.value})}
                        required
                      />
                    </div>
                    
                    {cashForm.type === 'physical-cash' && (
                      <div className="form-group">
                        <label>Location:</label>
                        <input 
                          type="text" 
                          value={cashForm.location}
                          onChange={(e) => setCashForm({...cashForm, location: e.target.value})}
                          required
                        />
                      </div>
                    )}
                    
                    {cashForm.type === 'digital-wallet' && (
                      <>
                        <div className="form-group">
                          <label>Wallet Provider:</label>
                          <input 
                            type="text" 
                            value={cashForm.walletProvider}
                            onChange={(e) => setCashForm({...cashForm, walletProvider: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Wallet Number:</label>
                          <input 
                            type="text" 
                            value={cashForm.walletNumber}
                            onChange={(e) => setCashForm({...cashForm, walletNumber: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Wallet Type:</label>
                          <select 
                            value={cashForm.walletType} 
                            onChange={(e) => setCashForm({...cashForm, walletType: e.target.value})}
                          >
                            <option value="prepaid">Prepaid</option>
                            <option value="postpaid">Postpaid</option>
                            <option value="gift-card">Gift Card</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    {cashForm.type === 'cryptocurrency' && (
                      <>
                        <div className="form-group">
                          <label>Crypto Type:</label>
                          <input 
                            type="text" 
                            value={cashForm.cryptoType}
                            onChange={(e) => setCashForm({...cashForm, cryptoType: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Exchange:</label>
                          <input 
                            type="text" 
                            value={cashForm.exchange}
                            onChange={(e) => setCashForm({...cashForm, exchange: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Wallet Address:</label>
                          <input 
                            type="text" 
                            value={cashForm.walletAddress}
                            onChange={(e) => setCashForm({...cashForm, walletAddress: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="form-group">
                      <label>Type of Transaction:</label>
                      <select 
                        value={cashForm.transactionType} 
                        onChange={(e) => setCashForm({...cashForm, transactionType: e.target.value})}
                      >
                        <option value="">Select type...</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                        <option value="loan-give">Loan Give</option>
                        <option value="loan-take">Loan Take</option>
                        <option value="on-behalf-in">On-behalf - Amount In</option>
                        <option value="on-behalf-out">On-behalf - Amount Out</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Expense Type:</label>
                      <select 
                        value={cashForm.expenseType} 
                        onChange={(e) => setCashForm({...cashForm, expenseType: e.target.value})}
                      >
                        <option value="">Select type...</option>
                        <option value="important-necessary">Important & Necessary</option>
                        <option value="less-important">Less Important</option>
                        <option value="avoidable-loss">Avoidable & Loss</option>
                        <option value="unnecessary">Un-necessary</option>
                        <option value="basic-necessity">Basic Necessity</option>
                      </select>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Description:</label>
                      <textarea 
                        value={cashForm.description}
                        onChange={(e) => setCashForm({...cashForm, description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Notes:</label>
                      <textarea 
                        value={cashForm.notes}
                        onChange={(e) => setCashForm({...cashForm, notes: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowCashForm(false)}>Cancel</button>
                    <button type="submit">{editingItem ? 'Update' : 'Save'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Currency</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Location/Provider</th>
                  <th>Type of Transaction</th>
                  <th>Expense Type</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashRecords.map(record => (
                  <tr key={record._id}>
                    <td>{record.name}</td>
                    <td>
                      <span className="record-type-badge cash">
                        {record.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td>{record.currency}</td>
                    <td className="amount">{record.amount}</td>
                    <td>{record.date ? new Date(record.date).toLocaleDateString() : new Date(record.createdAt).toLocaleDateString()}</td>
                    <td>
                      {record.location || record.walletProvider || record.cryptoType || '-'}
                    </td>
                    <td>
                      {record.transactionType ? record.transactionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                    </td>
                    <td>
                      {record.expenseType ? record.expenseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                    </td>
                    <td>{record.description || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => handleEdit(record, 'cash')} className="edit-btn">Edit</button>
                        <button onClick={() => handleDelete(record._id, 'cash')} className="delete-btn">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards Section */}
      {activeTab === 'cards' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Card Management</h2>
            <div className="header-buttons">
              <button 
                className="add-btn card-btn"
                onClick={() => {
                  resetCardForm();
                  setEditingItem(null);
                  setShowCardForm(true);
                }}
              >
                Add Card
              </button>
              <button 
                className="add-btn transaction-btn"
                onClick={() => {
                  resetTransactionForm();
                  setShowTransactionForm(true);
                }}
              >
                Add Transaction
              </button>
            </div>
          </div>

          {showCardForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editingItem ? 'Edit' : 'Add'} Card</h3>
                <form onSubmit={handleCardSubmit} autoComplete="off">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Type:</label>
                      <select 
                        value={cardForm.type} 
                        onChange={(e) => setCardForm({...cardForm, type: e.target.value})}
                      >
                        <option value="credit-card">Credit Card</option>
                        <option value="debit-card">Debit Card</option>
                        <option value="prepaid-card">Prepaid Card</option>
                        <option value="gift-card">Gift Card</option>
                        <option value="loyalty-card">Loyalty Card</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Name:</label>
                      <input 
                        type="text" 
                        value={cardForm.name}
                        onChange={(e) => setCardForm({...cardForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Issuer:</label>
                      <input 
                        type="text" 
                        value={cardForm.issuer}
                        onChange={(e) => setCardForm({...cardForm, issuer: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Card Number:</label>
                      <input 
                        type="text" 
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        value={cardForm.cardNumber}
                        onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Cardholder Name:</label>
                      <input 
                        type="text" 
                        value={cardForm.cardholderName}
                        onChange={(e) => setCardForm({...cardForm, cardholderName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date (MM/YY):</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        value={cardForm.expiryDate}
                        onChange={(e) => setCardForm({...cardForm, expiryDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV:</label>
                      <input 
                        type="text" 
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                        required
                      />
                    </div>
                    
                    {cardForm.type === 'credit-card' && (
                      <>
                        <div className="form-group">
                          <label>Credit Limit:</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={cardForm.creditLimit}
                            onChange={(e) => setCardForm({...cardForm, creditLimit: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Interest Rate (%):</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={cardForm.interestRate}
                            onChange={(e) => setCardForm({...cardForm, interestRate: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Minimum Payment:</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={cardForm.minimumPayment}
                            onChange={(e) => setCardForm({...cardForm, minimumPayment: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label>Due Date:</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="31"
                            value={cardForm.dueDate}
                            onChange={(e) => setCardForm({...cardForm, dueDate: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    
                    {cardForm.type === 'debit-card' && (
                      <>
                        <div className="form-group">
                          <label>Linked Account:</label>
                          <input 
                            type="text" 
                            value={cardForm.linkedAccount}
                            onChange={(e) => setCardForm({...cardForm, linkedAccount: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Bank Name:</label>
                          <input 
                            type="text" 
                            value={cardForm.bankName}
                            onChange={(e) => setCardForm({...cardForm, bankName: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="form-group">
                      <label>Currency:</label>
                      <select 
                        value={cardForm.currency} 
                        onChange={(e) => setCardForm({...cardForm, currency: e.target.value})}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={cardForm.isInternational}
                          onChange={(e) => setCardForm({...cardForm, isInternational: e.target.checked})}
                        />
                        International Card
                      </label>
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={cardForm.contactless}
                          onChange={(e) => setCardForm({...cardForm, contactless: e.target.checked})}
                        />
                        Contactless Enabled
                      </label>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Description:</label>
                      <textarea 
                        value={cardForm.description}
                        onChange={(e) => setCardForm({...cardForm, description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Notes:</label>
                      <textarea 
                        value={cardForm.notes}
                        onChange={(e) => setCardForm({...cardForm, notes: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowCardForm(false)}>Cancel</button>
                    <button type="submit">{editingItem ? 'Update' : 'Save'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Transaction Form Modal */}
          {showTransactionForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editingTransaction ? 'Edit' : 'Add'} Card Transaction</h3>
                <form onSubmit={handleTransactionSubmit} autoComplete="off">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Select Card:</label>
                      <select 
                        value={transactionForm.cardId} 
                        onChange={(e) => setTransactionForm({...transactionForm, cardId: e.target.value})}
                        required
                      >
                        <option value="">Choose a card...</option>
                        {cardRecords.map(card => (
                          <option key={card._id} value={card._id}>
                            {card.name} - {card.issuer}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Transaction Type:</label>
                      <select 
                        value={transactionForm.type} 
                        onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value})}
                      >
                        <option value="purchase">Purchase</option>
                        <option value="payment">Payment</option>
                        <option value="withdrawal">Cash Withdrawal</option>
                        <option value="refund">Refund</option>
                        <option value="fee">Fee/Charge</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount:</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency:</label>
                      <select 
                        value={transactionForm.currency} 
                        onChange={(e) => setTransactionForm({...transactionForm, currency: e.target.value})}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Merchant/Description:</label>
                      <input 
                        type="text" 
                        value={transactionForm.merchant}
                        onChange={(e) => setTransactionForm({...transactionForm, merchant: e.target.value})}
                        placeholder="e.g., Amazon, Grocery Store"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category:</label>
                      <select 
                        value={transactionForm.category} 
                        onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                      >
                        <option value="">Select category...</option>
                        <option value="food">Food & Dining</option>
                        <option value="shopping">Shopping</option>
                        <option value="transport">Transportation</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="utilities">Utilities</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date:</label>
                      <input 
                        type="date" 
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Type of Transaction:</label>
                      <select 
                        value={transactionForm.transactionType} 
                        onChange={(e) => setTransactionForm({...transactionForm, transactionType: e.target.value})}
                      >
                        <option value="">Select type...</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                        <option value="loan-give">Loan Give</option>
                        <option value="loan-take">Loan Take</option>
                        <option value="on-behalf-in">On-behalf - Amount In</option>
                        <option value="on-behalf-out">On-behalf - Amount Out</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Expense Type:</label>
                      <select 
                        value={transactionForm.expenseType} 
                        onChange={(e) => setTransactionForm({...transactionForm, expenseType: e.target.value})}
                      >
                        <option value="">Select type...</option>
                        <option value="important-necessary">Important & Necessary</option>
                        <option value="less-important">Less Important</option>
                        <option value="avoidable-loss">Avoidable & Loss</option>
                        <option value="unnecessary">Un-necessary</option>
                        <option value="basic-necessity">Basic Necessity</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description (Optional):</label>
                      <textarea 
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                        placeholder="Additional notes..."
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => {
                      setShowTransactionForm(false);
                      setEditingTransaction(null);
                      resetTransactionForm();
                    }}>Cancel</button>
                    <button type="submit">{editingTransaction ? 'Update' : 'Add'} Transaction</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Card Details Section */}
          <div className="cards-grid">
            {cardRecords.map(card => (
              <div key={card._id} className={`card-item ${card.type.replace('-', '-')}`}>
                <div className="card-header">
                  <div className="card-name">{card.name}</div>
                  <div className="card-type">{card.type.replace('-', ' ').toUpperCase()}</div>
                </div>
                <div className="card-number">****-****-****-{card.cardNumber.slice(-4)}</div>
                <div className="card-info">
                  <div className="card-issuer">{card.issuer}</div>
                  <div className="card-holder">{card.cardholderName}</div>
                  <div className="card-expiry">Valid Thru {card.expiryDate}</div>
                </div>
                {card.creditLimit && (
                  <div className="card-limit">
                    <div className="limit-label">Credit Limit</div>
                    <div className="limit-amount">{card.currency} {card.creditLimit}</div>
                    {card.availableCredit && (
                      <div className="available-credit">Available: {card.currency} {card.availableCredit}</div>
                    )}
                  </div>
                )}
                <div className="card-actions">
                  <button onClick={() => handleEdit(card, 'card')} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(card._id, 'cards')} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
            {cardRecords.length === 0 && (
              <div className="empty-state">
                <p>No cards added yet. Add your first card to get started!</p>
              </div>
            )}
          </div>

          {/* Transactions Section */}
          <div className="transactions-section">
            <div className="section-header">
              <h3>Recent Transactions</h3>
              <div className="filter-dropdown">
                <label>Filter by Card:</label>
                <select 
                  value={selectedCardFilter} 
                  onChange={(e) => setSelectedCardFilter(e.target.value)}
                >
                  <option value="all">All Cards</option>
                  {cardRecords.map(card => (
                    <option key={card._id} value={card._id}>
                      {card.name} - {card.issuer}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Card</th>
                    <th>Type</th>
                    <th>Merchant</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cardTransactions
                    .filter(transaction => {
                      if (selectedCardFilter === 'all') return true;
                      
                      // Handle both string and object cardId
                      const transactionCardId = typeof transaction.cardId === 'object' 
                        ? transaction.cardId._id || transaction.cardId
                        : transaction.cardId;
                      
                      return transactionCardId === selectedCardFilter;
                    })
                    .map(transaction => {
                    const card = transaction.cardId; // cardId should be populated from backend
                    console.log('Transaction:', transaction, 'Card:', card); // Debug log
                    return (
                      <tr key={transaction._id}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{card ? card.name : 'Unknown Card'}</td>
                        <td>
                          <span className={`transaction-type ${transaction.type}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td>{transaction.merchant}</td>
                        <td className="amount">{transaction.currency} {transaction.amount}</td>
                        <td>
                          <button 
                            className="edit-btn" 
                            onClick={() => handleTransactionEdit(transaction)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => handleTransactionDelete(transaction._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {cardTransactions.length === 0 && (
                <div className="empty-state">
                  <p>No transactions yet. Add your first transaction!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Bank Section */}
      {activeTab === 'bank' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Bank Accounts</h2>
            <div className="header-buttons">
              <button 
                className="add-btn"
                onClick={() => {
                  resetBankForm();
                  setEditingItem(null);
                  setShowBankForm(true);
                }}
              >
                Add Bank Account
              </button>
              <button 
                className="add-btn transaction-btn"
                onClick={() => {
                  resetBankTransactionForm();
                  setShowBankTransactionForm(true);
                }}
              >
                Add Bank Transaction
              </button>
            </div>
          </div>

          {showBankForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editingItem ? 'Edit' : 'Add'} Bank Account</h3>
                <form onSubmit={handleBankSubmit} autoComplete="off">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Account Type:</label>
                      <select 
                        value={bankForm.type} 
                        onChange={(e) => setBankForm({...bankForm, type: e.target.value})}
                      >
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                        <option value="fixed-deposit">Fixed Deposit</option>
                        <option value="recurring-deposit">Recurring Deposit</option>
                        <option value="nri-account">NRI Account</option>
                        <option value="joint-account">Joint Account</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Account Name:</label>
                      <input 
                        type="text" 
                        value={bankForm.name}
                        onChange={(e) => setBankForm({...bankForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Name:</label>
                      <input 
                        type="text" 
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Number:</label>
                      <input 
                        type="text" 
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Holder Name:</label>
                      <input 
                        type="text" 
                        value={bankForm.accountHolderName}
                        onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Currency:</label>
                      <select 
                        value={bankForm.currency} 
                        onChange={(e) => setBankForm({...bankForm, currency: e.target.value})}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Balance:</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={bankForm.balance}
                        onChange={(e) => setBankForm({...bankForm, balance: e.target.value})}
                        required
                      />
                    </div>
                    
                    {(bankForm.type === 'fixed-deposit' || bankForm.type === 'recurring-deposit') && (
                      <>
                        <div className="form-group">
                          <label>Deposit Amount:</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={bankForm.depositAmount}
                            onChange={(e) => setBankForm({...bankForm, depositAmount: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Interest Rate (%):</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={bankForm.interestRate}
                            onChange={(e) => setBankForm({...bankForm, interestRate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Tenure (months):</label>
                          <input 
                            type="number" 
                            value={bankForm.tenure}
                            onChange={(e) => setBankForm({...bankForm, tenure: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group checkbox-group">
                          <label>
                            <input 
                              type="checkbox" 
                              checked={bankForm.autoRenewal}
                              onChange={(e) => setBankForm({...bankForm, autoRenewal: e.target.checked})}
                            />
                            Auto Renewal
                          </label>
                        </div>
                      </>
                    )}
                    
                    <div className="form-group">
                      <label>IFSC Code:</label>
                      <input 
                        type="text" 
                        value={bankForm.ifscCode}
                        onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value.toUpperCase()})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>MICR Code:</label>
                      <input 
                        type="text" 
                        value={bankForm.micrCode}
                        onChange={(e) => setBankForm({...bankForm, micrCode: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Branch Name:</label>
                      <input 
                        type="text" 
                        value={bankForm.branchName}
                        onChange={(e) => setBankForm({...bankForm, branchName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Branch Address:</label>
                      <input 
                        type="text" 
                        value={bankForm.branchAddress}
                        onChange={(e) => setBankForm({...bankForm, branchAddress: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>City:</label>
                      <input 
                        type="text" 
                        value={bankForm.city}
                        onChange={(e) => setBankForm({...bankForm, city: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>State:</label>
                      <input 
                        type="text" 
                        value={bankForm.state}
                        onChange={(e) => setBankForm({...bankForm, state: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Pincode:</label>
                      <input 
                        type="text" 
                        value={bankForm.pincode}
                        onChange={(e) => setBankForm({...bankForm, pincode: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={bankForm.netBankingEnabled}
                          onChange={(e) => setBankForm({...bankForm, netBankingEnabled: e.target.checked})}
                        />
                        Net Banking Enabled
                      </label>
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={bankForm.mobileBankingEnabled}
                          onChange={(e) => setBankForm({...bankForm, mobileBankingEnabled: e.target.checked})}
                        />
                        Mobile Banking Enabled
                      </label>
                    </div>
                    
                    <div className="form-group checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          checked={bankForm.upiEnabled}
                          onChange={(e) => setBankForm({...bankForm, upiEnabled: e.target.checked})}
                        />
                        UPI Enabled
                      </label>
                    </div>
                    
                    {bankForm.upiEnabled && (
                      <div className="form-group">
                        <label>UPI ID:</label>
                        <input 
                          type="text" 
                          value={bankForm.upiId}
                          onChange={(e) => setBankForm({...bankForm, upiId: e.target.value})}
                        />
                      </div>
                    )}
                    
                    <div className="form-group">
                      <label>Nominee Name:</label>
                      <input 
                        type="text" 
                        value={bankForm.nomineeName}
                        onChange={(e) => setBankForm({...bankForm, nomineeName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee Relationship:</label>
                      <input 
                        type="text" 
                        value={bankForm.nomineeRelationship}
                        onChange={(e) => setBankForm({...bankForm, nomineeRelationship: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee Age:</label>
                      <input 
                        type="number" 
                        value={bankForm.nomineeAge}
                        onChange={(e) => setBankForm({...bankForm, nomineeAge: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominee Contact:</label>
                      <input 
                        type="text" 
                        value={bankForm.nomineeContact}
                        onChange={(e) => setBankForm({...bankForm, nomineeContact: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Description:</label>
                      <textarea 
                        value={bankForm.description}
                        onChange={(e) => setBankForm({...bankForm, description: e.target.value})}
                        rows={2}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Notes:</label>
                      <textarea 
                        value={bankForm.notes}
                        onChange={(e) => setBankForm({...bankForm, notes: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowBankForm(false)}>Cancel</button>
                    <button type="submit">{editingItem ? 'Update' : 'Save'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showBankTransactionForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editingBankTransaction ? 'Edit' : 'Add'} Bank Transaction</h3>
                <form onSubmit={handleBankTransactionSubmit} autoComplete="off">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Select Account:</label>
                      <select 
                        value={bankTransactionForm.accountId} 
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, accountId: e.target.value})}
                        required
                      >
                        <option value="">Choose an account...</option>
                        {bankRecords.map(account => (
                          <option key={account._id} value={account._id}>
                            {account.name} - {account.bankName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Transaction Type:</label>
                      <select 
                        value={bankTransactionForm.type} 
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, type: e.target.value})}
                        required
                      >
                        <option value="withdrawal">Withdrawal</option>
                        <option value="deposit">Deposit</option>
                        <option value="transfer">Transfer</option>
                        <option value="payment">Payment</option>
                        <option value="fee">Fee</option>
                        <option value="interest">Interest</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Amount:</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={bankTransactionForm.amount}
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Merchant/Payee:</label>
                      <input 
                        type="text" 
                        value={bankTransactionForm.merchant}
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, merchant: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category:</label>
                      <select 
                        value={bankTransactionForm.category} 
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, category: e.target.value})}
                      >
                        <option value="">Select category...</option>
                        <option value="food">Food & Dining</option>
                        <option value="shopping">Shopping</option>
                        <option value="transport">Transportation</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="utilities">Utilities</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="education">Education</option>
                        <option value="salary">Salary</option>
                        <option value="rent">Rent</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date:</label>
                      <input 
                        type="date" 
                        value={bankTransactionForm.date}
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Type of Transaction:</label>
                      <select 
                        value={bankTransactionForm.transactionType} 
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, transactionType: e.target.value})}
                      >
                        <option value="">Select type...</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                        <option value="loan-give">Loan Give</option>
                        <option value="loan-take">Loan Take</option>
                        <option value="on-behalf-in">On-behalf - Amount In</option>
                        <option value="on-behalf-out">On-behalf - Amount Out</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Expense Type:</label>
                      <select 
                        value={bankTransactionForm.expenseType} 
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, expenseType: e.target.value})}
                      >
                        <option value="">Select type...</option>
                        <option value="important-necessary">Important & Necessary</option>
                        <option value="less-important">Less Important</option>
                        <option value="avoidable-loss">Avoidable & Loss</option>
                        <option value="unnecessary">Un-necessary</option>
                        <option value="basic-necessity">Basic Necessity</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Description (Optional):</label>
                      <textarea 
                        value={bankTransactionForm.description}
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, description: e.target.value})}
                        placeholder="Additional notes..."
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Currency:</label>
                      <select 
                        value={bankTransactionForm.currency} 
                        onChange={(e) => setBankTransactionForm({...bankTransactionForm, currency: e.target.value})}
                      >
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => {
                      setShowBankTransactionForm(false);
                      setEditingBankTransaction(null);
                      resetBankTransactionForm();
                    }}>Cancel</button>
                    <button type="submit">{editingBankTransaction ? 'Update' : 'Add'} Transaction</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bank Transactions Section */}
          <div className="transactions-section">
            <div className="section-header">
              <h3>Recent Bank Transactions</h3>
              <div className="filter-dropdown">
                <label>Filter by Bank:</label>
                <select 
                  value={selectedBankFilter} 
                  onChange={(e) => setSelectedBankFilter(e.target.value)}
                >
                  <option value="all">All Banks</option>
                  {bankRecords.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} - {account.bankName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Account</th>
                    <th>Type</th>
                    <th>Merchant/Payee</th>
                    <th>Amount</th>
                    <th>Type of Transaction</th>
                    <th>Expense Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bankTransactions
                    .filter(transaction => {
                      if (selectedBankFilter === 'all') return true;
                      
                      // Handle both string and object accountId
                      const transactionAccountId = typeof transaction.accountId === 'object' 
                        ? transaction.accountId._id || transaction.accountId
                        : transaction.accountId;
                      
                      return transactionAccountId === selectedBankFilter;
                    })
                    .map(transaction => {
                    const account = transaction.accountId; // accountId should be populated from backend
                    return (
                      <tr key={transaction._id}>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{account ? `${account.name} - ${account.bankName}` : 'Unknown Account'}</td>
                        <td>
                          <span className={`transaction-type ${transaction.type}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td>{transaction.merchant}</td>
                        <td className="amount">{transaction.currency} {transaction.amount}</td>
                        <td>
                          {transaction.transactionType ? transaction.transactionType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                        </td>
                        <td>
                          {transaction.expenseType ? transaction.expenseType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                        </td>
                        <td>
                          <button 
                            className="edit-btn" 
                            onClick={() => handleBankTransactionEdit(transaction)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => handleBankTransactionDelete(transaction._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {bankTransactions.length === 0 && (
                <div className="empty-state">
                  <p>No bank transactions yet. Add your first transaction!</p>
                </div>
              )}
            </div>
          </div>

          {/* Bank Accounts Section */}
          <div className="bank-cards-grid">
            {bankRecords.map(account => (
              <div key={account._id} className={`bank-card-item ${account.type.replace(' ', '-').replace('-', '-')}`}>
                <div className="bank-card-header">
                  <div className="bank-card-name">{account.name}</div>
                  <div className="bank-card-type">{account.type.replace('-', ' ').toUpperCase()}</div>
                </div>
                <div className="bank-card-details">
                  <div className="bank-info-left">
                    <div className="bank-logo-placeholder">
                      <div className="bank-name-main">{account.bankName}</div>
                    </div>
                    <div className="bank-card-info">
                      <div className="account-number">****-****-{account.accountNumber ? account.accountNumber.slice(-4) : '****'}</div>
                      <div className="account-holder">{account.accountHolderName}</div>
                      {account.branchName && <div className="branch-name">{account.branchName}</div>}
                    </div>
                  </div>
                  <div className="bank-info-right">
                    <div className="bank-card-balance">
                      <div className="balance-label">Balance</div>
                      <div className="balance-amount">{account.currency} {calculateAccountBalance(account).toLocaleString()}</div>
                    </div>
                    {account.interestRate && (
                      <div className="bank-card-interest">
                        <div className="interest-label">Interest Rate</div>
                        <div className="interest-rate">{account.interestRate}%</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bank-card-actions">
                  <button onClick={() => handleEdit(account, 'bank')} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(account._id, 'bank')} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
            {bankRecords.length === 0 && (
              <div className="empty-state">
                <p>No bank accounts added yet. Add your first bank account to get started!</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Financial Overview Chart */}
      {showChart && (cashRecords.length > 0 || cardRecords.length > 0 || bankRecords.length > 0 || cardTransactions.length > 0 || bankTransactions.length > 0) && (
        <FinancialOverviewChart 
          cashRecords={cashRecords}
          cardRecords={cardRecords}
          bankRecords={bankRecords}
          cardTransactions={cardTransactions}
          bankTransactions={bankTransactions}
        />
      )}
    </div>
  );
};

export default CashCardsBank;
