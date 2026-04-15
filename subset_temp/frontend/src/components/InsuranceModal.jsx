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
    policyCategory: 'New',
    purchaseDate: new Date().toISOString().split('T')[0],
    policyStartDate: new Date().toISOString().split('T')[0],
    policyEndDate: '',
    maturityDate: '',
    premiumPaymentMode: 'yearly',
    premiumDate: '',
    premiumAmount: '',
    gstAmount: '0',
    totalPremium: '',
    policyTerm: '1 Year',
    paymentMode: 'Online',
    paymentStatus: 'Paid',
    lastPremiumDate: '',
    sumAssured: '',
    sumInsured: '',
    maturityAmount: '',
    status: 'active',
    additionalField1: '',
    additionalField2: '',
    additionalField3: '',
    additionalField4: '',
    additionalField5: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        purchaseDate: editData.purchaseDate ? editData.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        policyStartDate: editData.policyStartDate ? editData.policyStartDate.split('T')[0] : (editData.purchaseDate ? editData.purchaseDate.split('T')[0] : new Date().toISOString().split('T')[0]),
        policyEndDate: editData.policyEndDate ? editData.policyEndDate.split('T')[0] : '',
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
        policyType: insuranceType === 'health' ? 'health' : (insuranceType === 'general' ? 'motor' : 'term'),
        policyCategory: 'New',
        purchaseDate: new Date().toISOString().split('T')[0],
        policyStartDate: new Date().toISOString().split('T')[0],
        policyEndDate: '',
        maturityDate: '',
        premiumPaymentMode: 'yearly',
        premiumDate: '',
        premiumAmount: '',
        gstAmount: '0',
        totalPremium: '',
        policyTerm: '1 Year',
        paymentMode: 'Online',
        paymentStatus: 'Paid',
        lastPremiumDate: '',
        sumAssured: '',
        sumInsured: '',
        maturityAmount: '',
        status: 'active',
        additionalField1: '',
        additionalField2: '',
        additionalField3: '',
        additionalField4: '',
        additionalField5: ''
      });
    }
  }, [editData, insuranceType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      
      // Auto-calculate total premium if amount or GST changes
      if (name === 'premiumAmount' || name === 'gstAmount') {
        const amount = parseFloat(name === 'premiumAmount' ? value : prev.premiumAmount) || 0;
        const gst = parseFloat(name === 'gstAmount' ? value : prev.gstAmount) || 0;
        newState.totalPremium = (amount + gst).toString();
      }

      return newState;
    });

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
    if ((formData.insuranceType === 'health' || formData.insuranceType === 'general') && !formData.sumInsured) {
      newErrors.sumInsured = `Sum Insured is required for ${formData.insuranceType} insurance`;
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
        
        // Comprehensive mapping for Basic Details Synchronization
        const mapped = {
          insuranceCompany: itemData.companyName || '',
          insurerName: itemData.customerName || '',
          policyName: itemData.policyName || '',
          policyNumber: itemData.policyNumber || '',
          insuranceType: itemData.insuranceType || '',
          policyType: itemData.policyType || '',
          policyCategory: itemData.policyCategory || '',
          policyStartDate: itemData.policyStartDate || '',
          policyEndDate: itemData.policyEndDate || '',
          policyTerm: itemData.policyTerm || '',
          sumInsured: String(itemData.sumInsured || ''),
          sumAssured: String(itemData.sumAssured || ''),
          premiumAmount: String(itemData.premiumAmount || ''),
          gstAmount: String(itemData.gstAmount || ''),
          totalPremium: String(itemData.totalPremium || ''),
          paymentMode: itemData.paymentMode || '',
          paymentStatus: itemData.paymentStatus || '',
          additionalField1: itemData.additionalField1 || '',
          additionalField2: itemData.additionalField2 || '',
          additionalField3: itemData.additionalField3 || '',
          additionalField4: itemData.additionalField4 || '',
          additionalField5: itemData.additionalField5 || '',
          policyPurpose: ''
        };

        if (existingIdx >= 0) {
          ins[existingIdx] = { ...ins[existingIdx], ...mapped };
        } else {
          ins.push(mapped);
        }

        // Also update Portfolio section in Basic Details for accurate valuation tracking
        const portfolio = basicDetails.insurancePortfolio || [];
        const portIdx = portfolio.findIndex(p => p.policyNumber === itemData.policyNumber);
        
        const portMap = {
          insuranceCompany: itemData.companyName || '',
          insurerName: itemData.customerName || '',
          policyType: itemData.policyType || '',
          policyName: itemData.policyName || '',
          policyNumber: itemData.policyNumber || '',
          policyStartDate: itemData.policyStartDate || '',
          policyEndDate: itemData.policyEndDate || '',
          policyTerm: itemData.policyTerm || '',
          premiumAmount: String(itemData.premiumAmount || ''),
          gstAmount: String(itemData.gstAmount || ''),
          totalPremium: String(itemData.totalPremium || ''),
          paymentMode: itemData.paymentMode || '',
          paymentStatus: itemData.paymentStatus || '',
          lastPremiumPayingDate: itemData.lastPremiumDate || '',
          maturityDate: itemData.maturityDate || '',
          sumAssured: String(itemData.sumAssured || ''),
          sumInsured: String(itemData.sumInsured || ''),
          nominee: (itemData.nominees && itemData.nominees.length > 0) ? itemData.nominees[0].name : '',
          additionalField1: itemData.additionalField1 || '',
          additionalField2: itemData.additionalField2 || '',
          additionalField3: itemData.additionalField3 || '',
          additionalField4: itemData.additionalField4 || '',
          additionalField5: itemData.additionalField5 || ''
        };

        if (portIdx >= 0) {
          portfolio[portIdx] = { ...portfolio[portIdx], ...portMap };
        } else {
          portfolio.push(portMap);
        }

        await staticAPI.updateBasicDetails(basicDetails._id, { 
          ...basicDetails, 
          insurance: ins,
          insurancePortfolio: portfolio 
        });
      } catch (err) {
        console.warn('Failed to auto-sync Insurance to Basic Details:', err);
      }
    };

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        premiumAmount: parseFloat(formData.premiumAmount) || 0,
        gstAmount: parseFloat(formData.gstAmount) || 0,
        totalPremium: parseFloat(formData.totalPremium) || (parseFloat(formData.premiumAmount) || 0) + (parseFloat(formData.gstAmount) || 0),
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

  const getGeneralPolicyTypes = () => (
    <>
      <option value="motor">Motor</option>
      <option value="health">Health</option>
      <option value="travel">Travel</option>
      <option value="fire">Fire</option>
      <option value="marine">Marine</option>
      <option value="liability">Liability</option>
      <option value="other">Other</option>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>
            {editData ? 'Edit' : 'Add'} {
              formData.insuranceType === 'life' ? 'Life' : 
              formData.insuranceType === 'health' ? 'Health' : 'General'
            } Insurance
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
                <option value="general">General Insurance</option>
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
                placeholder="e.g., LIC, HDFC Life, ICICI Lombard"
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
                {formData.insuranceType === 'life' ? getLifePolicyTypes() : 
                 formData.insuranceType === 'health' ? getHealthPolicyTypes() : getGeneralPolicyTypes()}
              </select>
            </div>

            {formData.insuranceType === 'general' && (
              <div className="form-field">
                <label>Policy Category</label>
                <select
                  name="policyCategory"
                  value={formData.policyCategory}
                  onChange={handleChange}
                >
                  <option value="New">New</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>
            )}

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

            {formData.insuranceType === 'general' && (
              <>
                <div className="form-field">
                  <label>Policy Start Date</label>
                  <input
                    type="date"
                    name="policyStartDate"
                    value={formData.policyStartDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label>Policy End Date</label>
                  <input
                    type="date"
                    name="policyEndDate"
                    value={formData.policyEndDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label>Policy Term</label>
                  <select
                    name="policyTerm"
                    value={formData.policyTerm}
                    onChange={handleChange}
                  >
                    <option value="1 Year">1 Year</option>
                    <option value="2 Year">2 Year</option>
                    <option value="3 Year">3 Year</option>
                    <option value="Multi-year">Multi-year</option>
                  </select>
                </div>
              </>
            )}

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
                <option value="onetime">One Time</option>
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
              <label>Premium Basis Amount *</label>
              <input
                type="number"
                name="premiumAmount"
                value={formData.premiumAmount}
                onChange={handleChange}
                className={errors.premiumAmount ? 'error' : ''}
                placeholder="Base Premium"
                min="0"
                step="0.01"
                required
              />
              {errors.premiumAmount && <span className="error-text">{errors.premiumAmount}</span>}
            </div>

            {formData.insuranceType === 'general' && (
              <>
                <div className="form-field">
                  <label>GST Amount</label>
                  <input
                    type="number"
                    name="gstAmount"
                    value={formData.gstAmount}
                    onChange={handleChange}
                    placeholder="GST amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-field">
                  <label>Total Premium</label>
                  <input
                    type="number"
                    name="totalPremium"
                    value={formData.totalPremium}
                    onChange={handleChange}
                    readOnly
                    className="readonly-field"
                    style={{ backgroundColor: '#f9fafb' }}
                  />
                </div>
                <div className="form-field">
                  <label>Payment Mode</label>
                  <select
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                  >
                    <option value="Online">Online</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-field">
              <label>Last Date of Premium</label>
              <input
                type="date"
                name="lastPremiumDate"
                value={formData.lastPremiumDate}
                onChange={handleChange}
              />
            </div>

            {/* Coverage Section */}
            {(formData.insuranceType === 'health' || formData.insuranceType === 'general') && (
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

            <div className="form-field">
              <label>Policy Status</label>
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

            {/* Additional Fields Block */}
            {formData.insuranceType === 'general' && (
              <div className="span-2-grid" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ gridColumn: 'span 2', fontSize: '1rem', marginBottom: '0.5rem' }}>Additional Information</h3>
                <div className="form-field">
                  <label>Additional Field 1</label>
                  <input type="text" name="additionalField1" value={formData.additionalField1} onChange={handleChange} placeholder="Custom data..." />
                </div>
                <div className="form-field">
                  <label>Additional Field 2</label>
                  <input type="text" name="additionalField2" value={formData.additionalField2} onChange={handleChange} placeholder="Custom data..." />
                </div>
                <div className="form-field">
                  <label>Additional Field 3</label>
                  <input type="text" name="additionalField3" value={formData.additionalField3} onChange={handleChange} placeholder="Custom data..." />
                </div>
                <div className="form-field">
                  <label>Additional Field 4</label>
                  <input type="text" name="additionalField4" value={formData.additionalField4} onChange={handleChange} placeholder="Custom data..." />
                </div>
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label>Additional Field 5</label>
                  <input type="text" name="additionalField5" value={formData.additionalField5} onChange={handleChange} placeholder="Custom data..." />
                </div>
              </div>
            )}
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