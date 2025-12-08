import { useMemo, useState, useEffect } from 'react';
import { investmentAPI } from '../../utils/investmentAPI';
import './LoanAmortization.css';

const LoanAmortization = () => {
  const [view, setView] = useState('calculator'); // 'calculator' or 'manage'
  const [savedLoans, setSavedLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loanName, setLoanName] = useState('');
  const [managedExtraPayments, setManagedExtraPayments] = useState({});
  const [editingInterestRate, setEditingInterestRate] = useState(false);
  const [newInterestRate, setNewInterestRate] = useState(0);
  
  const [inputs, setInputs] = useState({
    principal: 10000,
    annualRate: 5.51,
    tenureYears: 10,
    startDate: '2025-04-23',
  });
  
  const [extraPayments, setExtraPayments] = useState({});

  const schedule = useMemo(() => {
    const n = inputs.tenureYears * 12;
    const r = inputs.annualRate / 100 / 12;
    const emi = r === 0 ? inputs.principal / n : inputs.principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const rows = [];
    let balance = inputs.principal;
    let totalInterest = 0;
    let totalExtraPaid = 0;
    
    const startDate = new Date(inputs.startDate);
    
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      let principalPaid = emi - interest;
      
      // Add extra payment if any
      const extraPayment = extraPayments[m] || 0;
      principalPaid += extraPayment;
      totalExtraPaid += extraPayment;
      
      if (principalPaid > balance) principalPaid = balance;
      balance = balance - principalPaid;
      totalInterest += interest;
      
      // Calculate payment date
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + m);
      
      const beginningBalance = m === 1 ? inputs.principal : rows[m - 2].endingBalance;
      
      rows.push({
        paymentNumber: m,
        paymentDate: paymentDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/'),
        beginningBalance: beginningBalance,
        payment: emi,
        extraPayment: extraPayment,
        principal: principalPaid - extraPayment,
        interest: interest,
        endingBalance: balance,
        totalPayment: emi + extraPayment
      });
      
      if (balance <= 0) break;
    }
    
    const totalCost = inputs.principal + totalInterest;
    
    return {
      rows,
      monthlyPayment: emi,
      numberOfPayments: rows.length,
      totalInterest: totalInterest,
      totalCost: totalCost,
      totalExtraPaid: totalExtraPaid
    };
  }, [inputs, extraPayments]);
  
  useEffect(() => {
    if (view === 'manage') {
      fetchSavedLoans();
    }
  }, [view]);

  useEffect(() => {
    console.log('savedLoans state changed:', savedLoans);
  }, [savedLoans]);
  
  const fetchSavedLoans = async () => {
    try {
      setLoading(true);
      const response = await investmentAPI.getLoans();
      console.log('API Response:', response);
      console.log('Setting savedLoans to:', response.data.loans || []);
      setSavedLoans(response.data.loans || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setSavedLoans([]);
    } finally {
      setLoading(false);
    }
  };
  
  const saveLoan = async () => {
    if (!loanName.trim()) {
      alert('Please enter loan name');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare payment schedule with dates as Date objects
      const paymentSchedule = schedule.rows.map(row => ({
        paymentNumber: row.paymentNumber,
        paymentDate: new Date(row.paymentDate.split('/').reverse().join('-')),
        beginningBalance: row.beginningBalance,
        payment: row.payment,
        principal: row.principal,
        interest: row.interest,
        extraPayment: row.extraPayment || 0,
        endingBalance: row.endingBalance,
        isPaid: false
      }));
      
      const maturityDate = new Date(inputs.startDate);
      maturityDate.setMonth(maturityDate.getMonth() + schedule.numberOfPayments);
      
      const payload = {
        category: 'loan-amortization',
        type: 'Loan',
        name: loanName,
        amount: inputs.principal,
        interestRate: inputs.annualRate,
        startDate: inputs.startDate,
        maturityDate: maturityDate.toISOString().slice(0, 10),
        frequency: 'monthly',
        notes: JSON.stringify({ tenureYears: inputs.tenureYears }),
        paymentSchedule: paymentSchedule
      };
      
      const response = await investmentAPI.create(payload);
      console.log('Save Response:', response);
      alert('Loan saved successfully!');
      setLoanName('');
      // Refetch loans after saving
      await fetchSavedLoans();
      setView('manage');
    } catch (error) {
      alert('Error saving loan: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };
  
  const handleExtraPaymentChange = (paymentNumber, value) => {
    const numValue = parseFloat(value) || 0;
    setExtraPayments(prev => ({
      ...prev,
      [paymentNumber]: numValue
    }));
  };
  
  const togglePaymentStatus = async (loanId, paymentNumber, currentStatus) => {
    try {
      await investmentAPI.updatePaymentStatus(loanId, paymentNumber, {
        isPaid: !currentStatus,
        paidDate: !currentStatus ? new Date().toISOString() : null,
        paidAmount: null
      });
      
      // Refresh the selected loan
      const response = await investmentAPI.getById(loanId);
      setSelectedLoan(response.data.investment);
    } catch (error) {
      alert('Error updating payment: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const loadLoan = async (loanId) => {
    try {
      const response = await investmentAPI.getById(loanId);
      setSelectedLoan(response.data.investment);
      setManagedExtraPayments({});
      setEditingInterestRate(false);
      setNewInterestRate(response.data.investment.interestRate);
    } catch (error) {
      alert('Error loading loan: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const deleteLoan = async (loanId, loanName) => {
    if (!confirm(`Are you sure you want to delete "${loanName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await investmentAPI.delete(loanId);
      alert('Loan deleted successfully!');
      // Refresh the loans list
      await fetchSavedLoans();
    } catch (error) {
      alert('Error deleting loan: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleManagedExtraPaymentChange = (paymentNumber, value) => {
    const numValue = parseFloat(value) || 0;
    setManagedExtraPayments(prev => ({
      ...prev,
      [paymentNumber]: numValue
    }));
  };
  
  const saveExtraPayments = async () => {
    if (!selectedLoan) return;
    
    try {
      // Update only the extra payment values in the existing schedule
      const scheduleWithExtras = selectedLoan.paymentSchedule.map(payment => {
        const extraPayment = managedExtraPayments[payment.paymentNumber];
        if (extraPayment !== undefined && extraPayment > 0) {
          return { ...payment, extraPayment };
        }
        return payment;
      });
      
      await investmentAPI.update(selectedLoan._id, {
        paymentSchedule: scheduleWithExtras
      });
      
      alert('Extra payments saved successfully!');
      // Reload the loan
      await loadLoan(selectedLoan._id);
    } catch (error) {
      alert('Error saving extra payments: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const recalculateScheduleWithExtras = (loan, extraPayments) => {
    if (!loan || !loan.paymentSchedule || loan.paymentSchedule.length === 0) return [];
    
    const originalSchedule = loan.paymentSchedule;
    
    // If no extra payments input, return saved schedule as-is from database
    if (!extraPayments || Object.keys(extraPayments).length === 0) {
      return originalSchedule;
    }
    
    // Check if any extra payment is different from saved value
    const hasChanges = Object.keys(extraPayments).some(paymentNum => {
      const idx = parseInt(paymentNum) - 1;
      const savedExtra = originalSchedule[idx]?.extraPayment || 0;
      return extraPayments[paymentNum] !== savedExtra;
    });
    
    // If no changes detected, return saved schedule
    if (!hasChanges) {
      return originalSchedule;
    }
    
    // Only recalculate if extra payments are being modified
    const r = loan.interestRate / 100 / 12;
    const newSchedule = [];
    let balance = loan.amount;
    
    for (let i = 0; i < originalSchedule.length; i++) {
      const paymentNumber = i + 1;
      const originalPayment = originalSchedule[i];
      
      if (balance <= 0.01) break;
      
      const interest = balance * r;
      const emi = originalPayment.payment; // Use saved EMI
      const extraPayment = extraPayments[paymentNumber] !== undefined 
        ? extraPayments[paymentNumber] 
        : (originalPayment.extraPayment || 0);
      
      let principalPaid = emi - interest + extraPayment;
      if (principalPaid > balance) principalPaid = balance;
      
      const beginningBalance = balance;
      balance = balance - principalPaid;
      
      newSchedule.push({
        paymentNumber,
        paymentDate: originalPayment.paymentDate,
        beginningBalance: beginningBalance,
        payment: emi,
        extraPayment: extraPayment,
        principal: principalPaid - extraPayment,
        interest: interest,
        endingBalance: balance,
        isPaid: originalPayment.isPaid,
        paidDate: originalPayment.paidDate,
        paidAmount: originalPayment.paidAmount
      });
    }
    
    return newSchedule;
  };
  
  const updateInterestRate = async () => {
    if (!selectedLoan) return;
    
    if (newInterestRate === selectedLoan.interestRate) {
      alert('Interest rate is the same as the current rate');
      setEditingInterestRate(false);
      return;
    }
    
    if (newInterestRate <= 0 || newInterestRate > 100) {
      alert('Please enter a valid interest rate between 0 and 100');
      return;
    }
    
    if (!confirm(`Are you sure you want to change the interest rate from ${selectedLoan.interestRate}% to ${newInterestRate}%? This will recalculate the EMI and all future unpaid payments.`)) {
      return;
    }
    
    try {
      // Find the first unpaid payment
      const schedule = selectedLoan.paymentSchedule || [];
      
      // Find the transition point: last paid payment or current month
      let transitionIndex = -1;
      for (let i = 0; i < schedule.length; i++) {
        if (!schedule[i].isPaid) {
          transitionIndex = i;
          break;
        }
      }
      
      // If all payments are paid, no need to recalculate
      if (transitionIndex === -1) {
        alert('All payments are already completed. No future payments to recalculate.');
        setEditingInterestRate(false);
        return;
      }
      
      // Keep paid payments as-is, recalculate unpaid payments
      const newSchedule = [...schedule];
      const newRate = newInterestRate / 100 / 12;
      
      // Get the balance from the last paid payment or beginning
      let balance = transitionIndex > 0 
        ? schedule[transitionIndex - 1].endingBalance 
        : selectedLoan.amount;
      
      // Calculate remaining tenure (number of unpaid payments)
      const remainingPayments = schedule.length - transitionIndex;
      
      // Calculate new EMI based on new interest rate, remaining balance, and remaining tenure
      const newEmi = newRate === 0 
        ? balance / remainingPayments 
        : balance * newRate * Math.pow(1 + newRate, remainingPayments) / (Math.pow(1 + newRate, remainingPayments) - 1);
      
      // Recalculate future payments with new interest rate and new EMI
      for (let i = transitionIndex; i < schedule.length; i++) {
        if (balance <= 0.01) {
          // Loan is paid off, remove remaining payments
          newSchedule.splice(i);
          break;
        }
        
        const interest = balance * newRate;
        const extraPayment = schedule[i].extraPayment || 0;
        let principalPaid = newEmi - interest + extraPayment;
        
        if (principalPaid > balance) principalPaid = balance;
        
        newSchedule[i] = {
          ...schedule[i],
          beginningBalance: balance,
          payment: newEmi,
          interest: interest,
          principal: principalPaid - extraPayment,
          endingBalance: balance - principalPaid
        };
        
        balance = balance - principalPaid;
      }
      
      // If balance still remains, extend the schedule with new EMI
      if (balance > 0.01) {
        const lastPayment = newSchedule[newSchedule.length - 1];
        const lastDate = new Date(lastPayment.paymentDate);
        let paymentNumber = lastPayment.paymentNumber + 1;
        
        while (balance > 0.01) {
          lastDate.setMonth(lastDate.getMonth() + 1);
          const interest = balance * newRate;
          let principalPaid = newEmi - interest;
          
          if (principalPaid > balance) principalPaid = balance;
          
          newSchedule.push({
            paymentNumber: paymentNumber,
            paymentDate: new Date(lastDate),
            beginningBalance: balance,
            payment: newEmi,
            extraPayment: 0,
            principal: principalPaid,
            interest: interest,
            endingBalance: balance - principalPaid,
            isPaid: false,
            paidDate: null,
            paidAmount: null
          });
          
          balance = balance - principalPaid;
          paymentNumber++;
          
          // Safety check to prevent infinite loop
          if (paymentNumber > schedule.length + 500) break;
        }
      }
      
      // Calculate old and new EMI for comparison
      const oldEmi = schedule[0].payment;
      const firstUnpaidPayment = newSchedule.find(p => !p.isPaid);
      const calculatedNewEmi = firstUnpaidPayment ? firstUnpaidPayment.payment : oldEmi;
      
      // Update the loan with new interest rate and schedule
      await investmentAPI.update(selectedLoan._id, {
        interestRate: newInterestRate,
        paymentSchedule: newSchedule
      });
      
      alert(`Interest rate updated successfully!\n\nOld EMI: ₹${oldEmi.toFixed(2)}\nNew EMI: ₹${calculatedNewEmi.toFixed(2)}\nDifference: ₹${(calculatedNewEmi - oldEmi).toFixed(2)}`);
      setEditingInterestRate(false);
      await loadLoan(selectedLoan._id);
    } catch (error) {
      alert('Error updating interest rate: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="loan-calculator-container">
      <div className="loan-header-section">
        <h1 className="loan-main-title">Loan Management</h1>
        <div className="view-tabs">
          <button 
            className={`tab-btn ${view === 'calculator' ? 'active' : ''}`}
            onClick={() => setView('calculator')}
          >
            Calculator
          </button>
          <button 
            className={`tab-btn ${view === 'manage' ? 'active' : ''}`}
            onClick={() => {
              setView('manage');
              setSelectedLoan(null);
            }}
          >
            Manage Loans
          </button>
        </div>
      </div>
      
      {view === 'calculator' && (
        <>
      <div className="loan-content">
        {/* Loan Details Section */}
        <div className="loan-details-section">
          <h2 className="section-title">Loan Details</h2>
          <div className="loan-form">
            <div className="form-group">
              <label>Loan amount</label>
              <input
                type="number"
                value={inputs.principal}
                onChange={(e) => setInputs({ ...inputs, principal: Number(e.target.value) })}
              />
            </div>
            
            <div className="form-group">
              <label>Annual interest rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={inputs.annualRate}
                onChange={(e) => setInputs({ ...inputs, annualRate: Number(e.target.value) })}
              />
            </div>
            
            <div className="form-group">
              <label>Loan period in years</label>
              <input
                type="number"
                value={inputs.tenureYears}
                onChange={(e) => setInputs({ ...inputs, tenureYears: Number(e.target.value) })}
              />
            </div>
            
            <div className="form-group">
              <label>Start date of loan</label>
              <input
                type="date"
                value={inputs.startDate}
                onChange={(e) => setInputs({ ...inputs, startDate: e.target.value })}
              />
            </div>
            
            <button className="calculate-btn">Calculate</button>
          </div>
        </div>
        
        {/* Loan Summary Section */}
        <div className="loan-summary-section">
          <h2 className="section-title">Loan Summary</h2>
          <div className="summary-content">
            <div className="summary-row">
              <span className="summary-label">Monthly payment</span>
              <span className="summary-value">₹{schedule.monthlyPayment.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Number of payments</span>
              <span className="summary-value">{schedule.numberOfPayments}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Total interest</span>
              <span className="summary-value">₹{schedule.totalInterest.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span className="summary-label">Total cost of loan</span>
              <span className="summary-value">₹{schedule.totalCost.toFixed(2)}</span>
            </div>
            
            {schedule.totalExtraPaid > 0 && (
              <div className="summary-row highlight">
                <span className="summary-label">Total extra payments</span>
                <span className="summary-value">₹{schedule.totalExtraPaid.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Save Loan Section */}
      <div className="save-loan-section">
        <input
          type="text"
          className="loan-name-input"
          placeholder="Enter loan name to save..."
          value={loanName}
          onChange={(e) => setLoanName(e.target.value)}
        />
        <button 
          className="save-loan-btn"
          onClick={saveLoan}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Loan'}
        </button>
      </div>
      
      {/* Amortization Schedule */}
      <div className="amortization-schedule">
        <div className="schedule-header">
          <h2 className="schedule-title">Amortization Schedule</h2>
          {Object.keys(extraPayments).length > 0 && (
            <button 
              className="clear-extra-btn"
              onClick={() => setExtraPayments({})}
            >
              Clear Extra Payments
            </button>
          )}
        </div>
        <div className="table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>PMT NO.</th>
                <th>PAYMENT DATE</th>
                <th>BEGINNING BALANCE</th>
                <th>PAYMENT</th>
                <th>EXTRA PAYMENT</th>
                <th>PRINCIPAL</th>
                <th>INTEREST</th>
                <th>ENDING BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {schedule.rows.map((row) => (
                <tr key={row.paymentNumber}>
                  <td>{row.paymentNumber}</td>
                  <td>{row.paymentDate}</td>
                  <td>₹{row.beginningBalance.toFixed(2)}</td>
                  <td>₹{row.payment.toFixed(2)}</td>
                  <td className="extra-payment-cell">
                    <input
                      type="number"
                      className="extra-payment-input"
                      placeholder="0"
                      value={extraPayments[row.paymentNumber] || ''}
                      onChange={(e) => handleExtraPaymentChange(row.paymentNumber, e.target.value)}
                    />
                  </td>
                  <td>₹{row.principal.toFixed(2)}</td>
                  <td>₹{row.interest.toFixed(2)}</td>
                  <td>₹{row.endingBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
      
      {view === 'manage' && (
        <div className="manage-loans-view">
          {loading ? (
            <div className="loading-state">
              <p>Loading loans...</p>
            </div>
          ) : !selectedLoan ? (
            // Loans List
            <div className="loans-list-section">
              <h2 className="section-heading">Your Loans</h2>
              {console.log('Rendering savedLoans:', savedLoans)}
              {!savedLoans || savedLoans.length === 0 ? (
                <div className="empty-state">
                  <p>No saved loans yet. Create one from the Calculator tab.</p>
                </div>
              ) : (
                <div className="loans-table-container">
                  <table className="loans-table">
                    <thead>
                      <tr>
                        <th>LOAN NAME</th>
                        <th>TYPE</th>
                        <th>LOAN AMOUNT</th>
                        <th>INTEREST RATE</th>
                        <th>MONTHLY EMI</th>
                        <th>PAID/TOTAL</th>
                        <th>PROGRESS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedLoans.map((loan) => {
                        const progressPercent = ((loan.paidPayments / loan.totalPayments) * 100).toFixed(1);
                        return (
                          <tr key={loan._id}>
                            <td className="loan-name-cell">{loan.name}</td>
                            <td>{loan.type}</td>
                            <td>₹{loan.amount.toLocaleString('en-IN')}</td>
                            <td>{loan.interestRate}%</td>
                            <td>₹{loan.monthlyPayment.toFixed(2)}</td>
                            <td>{loan.paidPayments}/{loan.totalPayments}</td>
                            <td>
                              <div className="progress-cell">
                                <div className="progress-bar-small">
                                  <div 
                                    className="progress-fill-small"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="progress-text-small">{progressPercent}%</span>
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="view-loan-btn"
                                  onClick={() => loadLoan(loan._id)}
                                >
                                  View
                                </button>
                                <button 
                                  className="delete-loan-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteLoan(loan._id, loan.name);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            // Loan Detail with Payment Schedule
            <div className="loan-detail-section">
              <div className="detail-header">
                <button className="back-btn" onClick={() => {
                  setSelectedLoan(null);
                  setManagedExtraPayments({});
                }}>
                  ← Back to Loans
                </button>
                <h2>{selectedLoan.name}</h2>
              </div>
              
              {(() => {
                const recalculatedSchedule = recalculateScheduleWithExtras(selectedLoan, managedExtraPayments);
                const originalPayments = selectedLoan.paymentSchedule?.length || 0;
                const newPayments = recalculatedSchedule.length;
                const paymentsSaved = originalPayments - newPayments;
                
                return (
                  <>
                    <div className="loan-summary-grid">
                      <div className="summary-card">
                        <span>Total Amount</span>
                        <strong>₹{selectedLoan.amount.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="summary-card">
                        <span>Interest Rate</span>
                        {editingInterestRate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={newInterestRate}
                              onChange={(e) => setNewInterestRate(parseFloat(e.target.value) || 0)}
                              style={{ 
                                width: '80px', 
                                padding: '4px 8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                            <span>%</span>
                            <button 
                              onClick={updateInterestRate}
                              style={{
                                padding: '4px 12px',
                                fontSize: '12px',
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => {
                                setEditingInterestRate(false);
                                setNewInterestRate(selectedLoan.interestRate);
                              }}
                              style={{
                                padding: '4px 12px',
                                fontSize: '12px',
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{selectedLoan.interestRate}%</strong>
                            <button 
                              onClick={() => setEditingInterestRate(true)}
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="summary-card">
                        <span>Monthly EMI</span>
                        <strong>₹{(() => {
                          // Show current EMI: first unpaid payment's EMI, or first payment if all paid
                          const firstUnpaid = selectedLoan.paymentSchedule?.find(p => !p.isPaid);
                          return (firstUnpaid?.payment || selectedLoan.paymentSchedule?.[0]?.payment || 0).toFixed(2);
                        })()}</strong>
                      </div>
                      <div className="summary-card">
                        <span>Payments Done</span>
                        <strong>{selectedLoan.paymentSchedule?.filter(p => p.isPaid).length || 0}/{originalPayments}</strong>
                      </div>
                      {paymentsSaved > 0 && (
                        <div className="summary-card highlight">
                          <span>Payments Saved</span>
                          <strong>{paymentsSaved} months</strong>
                        </div>
                      )}
                    </div>
              
              <div className="payment-schedule-section">
                <div className="schedule-header">
                  <h3>Payment Schedule</h3>
                  <div>
                    {Object.keys(managedExtraPayments).length > 0 && (
                      <>
                        <button 
                          className="save-extra-btn"
                          onClick={saveExtraPayments}
                        >
                          Save Extra Payments
                        </button>
                        <button 
                          className="clear-extra-btn"
                          onClick={() => setManagedExtraPayments({})}
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="table-container">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>PAID</th>
                        <th>PMT NO.</th>
                        <th>DATE</th>
                        <th>BEGINNING</th>
                        <th>PAYMENT</th>
                        <th>EXTRA PAYMENT</th>
                        <th>PRINCIPAL</th>
                        <th>INTEREST</th>
                        <th>ENDING</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recalculatedSchedule.map((payment) => {
                        const paymentDate = new Date(payment.paymentDate);
                        const currentDate = new Date();
                        const isCurrentOrPast = paymentDate <= currentDate;
                        
                        return (
                          <tr key={payment.paymentNumber} className={payment.isPaid ? 'paid-row' : ''}>
                            <td>
                              <input
                                type="checkbox"
                                className="payment-checkbox"
                                checked={payment.isPaid}
                                onChange={() => togglePaymentStatus(selectedLoan._id, payment.paymentNumber, payment.isPaid)}
                                disabled={!isCurrentOrPast}
                              />
                            </td>
                            <td>{payment.paymentNumber}</td>
                            <td>{paymentDate.toLocaleDateString('en-IN')}</td>
                            <td>₹{payment.beginningBalance.toFixed(2)}</td>
                            <td>₹{payment.payment.toFixed(2)}</td>
                            <td className="extra-payment-cell">
                              <input
                                type="number"
                                className="extra-payment-input"
                                placeholder="0"
                                value={managedExtraPayments[payment.paymentNumber] || payment.extraPayment || ''}
                                onChange={(e) => handleManagedExtraPaymentChange(payment.paymentNumber, e.target.value)}
                              />
                            </td>
                            <td>₹{payment.principal.toFixed(2)}</td>
                            <td>₹{payment.interest.toFixed(2)}</td>
                            <td>₹{payment.endingBalance.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanAmortization;
