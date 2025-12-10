import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { investmentProfileAPI } from '../utils/investmentProfileAPI';
import './Modal.css';

const InsuranceProfileModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    nameOfInsurer: '',
    nameOfPolicy: '',
    insuranceType: '',
    policyNumber: '',
    url: '',
    loginUserId: '',
    password: '',
    telNo: '',
    tollFreeNo: '',
    emailId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        nameOfInsurer: '',
        nameOfPolicy: '',
        insuranceType: '',
        policyNumber: '',
        url: '',
        loginUserId: '',
        password: '',
        telNo: '',
        tollFreeNo: '',
        emailId: ''
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
        await investmentProfileAPI.updateInsurance(editData._id, formData);
      } else {
        await investmentProfileAPI.createInsurance(formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving insurance:', error);
      setError(error.response?.data?.message || 'Failed to save insurance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? 'Edit Insurance' : 'Add Insurance'}</h2>
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
              <label>Name of Insurer *</label>
              <input
                type="text"
                name="nameOfInsurer"
                value={formData.nameOfInsurer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Name of Policy *</label>
              <input
                type="text"
                name="nameOfPolicy"
                value={formData.nameOfPolicy}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Insurance Type *</label>
              <select
                name="insuranceType"
                value={formData.insuranceType}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Life">Life</option>
                <option value="Health">Health</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Property">Property</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Policy Number *</label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
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
              <label>Tel No.</label>
              <input
                type="tel"
                name="telNo"
                value={formData.telNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Toll Free No.</label>
              <input
                type="tel"
                name="tollFreeNo"
                value={formData.tollFreeNo}
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

export default InsuranceProfileModal;
