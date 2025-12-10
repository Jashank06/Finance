import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { investmentProfileAPI } from '../utils/investmentProfileAPI';
import './Modal.css';

const BankAccountModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    accountNumber: '',
    url: '',
    loginUserId: '',
    password: '',
    transactionPassword: '',
    ifsc: '',
    cif: '',
    nominee: '',
    emailId: '',
    mobileNumber: '',
    address: '',
    customerCareNumber: '',
    customerCareEmailId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        name: '',
        bank: '',
        accountNumber: '',
        url: '',
        loginUserId: '',
        password: '',
        transactionPassword: '',
        ifsc: '',
        cif: '',
        nominee: '',
        emailId: '',
        mobileNumber: '',
        address: '',
        customerCareNumber: '',
        customerCareEmailId: ''
      });
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editData) {
        await investmentProfileAPI.updateBankAccount(editData._id, formData);
      } else {
        await investmentProfileAPI.createBankAccount(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving bank account:', error);
      setError(error.response?.data?.message || 'Failed to save bank account');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? 'Edit Bank Account' : 'Add Bank Account'}</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Bank *</label>
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>User ID</label>
              <input
                type="text"
                name="loginUserId"
                value={formData.loginUserId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Transaction Password</label>
              <input
                type="password"
                name="transactionPassword"
                value={formData.transactionPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>IFSC</label>
              <input
                type="text"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CIF</label>
              <input
                type="text"
                name="cif"
                value={formData.cif}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Nominee</label>
              <input
                type="text"
                name="nominee"
                value={formData.nominee}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email ID</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Customer Care Number</label>
              <input
                type="tel"
                name="customerCareNumber"
                value={formData.customerCareNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Customer Care Email ID</label>
              <input
                type="email"
                name="customerCareEmailId"
                value={formData.customerCareEmailId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editData ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountModal;
