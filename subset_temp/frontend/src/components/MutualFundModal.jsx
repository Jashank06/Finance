import { useState, useEffect } from 'react';
import { FiX, FiSave, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { investmentValuationAPI } from '../utils/investmentValuationAPI';
import { staticAPI } from '../utils/staticAPI';
import './Modal.css';

// Derive fund type from fund name by keyword matching
const deriveFundType = (fundName) => {
  if (!fundName) return 'Equity';
  const name = fundName.toLowerCase();
  if (name.includes('small cap')) return 'Small Cap';
  if (name.includes('large & mid cap') || name.includes('large and mid cap')) return 'Large and Mid Cap';
  if (name.includes('mid cap') || name.includes('midcap')) return 'Mid Cap';
  if (name.includes('large cap') || name.includes('largecap') || name.includes('bluechip') || name.includes('blue chip')) return 'Large Cap';
  if (name.includes('multi cap') || name.includes('multicap')) return 'Multi Cap';
  if (name.includes('flexi cap') || name.includes('flexicap')) return 'Flexi Cap';
  if (name.includes('elss') || name.includes('tax saver') || name.includes('tax saving')) return 'ELSS';
  if (name.includes('gold') && name.includes('silver')) return 'Gold & Silver';
  if (name.includes('gold')) return 'Gold';
  if (name.includes('silver')) return 'Silver';
  if (name.includes('index') || name.includes('nifty') || name.includes('sensex')) return 'Index';
  if (name.includes('liquid') || name.includes('overnight') || name.includes('money market')) return 'Liquid';
  if (name.includes('debt') || name.includes('bond') || name.includes('gilt') || name.includes('credit risk')) return 'Debt';
  if (name.includes('hybrid') || name.includes('balanced') || name.includes('aggressive')) return 'Hybrid';
  if (name.includes('international') || name.includes('global') || name.includes('usa') || name.includes('nasdaq')) return 'International';
  if (name.includes('fof') || name.includes('fund of fund')) return 'FoF';
  if (name.includes('banking') || name.includes('pharma') || name.includes('infra') || name.includes('consumption') || name.includes('sectoral')) return 'Sectoral/Thematic';
  return 'Equity';
};

const FUND_TYPE_OPTIONS = [
  'Small Cap', 'Mid Cap', 'Large Cap', 'Large and Mid Cap', 'Multi Cap', 'Flexi Cap',
  'ELSS', 'Gold', 'Silver', 'Gold & Silver', 'Index', 'Liquid', 'Debt', 'Hybrid',
  'International', 'FoF', 'Sectoral/Thematic', 'Equity'
];

const emptyForm = (investmentType) => ({
  investmentType: investmentType || 'lumpsum',
  broker: '',
  investorName: '',
  fundName: '',
  fundType: 'Equity',
  folioNumber: '',
  isin: '',
  sipDate: '',
  sipStartDate: new Date().toISOString().split('T')[0],
  sipAmount: '',
  units: '',
  purchaseNAV: '',
  purchaseValue: '',
  holdingStatus: 'active',
  holdingPattern: 'single',
  investmentDate: new Date().toISOString().split('T')[0],
});

const MutualFundModal = ({ isOpen, onClose, onSuccess, editData, investmentType }) => {
  const [formData, setFormData] = useState(emptyForm(investmentType));
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState({});
  const [derivedFundType, setDerivedFundType] = useState('Equity');
  const [fundTypeOverride, setFundTypeOverride] = useState(false);
  const [createdFundId, setCreatedFundId] = useState(null);
  const [generateResult, setGenerateResult] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...emptyForm(investmentType),
        ...editData,
        investmentDate: editData.investmentDate ? editData.investmentDate.split('T')[0] : new Date().toISOString().split('T')[0],
        sipStartDate: editData.sipStartDate ? editData.sipStartDate.split('T')[0] : new Date().toISOString().split('T')[0],
      });
      const ft = editData.fundType || deriveFundType(editData.fundName);
      setDerivedFundType(ft);
    } else {
      setFormData(emptyForm(investmentType));
      setDerivedFundType('Equity');
      setFundTypeOverride(false);
      setCreatedFundId(null);
      setGenerateResult(null);
    }
  }, [editData, investmentType, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-derive fund type from fund name
      if (name === 'fundName' && !fundTypeOverride) {
        const ft = deriveFundType(value);
        setDerivedFundType(ft);
        updated.fundType = ft;
      }

      // Auto-calculate purchase value for lumpsum
      if (prev.investmentType === 'lumpsum') {
        if (name === 'units' || name === 'purchaseNAV') {
          const units = name === 'units' ? parseFloat(value) : parseFloat(prev.units);
          const nav = name === 'purchaseNAV' ? parseFloat(value) : parseFloat(prev.purchaseNAV);
          if (units && nav) updated.purchaseValue = (units * nav).toFixed(2);
        }
      }

      return updated;
    });

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFundTypeChange = (e) => {
    setFundTypeOverride(true);
    setDerivedFundType(e.target.value);
    setFormData(prev => ({ ...prev, fundType: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.broker.trim()) newErrors.broker = 'Investment Broker is required';
    if (!formData.investorName.trim()) newErrors.investorName = 'Investor Name is required';
    if (!formData.fundName.trim()) newErrors.fundName = 'Fund Name is required';
    if (!formData.folioNumber.trim()) newErrors.folioNumber = 'Folio Number is required';

    if (formData.investmentType === 'sip') {
      if (!formData.sipDate) newErrors.sipDate = 'SIP Date (day of month) is required';
      if (!formData.sipAmount) newErrors.sipAmount = 'SIP Amount is required';
      if (!formData.sipStartDate) newErrors.sipStartDate = 'SIP Start Date is required';
    } else {
      if (!formData.units) newErrors.units = 'Number of Units is required';
      if (!formData.purchaseNAV) newErrors.purchaseNAV = 'Purchase NAV is required';
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

        // If no BasicDetails record exists yet, create one first
        if (!basicDetails?._id) {
          const created = await staticAPI.createBasicDetails({ mutualFunds: [] });
          basicDetails = created.data;
        }

        const mfs = basicDetails.mutualFunds || [];
        const existingIdx = mfs.findIndex(m => m.folioNo === itemData.folioNumber && m.mfName === itemData.fundName);
        const mapped = {
          fundHouse: itemData.broker || '',
          investorName: itemData.investorName || '',
          mfName: itemData.fundName || '',
          folioNo: itemData.folioNumber || '',
          holdingType: 'Single'
        };

        if (existingIdx >= 0) {
          mfs[existingIdx] = { ...mfs[existingIdx], ...mapped };
        } else {
          mfs.push(mapped);
        }

        await staticAPI.updateBasicDetails(basicDetails._id, { ...basicDetails, mutualFunds: mfs });
      } catch (err) {
        console.warn('Failed to auto-sync Mutual Fund to Basic Details:', err);
      }
    };

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        fundType: derivedFundType,
        sipDate: formData.sipDate ? parseInt(formData.sipDate) : undefined,
        sipAmount: formData.sipAmount ? parseFloat(formData.sipAmount) : undefined,
        sipStartDate: formData.investmentType === 'sip' ? formData.sipStartDate : undefined,
        ...(formData.investmentType === 'lumpsum' ? {
          units: parseFloat(formData.units),
          purchaseNAV: parseFloat(formData.purchaseNAV),
          purchaseValue: parseFloat(formData.purchaseValue),
          currentNAV: parseFloat(formData.currentNAV) || parseFloat(formData.purchaseNAV),
        } : {
          // For SIP: purchaseNAV is optional fallback when mfapi.in can't find the fund
          purchaseNAV: formData.purchaseNAV ? parseFloat(formData.purchaseNAV) : undefined,
        }),
      };

      let savedId;
      const isImported = editData && editData._id && editData._id.toString().startsWith('basic-');
      
      if (editData && !isImported) {
        await investmentValuationAPI.updateMutualFund(editData._id, submitData);
        savedId = editData._id;
        await syncToBasicDetails(submitData);
      } else if (!isImported) {
        const res = await investmentValuationAPI.createMutualFund(submitData);
        savedId = res.data?.data?._id;
        await syncToBasicDetails(submitData);
      }

      // For SIP: auto-generate installments after saving
      if (formData.investmentType === 'sip' && savedId) {
        setCreatedFundId(savedId);
        setLoading(false);
        setGenerating(true);
        try {
          const genRes = await investmentValuationAPI.generateSIPTransactions(savedId);
          setGenerateResult({
            count: genRes.data?.data?.count || 0,
            currentNAV: genRes.data?.data?.currentNAV || 0,
          });
        } catch (genErr) {
          const backendMsg = genErr.response?.data?.message;
          console.warn('Could not auto-generate SIP transactions:', genErr.message);
          setGenerateResult({
            count: 0,
            error: backendMsg || 'Could not auto-generate. Edit the SIP and add a Purchase NAV as fallback, then try again.',
          });
        } finally {
          setGenerating(false);
        }
        onSuccess();
      } else {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving mutual fund:', error);
      setErrors({ submit: 'Failed to save mutual fund. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreatedFundId(null);
    setGenerateResult(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const isSIP = formData.investmentType === 'sip';

  // Show result state after generation
  if (generateResult !== null) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: 480 }}>
          <div className="modal-header">
            <h2>SIP Setup Complete</h2>
            <button className="close-btn" onClick={handleClose}><FiX /></button>
          </div>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            {generateResult.error ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: '#f59e0b', fontWeight: 600 }}>Fund saved, but could not auto-generate transactions.</p>
                <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>{generateResult.error}</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ fontWeight: 700, fontSize: 18 }}>{generateResult.count} SIP installments generated!</p>
                {generateResult.currentNAV > 0 && (
                  <p style={{ color: '#94a3b8', marginTop: 8 }}>
                    Current NAV fetched: <strong>₹{generateResult.currentNAV}</strong>
                  </p>
                )}
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                  All installments from your start date to today have been added with purchase NAV and unit calculations.
                </p>
              </>
            )}
            <button className="save-btn" style={{ marginTop: 20 }} onClick={handleClose}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{editData ? 'Edit' : 'Add'} Mutual Fund {isSIP ? 'SIP' : 'Lumpsum'}</h2>
          <button className="close-btn" onClick={handleClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">

            {/* Investment Type */}
            <div className="form-field">
              <label>Investment Type *</label>
              <select name="investmentType" value={formData.investmentType} onChange={handleChange} required>
                <option value="lumpsum">Lumpsum</option>
                <option value="sip">SIP</option>
              </select>
            </div>

            {/* Broker */}
            <div className="form-field">
              <label>Investment Broker *</label>
              <input
                type="text" name="broker" value={formData.broker} onChange={handleChange}
                className={errors.broker ? 'error' : ''} placeholder="e.g., Zerodha, Groww" required
              />
              {errors.broker && <span className="error-text">{errors.broker}</span>}
            </div>

            {/* Investor Name */}
            <div className="form-field">
              <label>Investor Name *</label>
              <input
                type="text" name="investorName" value={formData.investorName} onChange={handleChange}
                className={errors.investorName ? 'error' : ''} placeholder="Enter investor name" required
              />
              {errors.investorName && <span className="error-text">{errors.investorName}</span>}
            </div>

            {/* Fund Name */}
            <div className="form-field">
              <label>Name of Fund *</label>
              <input
                type="text" name="fundName" value={formData.fundName} onChange={handleChange}
                className={errors.fundName ? 'error' : ''} placeholder="e.g., Bandhan Small Cap Fund - Gr" required
              />
              {errors.fundName && <span className="error-text">{errors.fundName}</span>}
            </div>

            {/* Fund Type — auto-derived, but editable */}
            <div className="form-field">
              <label>
                Type of Fund
                {!fundTypeOverride && formData.fundName && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>⚡ Auto-derived</span>
                )}
              </label>
              <select name="fundType" value={derivedFundType} onChange={handleFundTypeChange}>
                {FUND_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {!fundTypeOverride && formData.fundName && (
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Derived from fund name • click to override
                </span>
              )}
            </div>

            {/* Folio Number */}
            <div className="form-field">
              <label>Folio Number *</label>
              <input
                type="text" name="folioNumber" value={formData.folioNumber} onChange={handleChange}
                className={errors.folioNumber ? 'error' : ''} placeholder="Enter folio number" required
              />
              {errors.folioNumber && <span className="error-text">{errors.folioNumber}</span>}
            </div>

            {/* ISIN */}
            <div className="form-field">
              <label>ISIN <span style={{ fontSize: 11, color: '#64748b' }}>(optional, for NAV auto-fetch)</span></label>
              <input
                type="text" name="isin" value={formData.isin} onChange={handleChange}
                placeholder="e.g., INF204KB14I2"
              />
            </div>

            {/* SIP-specific fields */}
            {isSIP && (
              <>
                <div className="form-field">
                  <label>SIP Start Date *</label>
                  <input
                    type="date" name="sipStartDate" value={formData.sipStartDate} onChange={handleChange}
                    className={errors.sipStartDate ? 'error' : ''} required
                  />
                  {errors.sipStartDate && <span className="error-text">{errors.sipStartDate}</span>}
                  <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    All installments from this date to today will be auto-generated
                  </span>
                </div>

                <div className="form-field">
                  <label>SIP Date (Day of Month) *</label>
                  <input
                    type="number" name="sipDate" value={formData.sipDate} onChange={handleChange}
                    className={errors.sipDate ? 'error' : ''} placeholder="e.g., 5 for 5th of every month"
                    min="1" max="31" required
                  />
                  {errors.sipDate && <span className="error-text">{errors.sipDate}</span>}
                </div>

                <div className="form-field">
                  <label>SIP Amount (₹) *</label>
                  <input
                    type="number" name="sipAmount" value={formData.sipAmount} onChange={handleChange}
                    className={errors.sipAmount ? 'error' : ''} placeholder="Monthly SIP amount"
                    min="0" step="0.01" required
                  />
                  {errors.sipAmount && <span className="error-text">{errors.sipAmount}</span>}
                </div>

                {/* Purchase NAV - optional fallback for SIP */}
                <div className="form-field">
                  <label>
                    Purchase NAV (₹)
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>fallback</span>
                  </label>
                  <input
                    type="number" name="purchaseNAV" value={formData.purchaseNAV} onChange={handleChange}
                    placeholder="Used if mfapi.in can't find the fund" min="0" step="0.0001"
                  />
                  <span style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    If left blank, NAV is auto-fetched from mfapi.in per installment date
                  </span>
                </div>

                {/* Current NAV - display only for SIP */}
                <div className="form-field">
                  <label>Current NAV</label>
                  <div style={{
                    padding: '8px 12px', borderRadius: 8, background: '#f0fdf4',
                    border: '1px solid #86efac', color: '#16a34a', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <FiRefreshCw size={13} />
                    <span>Auto-fetched from <strong>mfapi.in</strong> when transactions are generated</span>
                  </div>
                </div>
              </>
            )}

            {/* Lumpsum-specific fields */}
            {!isSIP && (
              <>
                <div className="form-field">
                  <label>No. of Units *</label>
                  <input
                    type="number" name="units" value={formData.units} onChange={handleChange}
                    className={errors.units ? 'error' : ''} placeholder="Enter number of units"
                    min="0" step="0.001" required
                  />
                  {errors.units && <span className="error-text">{errors.units}</span>}
                </div>

                <div className="form-field">
                  <label>Purchase NAV *</label>
                  <input
                    type="number" name="purchaseNAV" value={formData.purchaseNAV} onChange={handleChange}
                    className={errors.purchaseNAV ? 'error' : ''} placeholder="Enter purchase NAV"
                    min="0" step="0.0001" required
                  />
                  {errors.purchaseNAV && <span className="error-text">{errors.purchaseNAV}</span>}
                </div>

                <div className="form-field">
                  <label>Purchase Value *</label>
                  <input
                    type="number" name="purchaseValue" value={formData.purchaseValue} onChange={handleChange}
                    className={errors.purchaseValue ? 'error' : ''} placeholder="Auto-calculated or enter manually"
                    min="0" step="0.01" required
                  />
                  {errors.purchaseValue && <span className="error-text">{errors.purchaseValue}</span>}
                </div>

                <div className="form-field">
                  <label>Current NAV</label>
                  <div style={{
                    padding: '8px 12px', borderRadius: 8, background: '#f0fdf4',
                    border: '1px solid #86efac', color: '#16a34a', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <FiRefreshCw size={13} />
                    <span>Auto-fetched from <strong>mfapi.in</strong> when saving</span>
                  </div>
                </div>
              </>
            )}

            {/* Common fields */}
            <div className="form-field">
              <label>Holding Status</label>
              <select name="holdingStatus" value={formData.holdingStatus} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            <div className="form-field">
              <label>Holding Pattern</label>
              <select name="holdingPattern" value={formData.holdingPattern} onChange={handleChange}>
                <option value="single">Single</option>
                <option value="joint">Joint</option>
                <option value="minor">Minor</option>
              </select>
            </div>

            {!isSIP && (
              <div className="form-field">
                <label>Investment Date</label>
                <input type="date" name="investmentDate" value={formData.investmentDate} onChange={handleChange} />
              </div>
            )}
          </div>

          {isSIP && (
            <div style={{
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 10, padding: '12px 16px', marginTop: 8, marginBottom: 4,
              fontSize: 13, color: '#93c5fd', lineHeight: 1.6
            }}>
              <strong>ℹ️ How SIP transactions are generated:</strong><br />
              After saving, all monthly installments from <em>SIP Start Date</em> to today will be auto-created.
              Units per installment = <strong>SIP Amount ÷ Purchase NAV</strong> (3 decimal precision).
              Current NAV is fetched automatically from mfapi.in.
            </div>
          )}

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={handleClose}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading || generating}>
              {loading ? <><FiLoader className="spinner" /> Saving...</> :
               generating ? <><FiRefreshCw className="spinner" /> Generating Installments...</> :
               <><FiSave /> {isSIP ? 'Save & Generate Installments' : 'Save'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MutualFundModal;