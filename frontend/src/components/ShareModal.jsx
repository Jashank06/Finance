import { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import { investmentValuationAPI } from '../utils/investmentValuationAPI';
import './Modal.css';

const ShareModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [formData, setFormData] = useState({
    broker: '',
    purchaseType: 'delivery',
    clientId: '',
    dpId: '',
    tradingId: '',
    investorName: '',
    scripName: '',
    purchasePrice: '',
    quantity: '',
    brokerage: '0',
    stt: '0',
    otherCharges: '0',
    purchaseAmount: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currentPrice: '',
    nominee: '',
    intraDay: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        purchaseDate: editData.purchaseDate ? editData.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        brokerage: editData.brokerage || '0',
        stt: editData.stt || '0',
        otherCharges: editData.otherCharges || '0'
      });
    } else {
      setFormData({
        broker: '',
        purchaseType: 'delivery',
        clientId: '',
        dpId: '',
        tradingId: '',
        investorName: '',
        scripName: '',
        purchasePrice: '',
        quantity: '',
        brokerage: '0',
        stt: '0',
        otherCharges: '0',
        purchaseAmount: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        currentPrice: '',
        nominee: '',
        intraDay: false
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-calculate purchase amount
    if (name === 'quantity' || name === 'purchasePrice') {
      const quantity = name === 'quantity' ? parseFloat(value) : parseFloat(formData.quantity);
      const price = name === 'purchasePrice' ? parseFloat(value) : parseFloat(formData.purchasePrice);
      
      if (quantity && price) {
        setFormData(prev => ({
          ...prev,
          [name]: fieldValue,
          purchaseAmount: (quantity * price).toString()
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: fieldValue
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.broker.trim()) newErrors.broker = 'Investment Broker is required';
    if (!formData.clientId.trim()) newErrors.clientId = 'Client ID is required';
    if (!formData.dpId.trim()) newErrors.dpId = 'DP ID is required';
    if (!formData.tradingId.trim()) newErrors.tradingId = 'Trading ID is required';
    if (!formData.investorName.trim()) newErrors.investorName = 'Investor Name is required';
    if (!formData.scripName.trim()) newErrors.scripName = 'Scrip Name is required';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Purchase Price is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (!formData.purchaseAmount) newErrors.purchaseAmount = 'Purchase Amount is required';

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
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseFloat(formData.quantity),
        brokerage: parseFloat(formData.brokerage) || 0,
        stt: parseFloat(formData.stt) || 0,
        otherCharges: parseFloat(formData.otherCharges) || 0,
        purchaseAmount: parseFloat(formData.purchaseAmount),
        currentPrice: parseFloat(formData.currentPrice) || parseFloat(formData.purchasePrice)
      };

      if (editData) {
        await investmentValuationAPI.updateShare(editData._id, submitData);
      } else {
        await investmentValuationAPI.createShare(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving share:', error);
      setErrors({ submit: 'Failed to save share investment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{editData ? 'Edit' : 'Add'} Share Investment</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
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
              <label>Type of Purchase</label>
              <select
                name="purchaseType"
                value={formData.purchaseType}
                onChange={handleChange}
              >
                <option value="delivery">Delivery</option>
                <option value="intraday">Intraday</option>
                <option value="btst">BTST</option>
                <option value="stbt">STBT</option>
              </select>
            </div>

            <div className="form-field">
              <label>Client ID *</label>
              <input
                type="text"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className={errors.clientId ? 'error' : ''}
                placeholder="Enter client ID"
                required
              />
              {errors.clientId && <span className="error-text">{errors.clientId}</span>}
            </div>

            <div className="form-field">
              <label>DP ID *</label>
              <input
                type="text"
                name="dpId"
                value={formData.dpId}
                onChange={handleChange}
                className={errors.dpId ? 'error' : ''}
                placeholder="Enter DP ID"
                required
              />
              {errors.dpId && <span className="error-text">{errors.dpId}</span>}
            </div>

            <div className="form-field">
              <label>Trading ID *</label>
              <input
                type="text"
                name="tradingId"
                value={formData.tradingId}
                onChange={handleChange}
                className={errors.tradingId ? 'error' : ''}
                placeholder="Enter trading ID"
                required
              />
              {errors.tradingId && <span className="error-text">{errors.tradingId}</span>}
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
              <label>Scrip Name *</label>
              <input
                type="text"
                name="scripName"
                value={formData.scripName}
                onChange={handleChange}
                className={errors.scripName ? 'error' : ''}
                placeholder="e.g., RELIANCE, TCS"
                required
              />
              {errors.scripName && <span className="error-text">{errors.scripName}</span>}
            </div>

            <div className="form-field">
              <label>Purchase Price *</label>
              <input
                type="number"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className={errors.purchasePrice ? 'error' : ''}
                placeholder="Enter purchase price per share"
                min="0"
                step="0.01"
                required
              />
              {errors.purchasePrice && <span className="error-text">{errors.purchasePrice}</span>}
            </div>

            <div className="form-field">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'error' : ''}
                placeholder="Enter number of shares"
                min="0"
                required
              />
              {errors.quantity && <span className="error-text">{errors.quantity}</span>}
            </div>

            <div className="form-field">
              <label>Brokerage</label>
              <input
                type="number"
                name="brokerage"
                value={formData.brokerage}
                onChange={handleChange}
                placeholder="Enter brokerage charges"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label>STT</label>
              <input
                type="number"
                name="stt"
                value={formData.stt}
                onChange={handleChange}
                placeholder="Enter STT charges"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label>Other Charges</label>
              <input
                type="number"
                name="otherCharges"
                value={formData.otherCharges}
                onChange={handleChange}
                placeholder="Enter other charges"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label>Purchase Amount *</label>
              <input
                type="number"
                name="purchaseAmount"
                value={formData.purchaseAmount}
                onChange={handleChange}
                className={errors.purchaseAmount ? 'error' : ''}
                placeholder="Auto-calculated or enter manually"
                min="0"
                step="0.01"
                required
              />
              {errors.purchaseAmount && <span className="error-text">{errors.purchaseAmount}</span>}
            </div>

            <div className="form-field">
              <label>Date of Purchase</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Current Price</label>
              <input
                type="number"
                name="currentPrice"
                value={formData.currentPrice}
                onChange={handleChange}
                placeholder="Enter current market price"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-field">
              <label>Nominee</label>
              <input
                type="text"
                name="nominee"
                value={formData.nominee}
                onChange={handleChange}
                placeholder="Enter nominee name"
              />
            </div>

            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  name="intraDay"
                  checked={formData.intraDay}
                  onChange={handleChange}
                />
                Intra Day Trading
              </label>
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

export default ShareModal;