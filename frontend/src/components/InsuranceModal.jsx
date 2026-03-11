import { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';
import { investmentValuationAPI } from '../utils/investmentValuationAPI';
import { staticAPI } from '../utils/staticAPI';
import './Modal.css';

const InsuranceModal = ({ isOpen, onClose, onSuccess, editData, insuranceType }) => {
  const [formData, setFormData] = useState({
    insuranceType: insuranceType || 'life',
    customerName: '',
    companyName: '',
    policyName: '',
    policyNumber: '',
    policyType: 'term',
    purchaseDate: new Date().toISOString().split('T')[0],
    maturityDate: '',
    premiumPaymentMode: 'yearly',
    premiumDate: '',
    premiumAmount: '',
    lastPremiumDate: '',
    sumAssured: '',
    sumInsured: '',
    maturityAmount: '',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        purchaseDate: editData.purchaseDate ? editData.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        maturityDate: editData.maturityDate ? editData.maturityDate.split('T')[0] : '',
        lastPremiumDate: editData.lastPremiumDate ? editData.lastPremiumDate.split('T')[0] : ''
      });
    } else {
      setFormData({
        insuranceType: insuranceType || 'life',
        customerName: '',
        companyName: '',
        policyName: '',
        policyNumber: '',
        policyType: insuranceType === 'health' ? 'health' : 'term',
        purchaseDate: new Date().toISOString().split('T')[0],
        maturityDate: '',
        premiumPaymentMode: 'yearly',
        premiumDate: '',
        premiumAmount: '',
        lastPremiumDate: '',
        sumAssured: '',
        sumInsured: '',
        maturityAmount: '',
        status: 'active'
      });
    }
  }, [editData, insuranceType]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer Name is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!formData.policyName.trim()) newErrors.policyName = 'Policy Name is required';
    if (!formData.policyNumber.trim()) newErrors.policyNumber = 'Policy Number is required';
    if (!formData.premiumAmount) newErrors.premiumAmount = 'Premium Amount is required';

    if (formData.insuranceType === 'life' && !formData.sumAssured) {
      newErrors.sumAssured = 'Sum Assured is required for life insurance';
    }
    if (formData.insuranceType === 'health' && !formData.sumInsured) {
      newErrors.sumInsured = 'Sum Insured is required for health insurance';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const syncToBasicDetails = async (itemData) => {
      try {
        const res = await staticAPI.getBasicDetails();
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ? (Array.isArray(res.data.data) ? res.data.data : [res.data.data]) : []);
        let basicDetails = list.length > 0 ? list[0] : null;

        // If no BasicDetails record, create one first
        if (!basicDetails?._id) {
          const created = await staticAPI.createBasicDetails({ insurance: [] });
          basicDetails = created.data;
        }

        const ins = basicDetails.insurance || [];
        const existingIdx = ins.findIndex(i => i.policyNumber === itemData.policyNumber && i.policyName === itemData.policyName);
        const mapped = {
          insuranceCompany: itemData.companyName || '',
          insurerName: itemData.customerName || '',
          policyName: itemData.policyName || '',
          policyNumber: itemData.policyNumber || '',
          insuranceType: itemData.insuranceType || '',
          policyPurpose: ''
        };

        if (existingIdx >= 0) {
          ins[existingIdx] = { ...ins[existingIdx], ...mapped };
        } else {
          ins.push(mapped);
        }

        await staticAPI.updateBasicDetails(basicDetails._id, { ...basicDetails, insurance: ins });
      } catch (err) {
        console.warn('Failed to auto-sync Insurance to Basic Details:', err);
      }
    };

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        premiumAmount: parseFloat(formData.premiumAmount),
        sumAssured: formData.sumAssured ? parseFloat(formData.sumAssured) : undefined,
        sumInsured: formData.sumInsured ? parseFloat(formData.sumInsured) : undefined,
        maturityAmount: formData.maturityAmount ? parseFloat(formData.maturityAmount) : undefined
      };

      if (editData && !(editData._id && editData._id.toString().startsWith('basic-'))) {
        await investmentValuationAPI.updateInsurance(editData._id, submitData);
        await syncToBasicDetails(submitData);
      } else if (!editData || !(editData._id && editData._id.toString().startsWith('basic-'))) {
        await investmentValuationAPI.createInsurance(submitData);
        await syncToBasicDetails(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving insurance:', error);
      setErrors({ submit: 'Failed to save insurance policy. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getLifePolicyTypes = () => (
    <>
      <option value="term">Term</option>
      <option value="whole-life">Whole Life</option>
      <option value="endowment">Endowment</option>
      <option value="ulip">ULIP</option>
      <option value="money-back">Money Back</option>
    </>
  );

  const getHealthPolicyTypes = () => (
    <>
      <option value="health">Health</option>
      <option value="critical-illness">Critical Illness</option>
      <option value="family-floater">Family Floater</option>
      <option value="individual">Individual</option>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>
            {editData ? 'Edit' : 'Add'} {formData.insuranceType === 'life' ? 'Life' : 'Health'} Insurance
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Insurance Type *</label>
              <select
                name="insuranceType"
                value={formData.insuranceType}
                onChange={handleChange}
                required
              >
                <option value="life">Life Insurance</option>
                <option value="health">Health Insurance</option>
              </select>
            </div>

            <div className="form-field">
              <label>Name of Customer *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className={errors.customerName ? 'error' : ''}
                placeholder="Enter customer name"
                required
              />
              {errors.customerName && <span className="error-text">{errors.customerName}</span>}
            </div>

            <div className="form-field">
              <label>Name of Company *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={errors.companyName ? 'error' : ''}
                placeholder="e.g., LIC, HDFC Life, Star Health"
                required
              />
              {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            </div>

            <div className="form-field">
              <label>Name of Policy *</label>
              <input
                type="text"
                name="policyName"
                value={formData.policyName}
                onChange={handleChange}
                className={errors.policyName ? 'error' : ''}
                placeholder="Enter policy name"
                required
              />
              {errors.policyName && <span className="error-text">{errors.policyName}</span>}
            </div>

            <div className="form-field">
              <label>Policy Number *</label>
              <input
                type="text"
                name="policyNumber"
                value={formData.policyNumber}
                onChange={handleChange}
                className={errors.policyNumber ? 'error' : ''}
                placeholder="Enter policy number"
                required
              />
              {errors.policyNumber && <span className="error-text">{errors.policyNumber}</span>}
            </div>

            <div className="form-field">
              <label>Type of Policy *</label>
              <select
                name="policyType"
                value={formData.policyType}
                onChange={handleChange}
                required
              >
                {formData.insuranceType === 'life' ? getLifePolicyTypes() : getHealthPolicyTypes()}
              </select>
            </div>

            <div className="form-field">
              <label>Date of Purchase *</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
              />
            </div>

            {formData.insuranceType === 'life' && (
              <div className="form-field">
                <label>Maturity Date</label>
                <input
                  type="date"
                  name="maturityDate"
                  value={formData.maturityDate}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-field">
              <label>Premium Payment Mode</label>
              <select
                name="premiumPaymentMode"
                value={formData.premiumPaymentMode}
                onChange={handleChange}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half Yearly</option>
                <option value="yearly">Yearly</option>
                <option value="single">Single Premium</option>
              </select>
            </div>

            <div className="form-field">
              <label>Premium Date</label>
              <input
                type="text"
                name="premiumDate"
                value={formData.premiumDate}
                onChange={handleChange}
                placeholder="e.g., 15th"
              />
            </div>

            <div className="form-field">
              <label>Premium Amount *</label>
              <input
                type="number"
                name="premiumAmount"
                value={formData.premiumAmount}
                onChange={handleChange}
                className={errors.premiumAmount ? 'error' : ''}
                placeholder="Enter premium amount"
                min="0"
                step="0.01"
                required
              />
              {errors.premiumAmount && <span className="error-text">{errors.premiumAmount}</span>}
            </div>

            <div className="form-field">
              <label>Last Date of Premium</label>
              <input
                type="date"
                name="lastPremiumDate"
                value={formData.lastPremiumDate}
                onChange={handleChange}
              />
            </div>

            {formData.insuranceType === 'life' && (
              <>
                <div className="form-field">
                  <label>Sum Assured *</label>
                  <input
                    type="number"
                    name="sumAssured"
                    value={formData.sumAssured}
                    onChange={handleChange}
                    className={errors.sumAssured ? 'error' : ''}
                    placeholder="Enter sum assured"
                    min="0"
                    step="0.01"
                    required
                  />
                  {errors.sumAssured && <span className="error-text">{errors.sumAssured}</span>}
                </div>

                <div className="form-field">
                  <label>Maturity Amount</label>
                  <input
                    type="number"
                    name="maturityAmount"
                    value={formData.maturityAmount}
                    onChange={handleChange}
                    placeholder="Enter maturity amount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </>
            )}

            {formData.insuranceType === 'health' && (
              <div className="form-field">
                <label>Sum Insured *</label>
                <input
                  type="number"
                  name="sumInsured"
                  value={formData.sumInsured}
                  onChange={handleChange}
                  className={errors.sumInsured ? 'error' : ''}
                  placeholder="Enter sum insured"
                  min="0"
                  step="0.01"
                  required
                />
                {errors.sumInsured && <span className="error-text">{errors.sumInsured}</span>}
              </div>
            )}

            <div className="form-field">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="lapsed">Lapsed</option>
                <option value="matured">Matured</option>
                <option value="surrendered">Surrendered</option>
                <option value="claimed">Claimed</option>
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

export default InsuranceModal;