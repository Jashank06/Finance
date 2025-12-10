import { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import { investmentValuationAPI } from '../utils/investmentValuationAPI';
import './Modal.css';

const MutualFundModal = ({ isOpen, onClose, onSuccess, editData, investmentType }) => {
  const [formData, setFormData] = useState({
    investmentType: investmentType || 'lumpsum',
    broker: '',
    investorName: '',
    fundName: '',
    fundType: 'equity',
    folioNumber: '',
    sipDate: '',
    sipAmount: '',
    units: '',
    purchaseNAV: '',
    purchaseValue: '',
    currentNAV: '',
    holdingStatus: 'active',
    holdingPattern: 'single',
    investmentDate: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        investmentDate: editData.investmentDate ? editData.investmentDate.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        investmentType: investmentType || 'lumpsum',
        broker: '',
        investorName: '',
        fundName: '',
        fundType: 'equity',
        folioNumber: '',
        sipDate: '',
        sipAmount: '',
        units: '',
        purchaseNAV: '',
        purchaseValue: '',
        currentNAV: '',
        holdingStatus: 'active',
        holdingPattern: 'single',
        investmentDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [editData, investmentType]);

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

    // Auto-calculate purchase value
    if (name === 'units' || name === 'purchaseNAV') {
      const units = name === 'units' ? parseFloat(value) : parseFloat(formData.units);
      const nav = name === 'purchaseNAV' ? parseFloat(value) : parseFloat(formData.purchaseNAV);
      
      if (units && nav) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          purchaseValue: (units * nav).toString()
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.broker.trim()) newErrors.broker = 'Investment Broker is required';
    if (!formData.investorName.trim()) newErrors.investorName = 'Investor Name is required';
    if (!formData.fundName.trim()) newErrors.fundName = 'Fund Name is required';
    if (!formData.folioNumber.trim()) newErrors.folioNumber = 'Folio Number is required';
    if (!formData.units) newErrors.units = 'Number of Units is required';
    if (!formData.purchaseNAV) newErrors.purchaseNAV = 'Purchase NAV is required';
    if (!formData.purchaseValue) newErrors.purchaseValue = 'Purchase Value is required';

    // SIP specific validations
    if (formData.investmentType === 'sip') {
      if (!formData.sipDate.trim()) newErrors.sipDate = 'SIP Date is required';
      if (!formData.sipAmount) newErrors.sipAmount = 'SIP Amount is required';
    }

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
        units: parseFloat(formData.units),
        purchaseNAV: parseFloat(formData.purchaseNAV),
        purchaseValue: parseFloat(formData.purchaseValue),
        currentNAV: parseFloat(formData.currentNAV) || parseFloat(formData.purchaseNAV),
        sipAmount: formData.sipAmount ? parseFloat(formData.sipAmount) : undefined
      };

      if (editData) {
        await investmentValuationAPI.updateMutualFund(editData._id, submitData);
      } else {
        await investmentValuationAPI.createMutualFund(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving mutual fund:', error);
      setErrors({ submit: 'Failed to save mutual fund. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>
            {editData ? 'Edit' : 'Add'} Mutual Fund {formData.investmentType === 'sip' ? 'SIP' : 'Lumpsum'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Investment Type *</label>
              <select
                name="investmentType"
                value={formData.investmentType}
                onChange={handleChange}
                required
              >
                <option value="lumpsum">Lumpsum</option>
                <option value="sip">SIP</option>
              </select>
            </div>

            <div className="form-field">
              <label>Investment Broker *</label>
              <input
                type="text"
                name="broker"
                value={formData.broker}
                onChange={handleChange}
                className={errors.broker ? 'error' : ''}
                placeholder="e.g., Zerodha, HDFC Securities"
                required
              />
              {errors.broker && <span className="error-text">{errors.broker}</span>}
            </div>

            <div className="form-field">
              <label>Investor Name *</label>
              <input
                type="text"
                name="investorName"
                value={formData.investorName}
                onChange={handleChange}
                className={errors.investorName ? 'error' : ''}
                placeholder="Enter investor name"
                required
              />
              {errors.investorName && <span className="error-text">{errors.investorName}</span>}
            </div>

            <div className="form-field">
              <label>Name of Fund *</label>
              <input
                type="text"
                name="fundName"
                value={formData.fundName}
                onChange={handleChange}
                className={errors.fundName ? 'error' : ''}
                placeholder="e.g., HDFC Top 100 Fund"
                required
              />
              {errors.fundName && <span className="error-text">{errors.fundName}</span>}
            </div>

            <div className="form-field">
              <label>Type of Fund *</label>
              <select
                name="fundType"
                value={formData.fundType}
                onChange={handleChange}
                required
              >
                <option value="equity">Equity</option>
                <option value="debt">Debt</option>
                <option value="hybrid">Hybrid</option>
                <option value="index">Index</option>
                <option value="elss">ELSS</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label>Folio Number *</label>
              <input
                type="text"
                name="folioNumber"
                value={formData.folioNumber}
                onChange={handleChange}
                className={errors.folioNumber ? 'error' : ''}
                placeholder="Enter folio number"
                required
              />
              {errors.folioNumber && <span className="error-text">{errors.folioNumber}</span>}
            </div>

            {formData.investmentType === 'sip' && (
              <>
                <div className="form-field">
                  <label>SIP Date *</label>
                  <input
                    type="text"
                    name="sipDate"
                    value={formData.sipDate}
                    onChange={handleChange}
                    className={errors.sipDate ? 'error' : ''}
                    placeholder="e.g., 15th"
                    required
                  />
                  {errors.sipDate && <span className="error-text">{errors.sipDate}</span>}
                </div>

                <div className="form-field">
                  <label>SIP Amount *</label>
                  <input
                    type="number"
                    name="sipAmount"
                    value={formData.sipAmount}
                    onChange={handleChange}
                    className={errors.sipAmount ? 'error' : ''}
                    placeholder="Enter SIP amount"
                    min="0"
                    step="0.01"
                    required
                  />
                  {errors.sipAmount && <span className="error-text">{errors.sipAmount}</span>}
                </div>
              </>
            )}

            <div className="form-field">
              <label>No. of Units *</label>
              <input
                type="number"
                name="units"
                value={formData.units}
                onChange={handleChange}
                className={errors.units ? 'error' : ''}
                placeholder="Enter number of units"
                min="0"
                step="0.001"
                required
              />
              {errors.units && <span className="error-text">{errors.units}</span>}
            </div>

            <div className="form-field">
              <label>Purchase NAV *</label>
              <input
                type="number"
                name="purchaseNAV"
                value={formData.purchaseNAV}
                onChange={handleChange}
                className={errors.purchaseNAV ? 'error' : ''}
                placeholder="Enter purchase NAV"
                min="0"
                step="0.01"
                required
              />
              {errors.purchaseNAV && <span className="error-text">{errors.purchaseNAV}</span>}
            </div>

            <div className="form-field">
              <label>Purchase Value *</label>
              <input
                type="number"
                name="purchaseValue"
                value={formData.purchaseValue}
                onChange={handleChange}
                className={errors.purchaseValue ? 'error' : ''}
                placeholder="Auto-calculated or enter manually"
                min="0"
                step="0.01"
                required
              />
              {errors.purchaseValue && <span className="error-text">{errors.purchaseValue}</span>}
            </div>

            <div className="form-field">
              <label>Current NAV</label>
              <input
                type="number"
                name="currentNAV"
                value={formData.currentNAV}
                onChange={handleChange}
                placeholder="Enter current NAV"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label>Holding Status</label>
              <select
                name="holdingStatus"
                value={formData.holdingStatus}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            <div className="form-field">
              <label>Holding Pattern</label>
              <select
                name="holdingPattern"
                value={formData.holdingPattern}
                onChange={handleChange}
              >
                <option value="single">Single</option>
                <option value="joint">Joint</option>
                <option value="minor">Minor</option>
              </select>
            </div>

            <div className="form-field">
              <label>Investment Date</label>
              <input
                type="date"
                name="investmentDate"
                value={formData.investmentDate}
                onChange={handleChange}
              />
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

export default MutualFundModal;