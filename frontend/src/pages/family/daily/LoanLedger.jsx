import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiTrendingUp, FiActivity, FiUsers, FiArrowUpRight, FiArrowDownLeft, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

import { trackFeatureUsage, trackAction } from '../../../utils/featureTracking';

const LoanLedger = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showOnBehalfForm, setShowOnBehalfForm] = useState(false);
  const [showWalletForm, setShowWalletForm] = useState(false);
  const formRef = useRef(null);
  const [loanEntries, setLoanEntries] = useState([]);
  const [paymentEntries, setPaymentEntries] = useState([]);
  const [onBehalfEntries, setOnBehalfEntries] = useState([]);
  const [walletEntries, setWalletEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedLoanForHistory, setSelectedLoanForHistory] = useState(null);
  const [showOnBehalfPaymentForm, setShowOnBehalfPaymentForm] = useState(false);
  const [selectedOnBehalfId, setSelectedOnBehalfId] = useState('');

  // Loan Form State
  const [loanInputs, setLoanInputs] = useState({
    date: new Date().toISOString().slice(0, 10),
    loanType: 'Lent', // 'Lent' (Udhar Diya) or 'Borrowed' (Udhar Liya)
    nameOfPerson: '',
    forPurpose: '',
    amount: '',
    finalDateOfReturn: '',
    paymentDetails: '',
    comments: ''
  });

  // Payment Form State
  const [paymentInputs, setPaymentInputs] = useState({
    dateOfReturn: new Date().toISOString().slice(0, 10),
    amountReturned: '',
    paymentDetails: '',
    comments: ''
  });

  // On Behalf Form State
  const [onBehalfInputs, setOnBehalfInputs] = useState({
    date: new Date().toISOString().slice(0, 10),
    paidOnBehalfOf: '',
    amountPaid: '',
    forPurpose: '',
    paymentDetails: '',
    receivedAmount: '',
    dateOfReceipt: new Date().toISOString().slice(0, 10),
    receiptPaymentDetails: '',
    comments: ''
  });

  // On Behalf Payment Form State
  const [onBehalfPaymentInputs, setOnBehalfPaymentInputs] = useState({
    dateOfReceipt: new Date().toISOString().slice(0, 10),
    amountReceived: '',
    receiptPaymentDetails: '',
    comments: ''
  });

  // Wallet Form State
  const [walletInputs, setWalletInputs] = useState({
    name: '',
    walletProvider: '',
    walletNumber: '',
    initialBalance: ''
  });

  useEffect(() => {
    trackFeatureUsage('/family/daily/loan-ledger', 'view');
    if ((showForm || showPaymentForm || showOnBehalfForm || showOnBehalfPaymentForm || showWalletForm) && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm, showPaymentForm, showOnBehalfForm, showOnBehalfPaymentForm, showWalletForm]);

  // Fetch data from database
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch loan entries
      const loansResponse = await investmentAPI.getAll('loan-ledger');
      const loans = (loansResponse.data.investments || []).map(loan => {
        const notes = JSON.parse(loan.notes || '{}');
        return {
          _id: loan._id,
          date: loan.startDate,
          loanType: loan.type || 'Lent', // 'Lent' or 'Borrowed'
          nameOfPerson: loan.name,
          forPurpose: notes.forPurpose || '',
          amount: loan.amount,
          finalDateOfReturn: loan.maturityDate,
          paymentDetails: loan.source || '',
          comments: notes.comments || '',
          totalPaid: notes.totalPaid || 0,
          balanceAmount: notes.balanceAmount || loan.amount,
          payments: notes.payments || [],
          notes: loan.notes
        };
      });
      setLoanEntries(loans);

      // Fetch on-behalf entries
      const onBehalfResponse = await investmentAPI.getAll('on-behalf');
      const onBehalf = (onBehalfResponse.data.investments || []).map(entry => {
        const notes = JSON.parse(entry.notes || '{}');
        return {
          _id: entry._id,
          date: entry.startDate,
          paidOnBehalfOf: entry.name,
          amountPaid: entry.amount,
          forPurpose: notes.forPurpose || '',
          paymentDetails: entry.source || '',
          receivedAmount: notes.receivedAmount || 0,
          totalReceived: notes.totalReceived || notes.receivedAmount || 0,
          balanceToReceive: entry.amount - (notes.totalReceived || notes.receivedAmount || 0),
          dateOfReceipt: notes.dateOfReceipt || entry.maturityDate,
          receiptPaymentDetails: notes.receiptPaymentDetails || '',
          comments: notes.comments || '',
          receipts: notes.receipts || [],
          notes: entry.notes
        };
      });
      setOnBehalfEntries(onBehalf);

      // Fetch wallet entries
      const walletsResponse = await investmentAPI.getWallets();
      setWalletEntries(walletsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoanEntries([]);
      setOnBehalfEntries([]);
      setWalletEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    // Separate loans by type
    const lentLoans = loanEntries.filter(l => l.loanType === 'Lent');
    const borrowedLoans = loanEntries.filter(l => l.loanType === 'Borrowed');

    const totalLentAmount = lentLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
    const totalLentPaid = lentLoans.reduce((sum, loan) => sum + Number(loan.totalPaid || 0), 0);
    const totalLentBalance = totalLentAmount - totalLentPaid;

    const totalBorrowedAmount = borrowedLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
    const totalBorrowedPaid = borrowedLoans.reduce((sum, loan) => sum + Number(loan.totalPaid || 0), 0);
    const totalBorrowedBalance = totalBorrowedAmount - totalBorrowedPaid;

    const totalOnBehalf = onBehalfEntries.reduce((sum, entry) => sum + Number(entry.amountPaid || 0), 0);
    const totalReceived = onBehalfEntries.reduce((sum, entry) => sum + Number(entry.receivedAmount || 0), 0);

    return {
      totalLentAmount,
      totalLentPaid,
      totalLentBalance,
      totalBorrowedAmount,
      totalBorrowedPaid,
      totalBorrowedBalance,
      totalOnBehalf,
      totalReceived,
      lentCount: lentLoans.length,
      borrowedCount: borrowedLoans.length,
      count: loanEntries.length
    };
  }, [loanEntries, onBehalfEntries]);

  // Loan form handlers
  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const payload = {
        category: 'loan-ledger',
        type: loanInputs.loanType, // 'Lent' or 'Borrowed'
        name: loanInputs.nameOfPerson,
        amount: Number(loanInputs.amount),
        startDate: loanInputs.date,
        maturityDate: loanInputs.finalDateOfReturn || loanInputs.date,
        frequency: 'one-time',
        source: loanInputs.paymentDetails,
        notes: JSON.stringify({
          forPurpose: loanInputs.forPurpose,
          comments: loanInputs.comments,
          totalPaid: 0,
          balanceAmount: Number(loanInputs.amount),
          payments: []
        })
      };

      await investmentAPI.create(payload);
      await fetchData(); // Refresh data from database

      setLoanInputs({
        date: new Date().toISOString().slice(0, 10),
        loanType: 'Lent',
        nameOfPerson: '',
        forPurpose: '',
        amount: '',
        finalDateOfReturn: '',
        paymentDetails: '',
        comments: ''
      });
      setShowForm(false);
      alert('Loan record saved successfully!');
    } catch (error) {
      console.error('Error saving loan:', error);
      alert('Error saving loan record: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Payment form handlers
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const paymentAmount = Number(paymentInputs.amountReturned);

      // Find the loan
      const loan = loanEntries.find(l => l._id === selectedLoanId);
      if (!loan) {
        alert('Loan not found');
        return;
      }

      // Parse existing notes
      const existingNotes = JSON.parse(loan.notes || '{}');
      const totalPaid = (existingNotes.totalPaid || 0) + paymentAmount;
      const balanceAmount = loan.amount - totalPaid;
      const payments = [...(existingNotes.payments || []), {
        date: paymentInputs.dateOfReturn,
        amount: paymentAmount,
        paymentDetails: paymentInputs.paymentDetails,
        comments: paymentInputs.comments
      }];

      // Update loan with new payment
      const updatedNotes = {
        ...existingNotes,
        totalPaid,
        balanceAmount,
        payments
      };

      await investmentAPI.update(selectedLoanId, {
        notes: JSON.stringify(updatedNotes)
      });

      await fetchData(); // Refresh data from database

      setPaymentInputs({
        dateOfReturn: new Date().toISOString().slice(0, 10),
        amountReturned: '',
        paymentDetails: '',
        comments: ''
      });
      setSelectedLoanId('');
      setShowPaymentForm(false);
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Error saving payment record: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // On behalf form handlers
  const handleOnBehalfSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const payload = {
        category: 'on-behalf',
        type: 'On Behalf',
        name: onBehalfInputs.paidOnBehalfOf,
        amount: Number(onBehalfInputs.amountPaid),
        startDate: onBehalfInputs.date,
        maturityDate: onBehalfInputs.dateOfReceipt || onBehalfInputs.date,
        frequency: 'one-time',
        source: onBehalfInputs.paymentDetails,
        notes: JSON.stringify({
          forPurpose: onBehalfInputs.forPurpose,
          receivedAmount: Number(onBehalfInputs.receivedAmount || 0),
          dateOfReceipt: onBehalfInputs.dateOfReceipt,
          receiptPaymentDetails: onBehalfInputs.receiptPaymentDetails,
          comments: onBehalfInputs.comments
        })
      };

      await investmentAPI.create(payload);
      await fetchData(); // Refresh data from database

      setOnBehalfInputs({
        date: new Date().toISOString().slice(0, 10),
        paidOnBehalfOf: '',
        amountPaid: '',
        forPurpose: '',
        paymentDetails: '',
        receivedAmount: '',
        dateOfReceipt: new Date().toISOString().slice(0, 10),
        receiptPaymentDetails: '',
        comments: ''
      });
      setShowOnBehalfForm(false);
      alert('On behalf record saved successfully!');
    } catch (error) {
      console.error('Error saving on behalf record:', error);
      alert('Error saving on behalf record: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Delete this record?')) {
      try {
        if (type === 'wallet') {
          await investmentAPI.deleteWallet(id);
        } else {
          await investmentAPI.delete(id);
        }
        await fetchData(); // Refresh data from database
        alert('Record deleted successfully!');
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting record: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleShowPaymentHistory = (loan) => {
    setSelectedLoanForHistory(loan);
    setShowPaymentHistory(true);
  };

  // On Behalf Payment form handlers
  const handleOnBehalfPaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const receiptAmount = Number(onBehalfPaymentInputs.amountReceived);

      // Find the on behalf entry
      const onBehalfEntry = onBehalfEntries.find(e => e._id === selectedOnBehalfId);
      if (!onBehalfEntry) {
        alert('On behalf entry not found');
        return;
      }

      // Parse existing notes
      const existingNotes = JSON.parse(onBehalfEntry.notes || '{}');
      const totalReceived = (existingNotes.totalReceived || existingNotes.receivedAmount || 0) + receiptAmount;
      const balanceToReceive = onBehalfEntry.amountPaid - totalReceived;
      const receipts = [...(existingNotes.receipts || []), {
        date: onBehalfPaymentInputs.dateOfReceipt,
        amount: receiptAmount,
        paymentDetails: onBehalfPaymentInputs.receiptPaymentDetails,
        comments: onBehalfPaymentInputs.comments
      }];

      // Update on behalf entry with new receipt
      const updatedNotes = {
        ...existingNotes,
        totalReceived,
        balanceToReceive,
        receipts,
        receivedAmount: totalReceived // Update this for backward compatibility
      };

      await investmentAPI.update(selectedOnBehalfId, {
        notes: JSON.stringify(updatedNotes)
      });

      await fetchData(); // Refresh data from database

      setOnBehalfPaymentInputs({
        dateOfReceipt: new Date().toISOString().slice(0, 10),
        amountReceived: '',
        receiptPaymentDetails: '',
        comments: ''
      });
      setSelectedOnBehalfId('');
      setShowOnBehalfPaymentForm(false);
      alert('Receipt recorded successfully!');
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Error saving receipt record: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  // Wallet form handlers
  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: walletInputs.name,
        walletProvider: walletInputs.walletProvider,
        walletNumber: walletInputs.walletNumber,
        amount: Number(walletInputs.initialBalance || 0),
        type: 'digital-wallet',
        notes: JSON.stringify({
          comments: 'Created from Loan/Wallet Ledger',
          transactions: [{
            date: new Date().toISOString().slice(0, 10),
            amount: Number(walletInputs.initialBalance || 0),
            type: 'Initial Balance',
            source: 'Manual Entry'
          }]
        })
      };

      await investmentAPI.createWallet(payload);

      setWalletInputs({
        name: '',
        walletProvider: '',
        walletNumber: '',
        initialBalance: ''
      });
      setShowWalletForm(false);
      alert('Wallet created successfully!');
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Error creating wallet: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Udhar Lena / Dena / Credit Card / Loan / Wallet</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Loan'}
          </button>
          {/* <button className="btn-success" onClick={() => setShowPaymentForm(!showPaymentForm)}>
            <FiArrowDownLeft /> {showPaymentForm ? 'Cancel' : 'Add Payment'}
          </button> */}
          <button className="btn-primary" onClick={() => setShowOnBehalfForm(!showOnBehalfForm)}>
            <FiCreditCard /> {showOnBehalfForm ? 'Cancel' : 'On Behalf'}
          </button>
          <button className="btn-primary" onClick={() => setShowWalletForm(!showWalletForm)}>
            <FiSmartphone /> {showWalletForm ? 'Cancel' : 'Add Wallet'}
          </button>
          {/* <button className="btn-success" onClick={() => setShowOnBehalfPaymentForm(!showOnBehalfPaymentForm)}>
            <FiDollarSign /> {showOnBehalfPaymentForm ? 'Cancel' : 'Add Receipt'}
          </button> */}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiArrowUpRight />
          </div>
          <div className="stat-content">
            <p className="stat-label">Udhaar Dia (Lent)</p>
            <h3 className="stat-value">₹{Math.round(totals.totalLentAmount).toLocaleString('en-IN')}</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
              Received: ₹{Math.round(totals.totalLentPaid).toLocaleString('en-IN')} |
              Balance: ₹{Math.round(totals.totalLentBalance).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiArrowDownLeft />
          </div>
          <div className="stat-content">
            <p className="stat-label">Udhaar Lia (Borrowed)</p>
            <h3 className="stat-value">₹{Math.round(totals.totalBorrowedAmount).toLocaleString('en-IN')}</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
              Paid: ₹{Math.round(totals.totalBorrowedPaid).toLocaleString('en-IN')} |
              Balance: ₹{Math.round(totals.totalBorrowedBalance).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Net Position</p>
            <h3 className="stat-value" style={{
              color: (totals.totalLentBalance - totals.totalBorrowedBalance) >= 0 ? '#10B981' : '#EF4444'
            }}>
              ₹{Math.round(Math.abs(totals.totalLentBalance - totals.totalBorrowedBalance)).toLocaleString('en-IN')}
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
              {(totals.totalLentBalance - totals.totalBorrowedBalance) >= 0 ? 'To Receive' : 'To Pay'}
            </p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <FiUsers />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Loans</p>
            <h3 className="stat-value">{totals.count}</h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
              Lent: {totals.lentCount} | Borrowed: {totals.borrowedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Loan Records Table */}
      <div className="investments-table-card">
        <div className="table-header">
          <h2>Loan Records</h2>
        </div>
        <div className="table-container">
          <table className="investments-table">
            <thead>
              <tr>
                <th style={{ minWidth: '140px', width: '140px' }}>Type</th>
                <th>Date</th>
                <th>Person</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Total Paid</th>
                <th>Balance</th>
                <th>Payment Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loanEntries.map((loan) => (
                <tr key={loan._id}>
                  <td style={{ minWidth: '140px', width: '140px' }}>
                    <span
                      className="investment-type-badge"
                      style={{
                        background: loan.loanType === 'Lent'
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        fontSize: '12px',
                        padding: '6px 12px',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        borderRadius: '20px',
                        minWidth: '100px',
                        textAlign: 'center'
                      }}
                    >
                      {loan.loanType === 'Lent' ? 'Udhaar Dia' : 'Udhaar Lia'}
                    </span>
                  </td>
                  <td>{new Date(loan.date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button
                      onClick={() => handleShowPaymentHistory(loan)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                      title="View Payment History"
                    >
                      {loan.nameOfPerson}
                    </button>
                  </td>
                  <td>{loan.forPurpose}</td>
                  <td>₹{Math.round(loan.amount).toLocaleString('en-IN')}</td>
                  <td>{loan.finalDateOfReturn ? new Date(loan.finalDateOfReturn).toLocaleDateString('en-IN') : '-'}</td>
                  <td>₹{Math.round(loan.totalPaid || 0).toLocaleString('en-IN')}</td>
                  <td style={{ color: loan.balanceAmount > 0 ? '#EF4444' : '#10B981' }}>
                    ₹{Math.round(loan.balanceAmount).toLocaleString('en-IN')}
                  </td>
                  <td>{loan.paymentDetails}</td>
                  <td>
                    <div className="investment-actions">
                      <button
                        onClick={() => {
                          setSelectedLoanId(loan._id);
                          setShowPaymentForm(true);
                        }}
                        className="btn-icon"
                        title="Add Payment"
                      >
                        <FiArrowDownLeft />
                      </button>
                      <button onClick={() => handleDelete('loan', loan._id)} className="btn-icon btn-danger">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* On Behalf Records Table */}
      {onBehalfEntries.length > 0 && (
        <div className="investments-table-card">
          <div className="table-header">
            <h2>On Behalf Records</h2>
          </div>
          <div className="table-container">
            <table className="investments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Paid For</th>
                  <th>Amount Paid</th>
                  <th>Purpose</th>
                  <th>Total Received</th>
                  <th>Balance</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {onBehalfEntries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{new Date(entry.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button
                        onClick={() => handleShowPaymentHistory(entry)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                        title="View Receipt History"
                      >
                        {entry.paidOnBehalfOf}
                      </button>
                    </td>
                    <td>₹{Math.round(entry.amountPaid).toLocaleString('en-IN')}</td>
                    <td>{entry.forPurpose}</td>
                    <td>₹{Math.round(entry.totalReceived || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: entry.balanceToReceive > 0 ? '#EF4444' : '#10B981' }}>
                      ₹{Math.round(entry.balanceToReceive || 0).toLocaleString('en-IN')}
                    </td>
                    <td>{entry.comments}</td>
                    <td>
                      <div className="investment-actions">
                        <button
                          onClick={() => {
                            setSelectedOnBehalfId(entry._id);
                            setShowOnBehalfPaymentForm(true);
                          }}
                          className="btn-icon"
                          title="Add Receipt"
                        >
                          <FiDollarSign />
                        </button>
                        <button onClick={() => handleDelete('onBehalf', entry._id)} className="btn-icon btn-danger">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wallet Records Table */}
      {walletEntries.length > 0 && (
        <div className="investments-table-card">
          <div className="table-header">
            <h2>Wallet Records</h2>
          </div>
          <div className="table-container">
            <table className="investments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Wallet Name</th>
                  <th>Provider</th>
                  <th>Wallet Number</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {walletEntries.map((wallet) => (
                  <tr key={wallet._id}>
                    <td>{new Date(wallet.date).toLocaleDateString('en-IN')}</td>
                    <td>{wallet.name}</td>
                    <td>{wallet.walletProvider}</td>
                    <td>{wallet.walletNumber || '-'}</td>
                    <td style={{ color: '#10B981', fontWeight: 'bold' }}>
                      ₹{Math.round(wallet.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div className="investment-actions">
                        <button onClick={() => handleDelete('wallet', wallet._id)} className="btn-icon btn-danger">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loan Form */}
      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Add Loan Entry</h2>
          <form className="investment-form" onSubmit={handleLoanSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Loan Type *</label>
                <select
                  value={loanInputs.loanType}
                  onChange={(e) => setLoanInputs({ ...loanInputs, loanType: e.target.value })}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="Lent">Udhaar Dia (Lent)</option>
                  <option value="Borrowed">Udhaar Lia (Borrowed)</option>
                </select>
              </div>
              <div className="form-field">
                <label>Date *</label>
                <input type="date" value={loanInputs.date} onChange={(e) => setLoanInputs({ ...loanInputs, date: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Name of Person *</label>
                <input type="text" value={loanInputs.nameOfPerson} onChange={(e) => setLoanInputs({ ...loanInputs, nameOfPerson: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>For Purpose *</label>
                <input type="text" value={loanInputs.forPurpose} onChange={(e) => setLoanInputs({ ...loanInputs, forPurpose: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Amount (₹) *</label>
                <input type="number" value={loanInputs.amount} onChange={(e) => setLoanInputs({ ...loanInputs, amount: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Final Date of Return</label>
                <input type="date" value={loanInputs.finalDateOfReturn} onChange={(e) => setLoanInputs({ ...loanInputs, finalDateOfReturn: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Payment Details</label>
                <select value={loanInputs.paymentDetails} onChange={(e) => setLoanInputs({ ...loanInputs, paymentDetails: e.target.value })}>
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Comments</label>
                <textarea value={loanInputs.comments} onChange={(e) => setLoanInputs({ ...loanInputs, comments: e.target.value })} rows="3" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Loan'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Add Payment Entry</h2>
          <form className="investment-form" onSubmit={handlePaymentSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Select Loan *</label>
                <select value={selectedLoanId} onChange={(e) => setSelectedLoanId(e.target.value)} required>
                  <option value="">Select Loan</option>
                  {loanEntries.map(loan => (
                    <option key={loan._id} value={loan._id}>
                      {loan.nameOfPerson} - ₹{Math.round(loan.balanceAmount).toLocaleString('en-IN')} pending
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Date of Return *</label>
                <input type="date" value={paymentInputs.dateOfReturn} onChange={(e) => setPaymentInputs({ ...paymentInputs, dateOfReturn: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Amount Returned (₹) *</label>
                <input type="number" value={paymentInputs.amountReturned} onChange={(e) => setPaymentInputs({ ...paymentInputs, amountReturned: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Payment Details</label>
                <select value={paymentInputs.paymentDetails} onChange={(e) => setPaymentInputs({ ...paymentInputs, paymentDetails: e.target.value })}>
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="form-field">
                <label>Comments</label>
                <textarea value={paymentInputs.comments} onChange={(e) => setPaymentInputs({ ...paymentInputs, comments: e.target.value })} rows="3" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Payment'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowPaymentForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Wallet Form */}
      {showWalletForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Add New Wallet</h2>
          <form className="investment-form" onSubmit={handleWalletSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Wallet Name *</label>
                <input
                  type="text"
                  value={walletInputs.name}
                  onChange={(e) => setWalletInputs({ ...walletInputs, name: e.target.value })}
                  placeholder="e.g. Paytm, PhonePe"
                  required
                />
              </div>
              <div className="form-field">
                <label>Provider *</label>
                <input
                  type="text"
                  value={walletInputs.walletProvider}
                  onChange={(e) => setWalletInputs({ ...walletInputs, walletProvider: e.target.value })}
                  placeholder="e.g. UPI, Bank"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Wallet Number/ID</label>
                <input
                  type="text"
                  value={walletInputs.walletNumber}
                  onChange={(e) => setWalletInputs({ ...walletInputs, walletNumber: e.target.value })}
                  placeholder="Mobile number or UPI ID"
                />
              </div>
              <div className="form-field">
                <label>Initial Balance (₹)</label>
                <input
                  type="number"
                  value={walletInputs.initialBalance}
                  onChange={(e) => setWalletInputs({ ...walletInputs, initialBalance: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Wallet'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowWalletForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* On Behalf Form */}
      {showOnBehalfForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>On Behalf Payment Entry</h2>
          <form className="investment-form" onSubmit={handleOnBehalfSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Date *</label>
                <input type="date" value={onBehalfInputs.date} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, date: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Paid on Behalf of *</label>
                <input type="text" value={onBehalfInputs.paidOnBehalfOf} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, paidOnBehalfOf: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Amount Paid (₹) *</label>
                <input type="number" value={onBehalfInputs.amountPaid} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, amountPaid: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>For Purpose *</label>
                <input type="text" value={onBehalfInputs.forPurpose} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, forPurpose: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Payment Details</label>
                <select value={onBehalfInputs.paymentDetails} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, paymentDetails: e.target.value })}>
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="form-field">
                <label>Received Amount (₹)</label>
                <input type="number" value={onBehalfInputs.receivedAmount} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, receivedAmount: e.target.value })} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Date of Receipt</label>
                <input type="date" value={onBehalfInputs.dateOfReceipt} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, dateOfReceipt: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Receipt Payment Details</label>
                <select value={onBehalfInputs.receiptPaymentDetails} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, receiptPaymentDetails: e.target.value })}>
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="form-field">
                <label>Comments</label>
                <textarea value={onBehalfInputs.comments} onChange={(e) => setOnBehalfInputs({ ...onBehalfInputs, comments: e.target.value })} rows="3" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add On Behalf Entry'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowOnBehalfForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* On Behalf Payment Form */}
      {showOnBehalfPaymentForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Add Receipt Entry</h2>
          <form className="investment-form" onSubmit={handleOnBehalfPaymentSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Select On Behalf Entry *</label>
                <select value={selectedOnBehalfId} onChange={(e) => setSelectedOnBehalfId(e.target.value)} required>
                  <option value="">Select Entry</option>
                  {onBehalfEntries.map(entry => (
                    <option key={entry._id} value={entry._id}>
                      {entry.paidOnBehalfOf} - ₹{Math.round(entry.balanceToReceive || 0).toLocaleString('en-IN')} pending
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Date of Receipt *</label>
                <input type="date" value={onBehalfPaymentInputs.dateOfReceipt} onChange={(e) => setOnBehalfPaymentInputs({ ...onBehalfPaymentInputs, dateOfReceipt: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Amount Received (₹) *</label>
                <input type="number" value={onBehalfPaymentInputs.amountReceived} onChange={(e) => setOnBehalfPaymentInputs({ ...onBehalfPaymentInputs, amountReceived: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Receipt Payment Details</label>
                <select value={onBehalfPaymentInputs.receiptPaymentDetails} onChange={(e) => setOnBehalfPaymentInputs({ ...onBehalfPaymentInputs, receiptPaymentDetails: e.target.value })}>
                  <option value="">Select Payment Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="form-field">
                <label>Comments</label>
                <textarea value={onBehalfPaymentInputs.comments} onChange={(e) => setOnBehalfPaymentInputs({ ...onBehalfPaymentInputs, comments: e.target.value })} rows="3" />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Receipt'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowOnBehalfPaymentForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && selectedLoanForHistory && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '16px'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>
                {selectedLoanForHistory.nameOfPerson ?
                  `Payment History - ${selectedLoanForHistory.nameOfPerson}` :
                  `Receipt History - ${selectedLoanForHistory.paidOnBehalfOf}`}
              </h2>
              <button
                onClick={() => setShowPaymentHistory(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Loan Summary */}
            <div style={{
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontSize: '14px' }}>
                {selectedLoanForHistory.nameOfPerson ? (
                  // Loan History
                  <>
                    <div>
                      <strong>Loan Type:</strong><br />
                      <span style={{ color: selectedLoanForHistory.loanType === 'Lent' ? '#10B981' : '#EF4444' }}>
                        {selectedLoanForHistory.loanType === 'Lent' ? 'Udhaar Dia' : 'Udhaar Lia'}
                      </span>
                    </div>
                    <div>
                      <strong>Total Amount:</strong><br />
                      ₹{Math.round(selectedLoanForHistory.amount).toLocaleString('en-IN')}
                    </div>
                    <div>
                      <strong>Total Paid:</strong><br />
                      ₹{Math.round(selectedLoanForHistory.totalPaid || 0).toLocaleString('en-IN')}
                    </div>
                    <div>
                      <strong>Balance:</strong><br />
                      <span style={{ color: selectedLoanForHistory.balanceAmount > 0 ? '#EF4444' : '#10B981' }}>
                        ₹{Math.round(selectedLoanForHistory.balanceAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                ) : (
                  // On Behalf History
                  <>
                    <div>
                      <strong>Entry Type:</strong><br />
                      <span style={{ color: '#8B5CF6' }}>On Behalf Payment</span>
                    </div>
                    <div>
                      <strong>Amount Paid:</strong><br />
                      ₹{Math.round(selectedLoanForHistory.amountPaid).toLocaleString('en-IN')}
                    </div>
                    <div>
                      <strong>Total Received:</strong><br />
                      ₹{Math.round(selectedLoanForHistory.totalReceived || 0).toLocaleString('en-IN')}
                    </div>
                    <div>
                      <strong>Balance to Receive:</strong><br />
                      <span style={{ color: selectedLoanForHistory.balanceToReceive > 0 ? '#EF4444' : '#10B981' }}>
                        ₹{Math.round(selectedLoanForHistory.balanceToReceive || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment History Table */}
            <h3 style={{ marginBottom: '16px', color: '#374151' }}>
              {selectedLoanForHistory.nameOfPerson ? 'Payment Records' : 'Receipt Records'}
            </h3>

            {((selectedLoanForHistory.payments && selectedLoanForHistory.payments.length > 0) ||
              (selectedLoanForHistory.receipts && selectedLoanForHistory.receipts.length > 0)) ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Payment Method</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedLoanForHistory.payments || selectedLoanForHistory.receipts || []).map((record, index) => {
                      const isBorrowedType = selectedLoanForHistory.loanType === 'Borrowed';
                      const isLentType = selectedLoanForHistory.loanType === 'Lent';
                      const isOnBehalf = !selectedLoanForHistory.loanType; // On Behalf entries don't have loanType in this mapping

                      // Determine color and label based on record.type
                      // Repayment (Borrowed): I pay money (Green)
                      // Additional Borrowing (Borrowed): I take money (Red)
                      // Repayment (Lent): They pay me (Green)
                      // Additional Lending (Lent): I give more (Red)
                      const isPositiveChange =
                        record.type === 'Repayment' ||
                        record.type === 'Receipt' ||
                        (!record.type && (isBorrowedType || isLentType || isOnBehalf)); // Fallback for old records

                      const color = isPositiveChange ? '#10B981' : '#EF4444';
                      const typeLabel = record.type ? ` (${record.type})` : '';

                      return (
                        <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontSize: '14px' }}>
                            {new Date(record.date).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px', color: color, fontWeight: '500' }}>
                            {isPositiveChange ? '+' : '-'} ₹{Math.round(record.amount).toLocaleString('en-IN')}
                            {typeLabel && (
                              <span style={{ fontSize: '10px', display: 'block', color: '#64748b' }}>
                                {record.type}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>
                            {record.paymentDetails || '-'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '14px' }}>
                            {record.comments || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                fontSize: '16px'
              }}>
                {selectedLoanForHistory.nameOfPerson ? 'No payments recorded yet' : 'No receipts recorded yet'}
              </div>
            )}

            {/* Summary Stats */}
            {((selectedLoanForHistory.payments && selectedLoanForHistory.payments.length > 0) ||
              (selectedLoanForHistory.receipts && selectedLoanForHistory.receipts.length > 0)) && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  borderLeft: '4px solid #2563EB'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '14px' }}>
                    {selectedLoanForHistory.nameOfPerson ? (
                      // Loan Stats
                      <>
                        <div>
                          <strong>Total Payments:</strong><br />
                          {selectedLoanForHistory.payments?.length || 0} transactions
                        </div>
                        <div>
                          <strong>Last Payment:</strong><br />
                          {selectedLoanForHistory.payments && selectedLoanForHistory.payments.length > 0 ?
                            new Date(Math.max(...selectedLoanForHistory.payments.map(p => new Date(p.date)))).toLocaleDateString('en-IN') :
                            'No payments yet'
                          }
                        </div>
                        <div>
                          <strong>Payment Progress:</strong><br />
                          {Math.round((selectedLoanForHistory.totalPaid / selectedLoanForHistory.amount) * 100)}% completed
                        </div>
                      </>
                    ) : (
                      // On Behalf Stats
                      <>
                        <div>
                          <strong>Total Receipts:</strong><br />
                          {selectedLoanForHistory.receipts?.length || 0} transactions
                        </div>
                        <div>
                          <strong>Last Receipt:</strong><br />
                          {selectedLoanForHistory.receipts && selectedLoanForHistory.receipts.length > 0 ?
                            new Date(Math.max(...selectedLoanForHistory.receipts.map(r => new Date(r.date)))).toLocaleDateString('en-IN') :
                            'No receipts yet'
                          }
                        </div>
                        <div>
                          <strong>Receipt Progress:</strong><br />
                          {Math.round((selectedLoanForHistory.totalReceived / selectedLoanForHistory.amountPaid) * 100)}% completed
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={() => setShowPaymentHistory(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanLedger;
