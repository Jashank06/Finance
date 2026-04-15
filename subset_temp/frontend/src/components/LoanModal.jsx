import { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import { investmentValuationAPI } from '../utils/investmentValuationAPI';
import './Modal.css';

const LoanModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    debtorName: '',
    companyName: '',
    loanType: 'home-loan',
    commencementDate: new Date().toISOString().split('T')[0],
    closureDate: '',
    emiAmount: '',
    emiDate: '',
    principalAmount: '',
    interestAmount: '0',
    penalty: '0',
    balance: '',
    interestRate: '',
    tenure: '',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        commencementDate: editData.commencementDate ? editData.commencementDate.split('T')[0] : new Date().toISOString().split('T')[0],
        closureDate: editData.closureDate ? editData.closureDate.split('T')[0] : '',
        interestAmount: editData.interestAmount || '0',
        penalty: editData.penalty || '0'
      });
    } else {
      setFormData({
        debtorName: '',
        companyName: '',
        loanType: 'home-loan',
        commencementDate: new Date().toISOString().split('T')[0],
        closureDate: '',
        emiAmount: '',
        emiDate: '',
        principalAmount: '',
        interestAmount: '0',
        penalty: '0',
        balance: '',
        interestRate: '',
        tenure: '',
        status: 'active'
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-set balance to principal amount if not manually changed
    if (name === 'principalAmount' && !editData) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        balance: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.debtorName.trim()) newErrors.debtorName = 'Name of Debtor is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Name of Company/Bank is required';
    if (!formData.emiAmount) newErrors.emiAmount = 'EMI Amount is required';
    if (!formData.emiDate.trim()) newErrors.emiDate = 'EMI Date is required';
    if (!formData.principalAmount) newErrors.principalAmount = 'Principal Amount is required';
    if (!formData.balance) newErrors.balance = 'Balance is required';
    if (!formData.interestRate) newErrors.interestRate = 'Interest Rate is required';
    if (!formData.tenure) newErrors.tenure = 'Tenure is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        emiAmount: parseFloat(formData.emiAmount),
        principalAmount: parseFloat(formData.principalAmount),
        interestAmount: parseFloat(formData.interestAmount) || 0,
        penalty: parseFloat(formData.penalty) || 0,
        balance: parseFloat(formData.balance),
        interestRate: parseFloat(formData.interestRate),
        tenure: parseInt(formData.tenure),
        interestPaid: editData?.interestPaid || 0,
        totalEmi: editData?.totalEmi || 0
      };

      if (editData) {
        await investmentValuationAPI.updateLoan(editData._id, submitData);
      } else {
        await investmentValuationAPI.createLoan(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving loan:', error);
      setErrors({ submit: 'Failed to save loan. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{editData ? 'Edit' : 'Add'} Loan</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Name of Debtor *</label>
              <input
                type="text"
                name="debtorName"
                value={formData.debtorName}
                onChange={handleChange}
                className={errors.debtorName ? 'error' : ''}
                placeholder="Enter debtor name"
                required
              />
              {errors.debtorName && <span className="error-text">{errors.debtorName}</span>}
            </div>

            <div className="form-field">
              <label>Name of Company/Bank *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={errors.companyName ? 'error' : ''}
                placeholder="e.g., HDFC Bank, SBI"
                required
              />
              {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            </div>

            <div className="form-field">
              <label>Type of Loan *</label>
              <select
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                required
              >
                <option value="home-loan">Home Loan</option>
                <option value="personal-loan">Personal Loan</option>
                <option value="car-loan">Car Loan</option>
                <option value="education-loan">Education Loan</option>
                <option value="business-loan">Business Loan</option>
                <option value="gold-loan">Gold Loan</option>
                <option value="credit-card">Credit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label>Loan Commencement Date *</label>
              <input
                type="date"
                name="commencementDate"
                value={formData.commencementDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Loan Closure Date</label>
              <input
                type="date"
                name="closureDate"
                value={formData.closureDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>EMI Amount *</label>
              <input
                type="number"
                name="emiAmount"
                value={formData.emiAmount}
                onChange={handleChange}
                className={errors.emiAmount ? 'error' : ''}
                placeholder="Enter EMI amount"
                min="0"
                step="0.01"
                required
              />
              {errors.emiAmount && <span className="error-text">{errors.emiAmount}</span>}
            </div>

            <div className="form-field">
              <label>EMI Date *</label>
              <input
                type="text"
                name="emiDate"
                value={formData.emiDate}
                onChange={handleChange}
                className={errors.emiDate ? 'error' : ''}
                placeholder="e.g., 5th, 15th"
                required
              />
              {errors.emiDate && <span className="error-text">{errors.emiDate}</span>}
            </div>

            <div className="form-field">
              <label>Principal Amount *</label>
              <input
                type="number"
                name="principalAmount"
                value={formData.principalAmount}
                onChange={handleChange}
                className={errors.principalAmount ? 'error' : ''}
                placeholder="Enter principal loan amount"
                min="0"
                step="0.01"
                required
              />
              {errors.principalAmount && <span className="error-text">{errors.principalAmount}</span>}
            </div>

            <div className="form-field">
              <label>Interest Amount</label>
              <input
                type="number"
                name="interestAmount"
                value={formData.interestAmount}
                onChange={handleChange}
                placeholder="Enter interest amount"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label>Penalty</label>
              <input
                type="number"
                name="penalty"
                value={formData.penalty}
                onChange={handleChange}
                placeholder="Enter penalty amount"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label>Balance *</label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                className={errors.balance ? 'error' : ''}
                placeholder="Enter current balance"
                min="0"
                step="0.01"
                required
              />
              {errors.balance && <span className="error-text">{errors.balance}</span>}
            </div>

            <div className="form-field">
              <label>Interest Rate (%) *</label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className={errors.interestRate ? 'error' : ''}
                placeholder="Enter interest rate"
                min="0"
                max="100"
                step="0.01"
                required
              />
              {errors.interestRate && <span className="error-text">{errors.interestRate}</span>}
            </div>

            <div className="form-field">
              <label>Tenure (Months) *</label>
              <input
                type="number"
                name="tenure"
                value={formData.tenure}
                onChange={handleChange}
                className={errors.tenure ? 'error' : ''}
                placeholder="Enter tenure in months"
                min="1"
                required
              />
              {errors.tenure && <span className="error-text">{errors.tenure}</span>}
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="overdue">Overdue</option>
                <option value="foreclosed">Foreclosed</option>
              </select>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? <FiLoader className="spinner" /> : <FiSave />}
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;