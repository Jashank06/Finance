import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { investmentProfileAPI } from '../utils/investmentProfileAPI';
import './Modal.css';

const CardDetailModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    name: '',
    typeOfAccount: '',
    bank: '',
    atmPin: '',
    accountNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
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
        typeOfAccount: '',
        bank: '',
        atmPin: '',
        accountNumber: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
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
        await investmentProfileAPI.updateCardDetail(editData._id, formData);
      } else {
        await investmentProfileAPI.createCardDetail(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving card detail:', error);
      setError(error.response?.data?.message || 'Failed to save card detail');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? 'Edit Card Detail' : 'Add Card Detail'}</h2>
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
              <label>Type of Account *</label>
              <select
                name="typeOfAccount"
                value={formData.typeOfAccount}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Prepaid Card">Prepaid Card</option>
              </select>
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
              <label>ATM Pin</label>
              <input
                type="password"
                name="atmPin"
                value={formData.atmPin}
                onChange={handleChange}
                maxLength="4"
              />
            </div>

            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Card Number *</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                required
                maxLength="16"
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="month"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CVV</label>
              <input
                type="password"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                maxLength="3"
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

export default CardDetailModal;
