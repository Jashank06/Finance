import { useEffect, useMemo, useRef, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiTrendingUp, FiActivity, FiUsers, FiArrowUpRight, FiArrowDownLeft, FiCreditCard } from 'react-icons/fi';
import { investmentAPI } from '../../../utils/investmentAPI';
import '../../investments/Investment.css';

const LoanLedger = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showOnBehalfForm, setShowOnBehalfForm] = useState(false);
  const formRef = useRef(null);
  const [loanEntries, setLoanEntries] = useState([]);
  const [paymentEntries, setPaymentEntries] = useState([]);
  const [onBehalfEntries, setOnBehalfEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  
  // Loan Form State
  const [loanInputs, setLoanInputs] = useState({
    date: new Date().toISOString().slice(0, 10),
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

  useEffect(() => {
    if ((showForm || showPaymentForm || showOnBehalfForm) && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showForm, showPaymentForm, showOnBehalfForm]);

  // Demo data for development
  useEffect(() => {
    setLoanEntries([
      {
        _id: 'loan1',
        date: '2024-01-15',
        nameOfPerson: 'Rahul Kumar',
        forPurpose: 'Business Investment',
        amount: 100000,
        finalDateOfReturn: '2024-06-15',
        paymentDetails: 'Bank Transfer',
        comments: 'Emergency business loan',
        totalPaid: 30000,
        balanceAmount: 70000,
        payments: [
          { date: '2024-02-15', amount: 20000, paymentDetails: 'Cash', comments: 'First installment' },
          { date: '2024-03-15', amount: 10000, paymentDetails: 'UPI', comments: 'Second installment' }
        ]
      },
      {
        _id: 'loan2',
        date: '2024-02-10',
        nameOfPerson: 'Priya Singh',
        forPurpose: 'Medical Emergency',
        amount: 50000,
        finalDateOfReturn: '2024-08-10',
        paymentDetails: 'UPI',
        comments: 'Medical treatment loan',
        totalPaid: 15000,
        balanceAmount: 35000,
        payments: [
          { date: '2024-03-10', amount: 15000, paymentDetails: 'Bank Transfer', comments: 'Partial payment' }
        ]
      }
    ]);
    
    setOnBehalfEntries([
      {
        _id: 'behalf1',
        date: '2024-01-20',
        paidOnBehalfOf: 'Amit Sharma',
        amountPaid: 25000,
        forPurpose: 'Rent Payment',
        paymentDetails: 'Bank Transfer',
        receivedAmount: 25000,
        dateOfReceipt: '2024-01-25',
        receiptPaymentDetails: 'Cash',
        comments: 'Emergency rent payment for friend'
      }
    ]);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const totalLent = loanEntries.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
    const totalPaid = loanEntries.reduce((sum, loan) => sum + Number(loan.totalPaid || 0), 0);
    const totalBalance = totalLent - totalPaid;
    const totalOnBehalf = onBehalfEntries.reduce((sum, entry) => sum + Number(entry.amountPaid || 0), 0);
    const totalReceived = onBehalfEntries.reduce((sum, entry) => sum + Number(entry.receivedAmount || 0), 0);
    
    return {
      totalLent,
      totalPaid,
      totalBalance,
      totalOnBehalf,
      totalReceived,
      count: loanEntries.length
    };
  }, [loanEntries, onBehalfEntries]);

  // Loan form handlers
  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const newLoan = {
        ...loanInputs,
        _id: Date.now().toString(),
        amount: Number(loanInputs.amount),
        totalPaid: 0,
        balanceAmount: Number(loanInputs.amount),
        payments: []
      };
      setLoanEntries(prev => [...prev, newLoan]);
      setLoanInputs({
        date: new Date().toISOString().slice(0, 10),
        nameOfPerson: '',
        forPurpose: '',
        amount: '',
        finalDateOfReturn: '',
        paymentDetails: '',
        comments: ''
      });
      setShowForm(false);
    } catch (error) {
      alert('Error saving loan record');
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
      
      setLoanEntries(prev => prev.map(loan => {
        if (loan._id === selectedLoanId) {
          const newTotalPaid = (loan.totalPaid || 0) + paymentAmount;
          const newBalance = loan.amount - newTotalPaid;
          return {
            ...loan,
            totalPaid: newTotalPaid,
            balanceAmount: newBalance,
            payments: [...(loan.payments || []), {
              date: paymentInputs.dateOfReturn,
              amount: paymentAmount,
              paymentDetails: paymentInputs.paymentDetails,
              comments: paymentInputs.comments
            }]
          };
        }
        return loan;
      }));
      
      setPaymentInputs({
        dateOfReturn: new Date().toISOString().slice(0, 10),
        amountReturned: '',
        paymentDetails: '',
        comments: ''
      });
      setSelectedLoanId('');
      setShowPaymentForm(false);
    } catch (error) {
      alert('Error saving payment record');
    } finally {
      setSaving(false);
    }
  };

  // On behalf form handlers
  const handleOnBehalfSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const newOnBehalfEntry = {
        ...onBehalfInputs,
        _id: Date.now().toString(),
        amountPaid: Number(onBehalfInputs.amountPaid),
        receivedAmount: Number(onBehalfInputs.receivedAmount || 0)
      };
      setOnBehalfEntries(prev => [...prev, newOnBehalfEntry]);
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
    } catch (error) {
      alert('Error saving on behalf record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Delete this record?')) {
      try {
        if (type === 'loan') {
          setLoanEntries(prev => prev.filter(loan => loan._id !== id));
        } else if (type === 'onBehalf') {
          setOnBehalfEntries(prev => prev.filter(entry => entry._id !== id));
        }
      } catch (error) {
        alert('Error deleting record');
      }
    }
  };


  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Loan Ledger</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Loan'}
          </button>
          <button className="btn-success" onClick={() => setShowPaymentForm(!showPaymentForm)}>
            <FiArrowDownLeft /> {showPaymentForm ? 'Cancel' : 'Add Payment'}
          </button>
          <button className="btn-secondary" onClick={() => setShowOnBehalfForm(!showOnBehalfForm)}>
            <FiCreditCard /> {showOnBehalfForm ? 'Cancel' : 'On Behalf'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Lent</p>
            <h3 className="stat-value">₹{Math.round(totals.totalLent).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Paid</p>
            <h3 className="stat-value">₹{Math.round(totals.totalPaid).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Balance</p>
            <h3 className="stat-value">₹{Math.round(totals.totalBalance).toLocaleString('en-IN')}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
            <FiUsers />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Loans</p>
            <h3 className="stat-value">{totals.count}</h3>
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
                  <td>{loan.date}</td>
                  <td>{loan.nameOfPerson}</td>
                  <td>{loan.forPurpose}</td>
                  <td>₹{Math.round(loan.amount).toLocaleString('en-IN')}</td>
                  <td>{loan.finalDateOfReturn}</td>
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
                  <th>Received</th>
                  <th>Receipt Date</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {onBehalfEntries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.date}</td>
                    <td>{entry.paidOnBehalfOf}</td>
                    <td>₹{Math.round(entry.amountPaid).toLocaleString('en-IN')}</td>
                    <td>{entry.forPurpose}</td>
                    <td>₹{Math.round(entry.receivedAmount || 0).toLocaleString('en-IN')}</td>
                    <td>{entry.dateOfReceipt}</td>
                    <td>{entry.comments}</td>
                    <td>
                      <div className="investment-actions">
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

      {/* Loan Form */}
      {showForm && (
        <div ref={formRef} className="investment-form-card">
          <h2>Add Loan Entry</h2>
          <form className="investment-form" onSubmit={handleLoanSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label>Date *</label>
                <input type="date" value={loanInputs.date} onChange={(e) => setLoanInputs({ ...loanInputs, date: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Name of Person *</label>
                <input type="text" value={loanInputs.nameOfPerson} onChange={(e) => setLoanInputs({ ...loanInputs, nameOfPerson: e.target.value })} required />
              </div>
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
    </div>
  );
};

export default LoanLedger;
