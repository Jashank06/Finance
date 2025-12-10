import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { investmentProfileAPI } from '../utils/investmentProfileAPI';
import './Modal.css';

const PaymentGatewayModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    url: '',
    login: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        url: '',
        login: '',
        password: ''
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
        await investmentProfileAPI.updatePaymentGateway(editData._id, formData);
      } else {
        await investmentProfileAPI.createPaymentGateway(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving payment gateway:', error);
      setError(error.response?.data?.message || 'Failed to save payment gateway');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? 'Edit Payment Gateway' : 'Add Payment Gateway'}</h2>
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
          <div className="form-group">
            <label>URL *</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>Login *</label>
            <input
              type="text"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
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

export default PaymentGatewayModal;
