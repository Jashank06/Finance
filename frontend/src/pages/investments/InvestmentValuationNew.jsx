import { useEffect, useState, useMemo, useCallback } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity, FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { investmentValuationAPI } from '../../utils/investmentValuationAPI';
import { staticAPI } from '../../utils/staticAPI';
import { investmentAPI } from '../../utils/investmentAPI';
import MutualFundModal from '../../components/MutualFundModal';
import ShareModal from '../../components/ShareModal';
import InsuranceModal from '../../components/InsuranceModal';
import LoanModal from '../../components/LoanModal';
import './Investment.css';

import { trackFeatureUsage, trackAction } from '../../utils/featureTracking';

const n2 = (v) => (v != null ? parseFloat(v).toFixed(2) : '-');
const n3 = (v) => (v != null ? parseFloat(v).toFixed(3) : '-');
const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
};
const fmtINR = (v) => v != null ? `₹${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';

const InvestmentValuationNew = () => {
  // State for all investment data
  const [mutualFundsLumpsum, setMutualFundsLumpsum] = useState([]);
  const [mutualFundsSIP, setMutualFundsSIP] = useState([]);
  const [sipTransactions, setSipTransactions] = useState({}); // keyed by mutualFundId
  const [sipExpanded, setSipExpanded] = useState({}); // which folios are expanded
  const [sipNavLoading, setSipNavLoading] = useState({}); // which funds are refreshing NAV
  const [lumpsumExpanded, setLumpsumExpanded] = useState({}); // grouped by folio-fundName
  const [lumpsumNavLoading, setLumpsumNavLoading] = useState({});
  const [shares, setShares] = useState([]);
  const [lifeInsurance, setLifeInsurance] = useState([]);
  const [healthInsurance, setHealthInsurance] = useState([]);
  const [generalInsurance, setGeneralInsurance] = useState([]);
  const [sharesRefreshing, setSharesRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState(null);
  // Inline edit state for SIP transaction rows
  const [editingRow, setEditingRow] = useState(null); // '<mutualFundId>-<txId>'
  const [editDrafts, setEditDrafts] = useState({}); // { key: { sipAmount, purchaseNAV, installmentDate } }

  // Modal states
  const [modals, setModals] = useState({
    mutualFund: { isOpen: false, editData: null, type: 'lumpsum' },
    share: { isOpen: false, editData: null },
    insurance: { isOpen: false, editData: null, type: 'life' },
    loan: { isOpen: false, editData: null }
  });

  // Fetch all data on component mount
  useEffect(() => {
    trackFeatureUsage('/family/investments/investment-valuation', 'view');
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        summaryRes,
        mutualFundsRes,
        sharesRes,
        insuranceRes,
        loansRes,
        basicRes,
        amortizationLoansRes
      ] = await Promise.all([
        investmentValuationAPI.getSummary(),
        investmentValuationAPI.getMutualFunds(),
        investmentValuationAPI.getShares(),
        investmentValuationAPI.getInsurance(),
        investmentValuationAPI.getLoans(),
        staticAPI.getBasicDetails(),
        investmentAPI.getLoans() // Fetch amortization loans
      ]);

      const basicDetails = basicRes.data && basicRes.data.length > 0 ? basicRes.data[0] : null;
      const amortizationLoans = amortizationLoansRes.data && amortizationLoansRes.data.loans ? amortizationLoansRes.data.loans : [];

      // Separate mutual funds by type
      const allMutualFunds = mutualFundsRes.data.data.mutualFunds || [];
      const sipFunds = allMutualFunds.filter(mf => mf.investmentType === 'sip');
      setMutualFundsLumpsum(allMutualFunds.filter(mf => mf.investmentType === 'lumpsum'));
      setMutualFundsSIP(sipFunds);

      // Load SIP transactions for each SIP fund
      if (sipFunds.length > 0) {
        const txByFund = {};
        await Promise.all(sipFunds.map(async (mf) => {
          try {
            const txRes = await investmentValuationAPI.getSIPTransactions({ mutualFundId: mf._id });
            txByFund[mf._id] = txRes.data?.data?.transactions || [];
          } catch (e) {
            txByFund[mf._id] = [];
          }
        }));
        setSipTransactions(txByFund);
        // Expand all by default
        const expanded = {};
        sipFunds.forEach(mf => { expanded[mf._id] = true; });
        setSipExpanded(expanded);
      }

      // Group Lumpsum funds and expand all by default
      const lsFunds = allMutualFunds.filter(mf => mf.investmentType === 'lumpsum');
      setMutualFundsLumpsum(lsFunds);
      
      const lsExpanded = {};
      const groups = new Set(lsFunds.map(item => `${item.folioNumber}-${item.fundName}`));
      groups.forEach(g => { lsExpanded[g] = true; });
      setLumpsumExpanded(lsExpanded);

      // Merge Basic Details Mutual Funds (Portfolio)
      if (basicDetails && basicDetails.mutualFundsPortfolio) {
        const existingFolios = new Set(lsFunds.map(mf => mf.folioNumber).filter(Boolean));
        const basicMFs = basicDetails.mutualFundsPortfolio
          .filter(item => item.folioNumber && !existingFolios.has(item.folioNumber))
          .map((item, index) => ({
            _id: `basic-mf-port-${index}`,
            broker: item.fundHouse,
            investorName: item.investorName,
            fundName: item.fundName,
            fundType: 'Growth', // Default assumption
            folioNumber: item.folioNumber,
            units: item.numberOfUnits,
            purchaseNAV: item.purchaseNAV,
            purchaseValue: parseFloat(item.purchaseValue) || 0,
            currentNAV: item.currentNAV,
            marketValue: parseFloat(item.currentValuation) || 0,
            profit: (parseFloat(item.currentValuation) || 0) - (parseFloat(item.purchaseValue) || 0),
            investmentType: 'lumpsum', // Assumption for portfolio items
            source: 'Basic Details (Portfolio)'
          }));
        setMutualFundsLumpsum(prev => [...prev, ...basicMFs]);
      }

      // Merge Basic Details Mutual Funds (Static Info)
      if (basicDetails && basicDetails.mutualFunds) {
        const existingFolios = new Set(lsFunds.map(mf => mf.folioNumber).filter(Boolean));
        const staticMFs = basicDetails.mutualFunds
          .filter(item => item.folioNo && !existingFolios.has(item.folioNo))
          .map((item, index) => ({
            _id: `basic-mf-static-${index}`,
            broker: item.fundHouse,
            investorName: item.investorName,
            fundName: item.mfName, // Note: Schema uses mfName for static, fundName for portfolio
            fundType: 'Growth', // Default assumption
            folioNumber: item.folioNo, // Note: Schema uses folioNo for static, folioNumber for portfolio
            units: 0,
            purchaseNAV: 0,
            purchaseValue: 0,
            currentNAV: 0,
            marketValue: 0,
            profit: 0,
            investmentType: 'lumpsum', // Assumption
            source: 'Basic Details (Static)'
          }));
        // Avoid duplicates if possible, or just append. 
        // User likely wants to see them even if 0 value.
        setMutualFundsLumpsum(prev => [...prev, ...staticMFs]);
      }

      // Set other data
      setShares(sharesRes.data.data.shares || []);

      // Separate insurance by type
      const allInsurance = insuranceRes.data.data.insurance || [];
      setLifeInsurance(allInsurance.filter(ins => ins.insuranceType === 'life'));
      setHealthInsurance(allInsurance.filter(ins => ins.insuranceType === 'health'));
      setGeneralInsurance(allInsurance.filter(ins => ins.insuranceType === 'general'));

    } catch (error) {
      console.error('Error fetching investment data:', error);
      setError('Failed to load investment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (id && id.toString().startsWith('basic-')) {
      alert('This record is imported from Basic Details. To remove it, please delete or edit it in the Family -> Basic Details section.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      setLoading(true);
      switch (type) {
        case 'mutual-fund':
          await investmentValuationAPI.deleteMutualFund(id);
          break;
        case 'share':
          await investmentValuationAPI.deleteShare(id);
          break;
        case 'insurance':
          await investmentValuationAPI.deleteInsurance(id);
          break;
        default:
          throw new Error('Unknown item type');
      }
      await fetchAllData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setError(`Failed to delete ${type}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNav = async (mutualFundId) => {
    setSipNavLoading(prev => ({ ...prev, [mutualFundId]: true }));
    try {
      await investmentValuationAPI.refreshMFNav(mutualFundId);
      await fetchAllData();
    } catch (err) {
      alert('Could not refresh NAV: ' + (err.response?.data?.message || err.message));
    } finally {
      setSipNavLoading(prev => ({ ...prev, [mutualFundId]: false }));
    }
  };

  const toggleSipExpand = (id) => setSipExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleRefreshLumpsumNav = async (groupId, mfIds) => {
    setLumpsumNavLoading(prev => ({ ...prev, [groupId]: true }));
    try {
      // Refresh NAV for all individual lumpsum records in this group sequentially to avoid rate limits
      for (const id of mfIds) {
        await investmentValuationAPI.refreshMFNav(id);
      }
      await fetchAllData();
    } catch (err) {
      console.warn('Could not refresh Lumpsum NAV:', err.message);
      alert('Could not refresh NAV for some funds: ' + (err.response?.data?.message || err.message));
    } finally {
      setLumpsumNavLoading(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const toggleLumpsumExpand = (groupId) => {
    setLumpsumExpanded(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };
  
  const handleRefreshShares = async () => {
    setSharesRefreshing(true);
    try {
      const res = await investmentValuationAPI.refreshAllShares();
      await fetchAllData();
      alert(`Refresh complete: ${res.data.message}`);
    } catch (err) {
      console.warn('Could not refresh Shares:', err.message);
      alert('Could not refresh share prices: ' + (err.response?.data?.message || err.message));
    } finally {
      setSharesRefreshing(false);
    }
  };

  // Modal handlers
  const openModal = (type, editData = null, subType = null) => {
    setModals(prev => ({
      ...prev,
      [type]: {
        isOpen: true,
        editData,
        type: subType || prev[type].type
      }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        isOpen: false,
        editData: null
      }
    }));
  };

  const handleModalSuccess = async () => {
    await fetchAllData();
  };

  // Calculate summary totals
  const summary = useMemo(() => {
    const mfLumpsumTotal = mutualFundsLumpsum.reduce((sum, item) => sum + (item.marketValue || 0), 0);
    const mfSipTotal = mutualFundsSIP.reduce((sum, item) => sum + (item.marketValue || 0), 0);
    const sharesTotal = shares.reduce((sum, item) => sum + (item.currentValuation || 0), 0);
    const lifeInsuranceTotal = lifeInsurance.reduce((sum, item) => sum + (item.sumAssured || 0), 0);
    const healthInsuranceTotal = healthInsurance.reduce((sum, item) => sum + (item.sumInsured || 0), 0);
    const generalInsuranceTotal = generalInsurance.reduce((sum, item) => sum + (item.sumInsured || 0), 0);

    const totalInvestments = mfLumpsumTotal + mfSipTotal + sharesTotal;
    const totalInsurance = lifeInsuranceTotal + healthInsuranceTotal + generalInsuranceTotal;

    return {
      totalInvestments,
      totalInsurance,
      netWorth: totalInvestments + totalInsurance,
      mutualFunds: mfLumpsumTotal + mfSipTotal,
      shares: sharesTotal,
      insurance: totalInsurance
    };
  }, [mutualFundsLumpsum, mutualFundsSIP, shares, lifeInsurance, healthInsurance, generalInsurance]);

  const chartData = [
    { name: 'Mutual Funds', value: summary.mutualFunds, color: '#2563EB' },
    { name: 'Shares', value: summary.shares, color: '#10B981' },
    { name: 'Insurance', value: summary.insurance, color: '#F59E0B' }
  ];

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      {label}
    </button>
  );

  const SummarySection = () => (
    <div className="summary-section">
      <div className="summary-header">
        <h2>Investment Portfolio Summary</h2>
        <p>Complete overview of all investments, insurance, and loans</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-black">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Investments</p>
            <h3 className="stat-value">₹{summary.totalInvestments.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-dark-gray">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Insurance</p>
            <h3 className="stat-value">₹{summary.totalInsurance.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-green-gradient">
            <FiPieChart />
          </div>
          <div className="stat-content">
            <p className="stat-label">Net Worth</p>
            <h3 className="stat-value" style={{ color: summary.netWorth >= 0 ? '#10B981' : '#EF4444' }}>
              ₹{summary.netWorth.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card premium">
          <div className="chart-header">
            <div className="chart-title">
              <FiPieChart className="chart-icon" />
              <h3>Portfolio Distribution</h3>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Value']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const MutualFundLumpsumSection = () => {
    // Group lumpsum funds by folioNumber + fundName
    const groups = useMemo(() => {
      const g = {};
      mutualFundsLumpsum.forEach(mf => {
        const key = `${mf.folioNumber}-${mf.fundName}`;
        if (!g[key]) {
          g[key] = {
            id: key,
            fundName: mf.fundName,
            fundType: mf.fundType,
            investorName: mf.investorName,
            folioNumber: mf.folioNumber,
            currentNAV: mf.currentNAV || 0,
            records: [],
            recordIds: []
          };
        }
        g[key].records.push(mf);
        // Only include actual Mongoose ObjectIds for API updates, not mock "basic-" IDs
        if (mf._id && !mf._id.startsWith('basic-')) {
          g[key].recordIds.push(mf._id);
        }
        // Note: For currentNAV, if different records have different NAVs temporarily, we just take the last one or max
        if (mf.currentNAV > g[key].currentNAV) {
          g[key].currentNAV = mf.currentNAV;
        }
      });
      return Object.values(g);
    }, [mutualFundsLumpsum]);

    return (
      <div className="investment-section">
        <div className="section-header">
          <h3>Mutual Fund Lumpsum</h3>
          <button className="btn-add-investment" onClick={() => openModal('mutualFund', null, 'lumpsum')}>
            <FiPlus /> Add New
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="no-data" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No Lumpsum investments found. Click "Add New" to add your first investment.
          </div>
        ) : (
          groups.map((group) => {
            const isExpanded = lumpsumExpanded[group.id] !== false;
            const isNavLoading = lumpsumNavLoading[group.id];

            // Sub-totals for the group
            const totalInvested = group.records.reduce((s, r) => s + (r.purchaseValue || 0), 0);
            const totalUnits = Math.round(group.records.reduce((s, r) => s + (r.units || 0), 0) * 1000) / 1000;
            const currentNAV = group.currentNAV;
            const totalCurrentValue = Math.round(totalUnits * currentNAV * 100) / 100;
            const gainLoss = Math.round((totalCurrentValue - totalInvested) * 100) / 100;
            const weightedAbsReturn = totalInvested > 0 ? Math.round((gainLoss / totalInvested) * 10000) / 100 : 0;

            return (
              <div key={group.id} style={{
                marginBottom: 28, border: '1px solid #e2e8f0',
                borderRadius: 12, overflow: 'hidden', background: 'white',
              }}>
                {/* Fund Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', background: '#f8fafc',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                  flexWrap: 'wrap', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <button
                      onClick={() => toggleLumpsumExpand(group.id)}
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}
                    >
                      {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{group.fundName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        <span style={{
                          background: '#eff6ff', color: '#2563eb',
                          padding: '1px 8px', borderRadius: 20, marginRight: 8, fontSize: 11, fontWeight: 600
                        }}>{group.fundType || 'Equity'}</span>
                        Folio: <strong>{group.folioNumber}</strong>
                        {group.investorName && <span style={{ marginLeft: 10 }}>• {group.investorName}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {currentNAV > 0 && (
                      <div style={{
                        background: '#f0fdf4', border: '1px solid #86efac',
                        padding: '3px 10px', borderRadius: 8, fontSize: 12, color: '#16a34a'
                      }}>
                        Current NAV: <strong>₹{n2(currentNAV)}</strong>
                      </div>
                    )}
                    {group.recordIds.length > 0 && (
                      <>
                        <button
                          className="edit-btn"
                          title="Refresh current NAV from mfapi.in"
                          onClick={() => handleRefreshLumpsumNav(group.id, group.recordIds)}
                          disabled={isNavLoading}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 10px' }}
                        >
                          <FiRefreshCw size={13} className={isNavLoading ? 'spinner' : ''} />
                          {isNavLoading ? 'Refreshing...' : 'Refresh NAV'}
                        </button>
                        <button className="edit-btn" onClick={() => openModal('mutualFund', group.records[0], 'lumpsum')}>
                          <FiEdit size={13} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete('mutual-fund', group.records[0]._id)}>
                          <FiTrash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Transactions Table */}
                {isExpanded && (
                  <div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="investment-table" style={{ margin: 0, fontSize: 13, borderBottom: 'none' }}>
                        <thead>
                          <tr style={{ background: 'white' }}>
                            <th style={{ padding: '12px 16px', color: '#64748b' }}>Date</th>
                            <th style={{ padding: '12px 16px', color: '#64748b' }}>Investor</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', textAlign: 'right' }}>Purchase NAV</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', textAlign: 'right' }}>Units</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', textAlign: 'right' }}>Curr. Value</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', textAlign: 'right' }}>Gain/Loss</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', textAlign: 'right' }}>Return</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.records.map((tx, idx) => {
                            // Basic Details records (Static or Portfolio) have mock IDs and cannot be edited/deleted here
                            const isEditable = !tx.source?.includes('Basic Details');
                            return (
                              <tr key={tx._id || idx}>
                                <td style={{ padding: '12px 16px' }}>{tx.investmentDate ? fmtDate(tx.investmentDate) : '-'}</td>
                                <td style={{ padding: '12px 16px' }}>{tx.investorName || '-'}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{fmtINR(tx.purchaseValue)}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{n3(tx.purchaseNAV)}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{n3(tx.units)}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#0f172a' }}>
                                  {fmtINR(tx.marketValue)}
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }} className={tx.profit >= 0 ? 'profit' : 'loss'}>
                                  {fmtINR(tx.profit)}
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }} className={tx.absoluteReturn >= 0 ? 'profit' : 'loss'}>
                                  {n2(tx.absoluteReturn)}%
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                  {isEditable ? (
                                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                      <button className="edit-btn" onClick={() => openModal('mutualFund', tx, 'lumpsum')}>
                                        <FiEdit />
                                      </button>
                                      <button className="delete-btn" onClick={() => handleDelete('mutual-fund', tx._id)}>
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{tx.source}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          
                          {/* Sub Total Row */}
                          {group.records.length > 0 && (
                            <tr style={{
                              background: '#f1f5f9', fontWeight: 700,
                              borderTop: '2px solid #e2e8f0'
                            }}>
                              <td colSpan="2">Sub Total</td>
                              <td style={{ textAlign: 'right' }}>{fmtINR(totalInvested)}</td>
                              <td style={{ textAlign: 'right', color: '#94a3b8', fontWeight: 400 }}>-</td>
                              <td style={{ textAlign: 'right' }}>{n3(totalUnits)}</td>
                              <td style={{ textAlign: 'right', color: '#0f172a' }}>{fmtINR(totalCurrentValue)}</td>
                              <td style={{ textAlign: 'right' }} className={gainLoss >= 0 ? 'profit' : 'loss'}>{fmtINR(gainLoss)}</td>
                              <td style={{ textAlign: 'right' }} className={weightedAbsReturn >= 0 ? 'profit' : 'loss'}>{n2(weightedAbsReturn)}%</td>
                              <td></td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Fund Summary Footer */}
                    {group.records.length > 0 && (
                      <div style={{
                        padding: '10px 16px', background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        fontSize: 12, color: '#64748b', display: 'flex', gap: 24, flexWrap: 'wrap'
                      }}>
                        <span>Total Invested: <strong style={{ color: '#1e293b' }}>{fmtINR(totalInvested)}</strong></span>
                        <span>Total Units: <strong style={{ color: '#1e293b' }}>{n3(totalUnits)}</strong></span>
                        <span>Current Value: <strong style={{ color: '#1e293b' }}>{fmtINR(totalCurrentValue)}</strong></span>
                        <span>Gain / (Loss): <strong className={gainLoss >= 0 ? 'profit' : 'loss'}>{fmtINR(gainLoss)}</strong></span>
                        <span>Return: <strong className={weightedAbsReturn >= 0 ? 'profit' : 'loss'}>{n2(weightedAbsReturn)}%</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const MutualFundSIPSection = () => {

    return (
      <div className="investment-section">
        <div className="section-header">
          <h3>Mutual Fund SIP</h3>
          <button className="btn-add-investment" onClick={() => openModal('mutualFund', null, 'sip')}>
            <FiPlus /> Add New
          </button>
        </div>

        {mutualFundsSIP.length === 0 ? (
          <div className="no-data" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
            No SIP investments found. Click "Add New" to add your first SIP.
          </div>
        ) : (
          mutualFundsSIP.map((mf) => {
            const txList = sipTransactions[mf._id] || [];
            const isExpanded = sipExpanded[mf._id] !== false;
            const isNavLoading = sipNavLoading[mf._id];

            // Sub-totals
            const totalInvested = txList.reduce((s, t) => s + (t.sipAmount || 0), 0);
            const totalUnits = Math.round(txList.reduce((s, t) => s + (t.units || 0), 0) * 1000) / 1000;
            const currentNAV = txList.length > 0 ? (txList[txList.length - 1].currentNAV || 0) : (mf.currentNAV || 0);
            const totalCurrentValue = Math.round(txList.reduce((s, t) => s + (t.currentValue || 0), 0) * 100) / 100;
            const gainLoss = Math.round((totalCurrentValue - totalInvested) * 100) / 100;
            const weightedAbsReturn = totalInvested > 0 ? Math.round((gainLoss / totalInvested) * 10000) / 100 : 0;

            return (
              <div key={mf._id} style={{
                marginBottom: 28, border: '1px solid #e2e8f0',
                borderRadius: 12, overflow: 'hidden', background: 'white',
              }}>
                {/* Fund Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', background: '#f8fafc',
                  borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                  flexWrap: 'wrap', gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <button
                      onClick={() => toggleSipExpand(mf._id)}
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}
                    >
                      {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{mf.fundName}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        <span style={{
                          background: '#eff6ff', color: '#2563eb',
                          padding: '1px 8px', borderRadius: 20, marginRight: 8, fontSize: 11, fontWeight: 600
                        }}>{mf.fundType}</span>
                        Folio: <strong>{mf.folioNumber}</strong>
                        {mf.investorName && <span style={{ marginLeft: 10 }}>• {mf.investorName}</span>}
                        {mf.sipDate && <span style={{ marginLeft: 10 }}>• SIP: {mf.sipDate}th every month</span>}
                        {mf.sipAmount && <span style={{ marginLeft: 10 }}>• {fmtINR(mf.sipAmount)}/mo</span>}
                      </div>

                      {/* Summary Metrics Row */}
                      <div style={{ 
                        marginTop: 8, 
                        display: 'flex', 
                        gap: 16, 
                        fontSize: 12,
                        padding: '4px 10px',
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: 8,
                        width: 'fit-content',
                        border: '1px solid rgba(226, 232, 240, 0.2)'
                      }}>
                        <span>Inv: <strong style={{ color: '#1e293b' }}>{fmtINR(totalInvested)}</strong></span>
                        <span>Val: <strong style={{ color: '#1e293b' }}>{fmtINR(totalCurrentValue)}</strong></span>
                        <span>G/L: <strong className={gainLoss >= 0 ? 'profit' : 'loss'}>{fmtINR(gainLoss)}</strong></span>
                        <span>Ret: <strong className={weightedAbsReturn >= 0 ? 'profit' : 'loss'}>{n2(weightedAbsReturn)}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
                    {currentNAV > 0 && (
                      <div style={{
                        background: '#f0fdf4', border: '1px solid #86efac',
                        padding: '4px 8px', borderRadius: 6, fontSize: 11, color: '#16a34a',
                        fontWeight: 600, whiteSpace: 'nowrap'
                      }}>
                        NAV: ₹{n2(currentNAV)}
                      </div>
                    )}
                    <button
                      title="Refresh current NAV from mfapi.in"
                      onClick={() => handleRefreshNav(mf._id)}
                      disabled={isNavLoading}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 4, 
                        fontSize: 10.5, fontWeight: 600, padding: '5px 10px',
                        background: isNavLoading ? '#f1f5f9' : '#fff7ed',
                        border: '1px solid #fbbf24',
                        color: '#9a3412',
                        borderRadius: 6,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      className="nav-refresh-btn"
                    >
                      <FiRefreshCw size={12} className={isNavLoading ? 'spinner' : ''} />
                      {isNavLoading ? 'Updating' : 'Refresh NAV'}
                    </button>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button 
                        className="edit-btn" 
                        onClick={() => openModal('mutualFund', mf, 'sip')}
                        style={{ padding: '0', minWidth: '32px', width: '32px', height: '32px', border: '1px solid #e2e8f0', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FiEdit size={14} />
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete('mutual-fund', mf._id)}
                        style={{ padding: '0', minWidth: '32px', width: '32px', height: '32px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transaction Table */}
                {isExpanded && (() => {
                  const isTableEditing = editingRow === mf._id;
                  const tableDrafts = editDrafts[mf._id] || {};

                  const enterEdit = () => {
                    setEditingRow(mf._id);
                    const init = {};
                    txList.forEach(tx => {
                      init[tx._id] = {
                        installmentDate: new Date(tx.installmentDate).toISOString().split('T')[0],
                        sipAmount: String(tx.sipAmount),
                        purchaseNAV: String(tx.purchaseNAV),
                        units: String(tx.units),
                      };
                    });
                    setEditDrafts(prev => ({ ...prev, [mf._id]: init }));
                  };

                  const cancelEdit = () => {
                    setEditingRow(null);
                    setEditDrafts(prev => { const n = { ...prev }; delete n[mf._id]; return n; });
                  };

                  const saveAll = async () => {
                    const liveCurrentNAV = currentNAV || 0;
                    const today = new Date();
                    try {
                      await Promise.all(
                        txList.map(tx => {
                          const d = tableDrafts[tx._id] || {};
                          const amt = parseFloat(d.sipAmount ?? tx.sipAmount) || 0;
                          const nav = parseFloat(d.purchaseNAV ?? tx.purchaseNAV) || 0;
                          const units = parseFloat(d.units ?? tx.units) || 0;
                          const dateVal = d.installmentDate ?? new Date(tx.installmentDate).toISOString().split('T')[0];
                          const currentValue = Math.round(units * liveCurrentNAV * 100) / 100;
                          const trnDays = Math.max(0, Math.floor((today - new Date(dateVal)) / 86400000));
                          const absReturn = amt > 0 ? Math.round(((currentValue - amt) / amt) * 10000) / 100 : 0;
                          const years = trnDays / 365;
                          const annReturn = (years > 0 && amt > 0 && currentValue > 0)
                            ? Math.round(((Math.pow(currentValue / amt, 1 / years)) - 1) * 10000) / 100
                            : null;
                          return investmentValuationAPI.updateSIPTransaction(tx._id, {
                            sipAmount: amt, purchaseNAV: nav,
                            installmentDate: new Date(dateVal),
                            units, currentNAV: liveCurrentNAV, currentValue,
                            transactionDays: trnDays, absoluteReturn: absReturn, annualizedReturn: annReturn,
                          });
                        })
                      );
                      cancelEdit();
                      const res = await investmentValuationAPI.getSIPTransactions({ mutualFundId: mf._id });
                      setSipTransactions(prev => ({ ...prev, [mf._id]: res.data.data.transactions || [] }));
                    } catch (err) {
                      alert('Failed to save one or more rows. Please try again.');
                    }
                  };

                  // Helper to get live derived values for a row
                  const derivedRow = (tx) => {
                    const d = isTableEditing ? (tableDrafts[tx._id] || {}) : {};
                    // Parse safely — allow empty string during editing without resetting to tx value
                    const rawAmt = isTableEditing ? d.sipAmount : null;
                    const rawNav = isTableEditing ? d.purchaseNAV : null;
                    const rawUnits = isTableEditing ? d.units : null;
                    
                    const amt = rawAmt != null ? (parseFloat(rawAmt) || 0) : tx.sipAmount;
                    const nav = rawNav != null ? (parseFloat(rawNav) || 0) : tx.purchaseNAV;
                    const units = rawUnits != null ? (parseFloat(rawUnits) || 0) : tx.units;
                    
                    const dateVal = isTableEditing ? (d.installmentDate ?? new Date(tx.installmentDate).toISOString().split('T')[0]) : new Date(tx.installmentDate).toISOString().split('T')[0];
                    const liveNAV = currentNAV || tx.currentNAV || 0;
                    const currentValue = Math.round(units * liveNAV * 100) / 100;
                    const trnDays = Math.max(0, Math.floor((new Date() - new Date(dateVal)) / 86400000));
                    const absReturn = amt > 0 ? Math.round(((currentValue - amt) / amt) * 10000) / 100 : 0;
                    const years = trnDays / 365;
                    const annReturn = (years > 0 && amt > 0 && currentValue > 0)
                      ? Math.round(((Math.pow(currentValue / amt, 1 / years)) - 1) * 10000) / 100
                      : null;
                    return { amt, nav, dateVal, units, liveNAV, currentValue, trnDays, absReturn, annReturn };
                  };

                  const setRowField = (txId, field, value) => {
                    setEditDrafts(prev => {
                      const fundDraft = { ...(prev[mf._id] || {}) };
                      const rowDraft = { ...(fundDraft[txId] || {}) };
                      rowDraft[field] = value;

                      // Connection Logic
                      if (field === 'sipAmount' || field === 'purchaseNAV') {
                        const amt = field === 'sipAmount' ? (parseFloat(value) || 0) : (parseFloat(rowDraft.sipAmount) || 0);
                        const nav = field === 'purchaseNAV' ? (parseFloat(value) || 0) : (parseFloat(rowDraft.purchaseNAV) || 0);
                        if (nav > 0) {
                          rowDraft.units = String(Math.round((amt / nav) * 1000) / 1000);
                        }
                      } else if (field === 'units') {
                        const units = parseFloat(value) || 0;
                        const nav = parseFloat(rowDraft.purchaseNAV) || 0;
                        if (nav > 0) {
                          rowDraft.sipAmount = String(Math.round(units * nav * 100) / 100);
                        }
                      }

                      fundDraft[txId] = rowDraft;
                      return { ...prev, [mf._id]: fundDraft };
                    });
                  };

                  return (
                    <div className="table-container" style={{ margin: 0, borderRadius: 0 }}>
                      {/* Table toolbar */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        padding: '8px 16px', borderBottom: '1px solid #e2e8f0',
                        background: isTableEditing ? '#fffbeb' : '#f8fafc', gap: 8
                      }}>
                        {isTableEditing ? (
                          <>
                            <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>✏️ Editing all rows — Date, Amount & NAV are editable</span>
                            <button onClick={saveAll} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                              ✓ Save All
                            </button>
                            <button onClick={cancelEdit} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                              ✗ Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={enterEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff7ed', color: '#d97706', border: '1px solid #fbbf24', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            <FiEdit size={12} /> Edit Table
                          </button>
                        )}
                      </div>

                      <table className="investment-table" style={{ fontSize: 12.5 }}>
                        <thead>
                          <tr>
                            <th>Sr.</th>
                            <th style={{ background: isTableEditing ? '#fef3c7' : '' }}>Date</th>
                            <th>Sub Type</th>
                            <th style={{ background: isTableEditing ? '#fef3c7' : '' }}>Amount (₹)</th>
                            <th style={{ background: isTableEditing ? '#fef3c7' : '' }}>Nav (₹)</th>
                            <th style={{ background: isTableEditing ? '#fef3c7' : '' }}>No. of Units</th>
                            <th>Trn Days</th>
                            <th>Current NAV (₹)</th>
                            <th>Current Value (₹)</th>
                            <th>Abs. Return (%)</th>
                            <th>Ann. Return (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {txList.length === 0 ? (
                            <tr>
                              <td colSpan="11" className="no-data">
                                No installments yet. Click "Refresh NAV" to regenerate or edit the fund and save again.
                              </td>
                            </tr>
                          ) : (
                            txList.map((tx, idx) => {
                              const { amt, nav, dateVal, units, liveNAV, currentValue, trnDays, absReturn, annReturn } = derivedRow(tx);
                              const d = isTableEditing ? (tableDrafts[tx._id] || {}) : {};
                              return (
                                <tr key={tx._id || idx} style={isTableEditing ? { background: '#fffdf0' } : {}}>
                                  <td>{idx + 1}</td>
                                  <td style={{ whiteSpace: 'nowrap', background: isTableEditing ? '#fffbeb' : '' }}>
                                    {isTableEditing ? (
                                      <input type="date" value={dateVal}
                                        onChange={e => setRowField(tx._id, 'installmentDate', e.target.value)}
                                        style={{ fontSize: 11, padding: '2px 4px', border: '1px solid #fbbf24', borderRadius: 4, width: 115 }} />
                                    ) : fmtDate(tx.installmentDate)}
                                  </td>
                                  <td>{tx.fundType || mf.fundType}</td>
                                  <td style={{ textAlign: 'right', background: isTableEditing ? '#fffbeb' : '' }}>
                                    {isTableEditing ? (
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={d.sipAmount ?? ''}
                                        placeholder={String(tx.sipAmount)}
                                        onChange={e => setRowField(tx._id, 'sipAmount', e.target.value)}
                                        style={{
                                          fontSize: 11, padding: '3px 6px', border: '1.5px solid #fbbf24',
                                          borderRadius: 5, width: 88, textAlign: 'right',
                                          background: '#fff', outline: 'none', boxShadow: '0 0 0 2px #fef3c7'
                                        }}
                                      />
                                    ) : fmtINR(tx.sipAmount)}
                                  </td>
                                  <td style={{ textAlign: 'right', background: isTableEditing ? '#fffbeb' : '' }}>
                                    {isTableEditing ? (
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={d.purchaseNAV ?? ''}
                                        placeholder={String(tx.purchaseNAV)}
                                        onChange={e => setRowField(tx._id, 'purchaseNAV', e.target.value)}
                                        style={{
                                          fontSize: 11, padding: '3px 6px', border: '1.5px solid #fbbf24',
                                          borderRadius: 5, width: 88, textAlign: 'right',
                                          background: '#fff', outline: 'none', boxShadow: '0 0 0 2px #fef3c7'
                                        }}
                                      />
                                    ) : n3(tx.purchaseNAV)}
                                  </td>
                                  <td style={{ textAlign: 'right', fontWeight: 600, background: isTableEditing ? '#fffbeb' : '' }}>
                                    {isTableEditing ? (
                                      <input
                                        type="text"
                                        inputMode="decimal"
                                        value={d.units ?? ''}
                                        placeholder={String(tx.units)}
                                        onChange={e => setRowField(tx._id, 'units', e.target.value)}
                                        style={{
                                          fontSize: 11, padding: '3px 6px', border: '1.5px solid #fbbf24',
                                          borderRadius: 5, width: 88, textAlign: 'right',
                                          background: '#fff', outline: 'none', boxShadow: '0 0 0 2px #fef3c7'
                                        }}
                                      />
                                    ) : n3(tx.units)}
                                  </td>
                                  <td style={{ textAlign: 'right' }}>{trnDays}</td>
                                  <td style={{ textAlign: 'right' }}>{n2(liveNAV)}</td>
                                  <td style={{ textAlign: 'right', color: isTableEditing ? '#d97706' : 'inherit' }}>{fmtINR(currentValue)}</td>
                                  <td className={absReturn >= 0 ? 'profit' : 'loss'} style={{ textAlign: 'right' }}>{`${n2(absReturn)}%`}</td>
                                  <td className={annReturn >= 0 ? 'profit' : 'loss'} style={{ textAlign: 'right' }}>{annReturn != null ? `${n2(annReturn)}%` : 'NA'}</td>
                                </tr>
                              );
                            })
                          )}
                          {/* Sub Total Row */}
                          {txList.length > 0 && (
                            <tr style={{ background: '#f1f5f9', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                              <td colSpan="3">Sub Total</td>
                              <td style={{ textAlign: 'right' }}>{fmtINR(totalInvested)}</td>
                              <td style={{ textAlign: 'right', color: '#94a3b8', fontWeight: 400 }}>-</td>
                              <td style={{ textAlign: 'right' }}>{n3(totalUnits)}</td>
                              <td>-</td>
                              <td style={{ textAlign: 'right' }}>{n2(currentNAV)}</td>
                              <td style={{ textAlign: 'right' }}>{fmtINR(totalCurrentValue)}</td>
                              <td className={weightedAbsReturn >= 0 ? 'profit' : 'loss'} style={{ textAlign: 'right' }}>{n2(weightedAbsReturn)}%</td>
                              <td>-</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* Fund Summary Footer */}
                      {txList.length > 0 && (
                        <div style={{
                          padding: '10px 16px', background: '#f8fafc',
                          borderTop: '1px solid #e2e8f0',
                          fontSize: 12, color: '#64748b', display: 'flex', gap: 24, flexWrap: 'wrap'
                        }}>
                          <span>Total Invested: <strong style={{ color: '#1e293b' }}>{fmtINR(totalInvested)}</strong></span>
                          <span>Total Units: <strong style={{ color: '#1e293b' }}>{n3(totalUnits)}</strong></span>
                          <span>Current Value: <strong style={{ color: '#1e293b' }}>{fmtINR(totalCurrentValue)}</strong></span>
                          <span>Gain / (Loss): <strong className={gainLoss >= 0 ? 'profit' : 'loss'}>{fmtINR(gainLoss)}</strong></span>
                          <span>Return: <strong className={weightedAbsReturn >= 0 ? 'profit' : 'loss'}>{n2(weightedAbsReturn)}%</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const SharesSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>Shares</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            className="btn-refresh-nav" 
            onClick={handleRefreshShares} 
            disabled={sharesRefreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: sharesRefreshing ? 0.6 : 1 }}
          >
            <FiRefreshCw className={sharesRefreshing ? 'spin' : ''} /> 
            {sharesRefreshing ? 'Refreshing...' : 'Refresh Prices'}
          </button>
          <button className="btn-add-investment" onClick={() => openModal('share')}>
            <FiPlus /> Add New
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Investment Broker</th>
              <th>Type of Purchase</th>
              <th>Holding Mode</th>
              <th>Demat Company</th>
              <th>Client ID</th>
              <th>DP ID</th>
              <th>Trading ID</th>
              <th>Investor Name</th>
              <th>Scrip Name</th>
              <th>Exchange</th>
              <th>Purchase Price</th>
              <th>Quantity</th>
              <th>Brokerage</th>
              <th>STT</th>
              <th>Other Charges</th>
              <th>Total Charges</th>
              <th>Purchase Amount</th>
              <th>Date of Purchase</th>
              <th>Current Price</th>
              <th>Current Valuation</th>
              <th>CAGR (%)</th>
              <th>Abs. Return (%)</th>
              <th>Unrealised P&L</th>
              <th>Scrip Holding (%)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shares.length === 0 ? (
              <tr>
                <td colSpan="24" className="no-data">No share investments found</td>
              </tr>
            ) : (
              shares.map((item, index) => (
                <tr key={index}>
                  <td>{item.broker}</td>
                  <td>{item.purchaseType}</td>
                  <td>{item.modeOfHolding || 'Demat'}</td>
                  <td>{item.dematCompany || '-'}</td>
                  <td>{item.clientId}</td>
                  <td>{item.dpId}</td>
                  <td>{item.tradingId}</td>
                  <td>{item.investorName}</td>
                  <td>{item.scripName}</td>
                  <td>{item.exchange || 'NSE'}</td>
                  <td>{fmtINR(item.purchasePrice)}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.brokerage}</td>
                  <td>₹{item.stt}</td>
                  <td>₹{item.otherCharges}</td>
                  <td>₹{item.totalCharges}</td>
                  <td>₹{item.purchaseAmount?.toLocaleString('en-IN')}</td>
                  <td>{fmtDate(item.purchaseDate)}</td>
                  <td>₹{item.currentPrice}</td>
                  <td className={item.unrealisedPL >= 0 ? 'profit' : 'loss'} style={{ fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.unrealisedPL >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                      ₹{item.currentValuation?.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td>{item.cagr}%</td>
                  <td>{item.absoluteReturn}%</td>
                  <td className={item.unrealisedPL >= 0 ? 'profit' : 'loss'}>{fmtINR(item.unrealisedPL)}</td>
                  <td>{n2(item.scripHolding)}%</td>
                  <td className="actions">
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => openModal('share', item)}>
                        <FiEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete('share', item._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const LifeInsuranceSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>Life Insurance</h3>
        <button className="btn-add-investment" onClick={() => openModal('insurance', null, 'life')}>
          <FiPlus /> Add New
        </button>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name of Customer</th>
              <th>Name of Company</th>
              <th>Name of Policy</th>
              <th>Policy Number</th>
              <th>Type of Policy</th>
              <th>Date of Purchase</th>
              <th>Premium Payment Mode</th>
              <th>Premium Date</th>
              <th>Premium Amount</th>
              <th>Last Date of Premium</th>
              <th>Maturity Date</th>
              <th>Sum Assured</th>
              <th>Maturity Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lifeInsurance.length === 0 ? (
              <tr>
                <td colSpan="14" className="no-data">No life insurance policies found</td>
              </tr>
            ) : (
              lifeInsurance.map((item, index) => (
                <tr key={index}>
                  <td>{item.customerName}</td>
                  <td>{item.companyName}</td>
                  <td>{item.policyName}</td>
                  <td>{item.policyNumber}</td>
                  <td>{item.policyType}</td>
                  <td>{item.purchaseDate}</td>
                  <td>{item.premiumPaymentMode}</td>
                  <td>{item.premiumDate}</td>
                  <td>₹{item.premiumAmount?.toLocaleString('en-IN')}</td>
                  <td>{item.lastPremiumDate}</td>
                  <td>{item.maturityDate}</td>
                  <td>₹{item.sumAssured?.toLocaleString('en-IN')}</td>
                  <td>₹{item.maturityAmount?.toLocaleString('en-IN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => openModal('insurance', item, 'life')}>
                        <FiEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete('insurance', item._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const HealthInsuranceSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>Health Insurance</h3>
        <button className="btn-add-investment" onClick={() => openModal('insurance', null, 'health')}>
          <FiPlus /> Add New
        </button>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name of Customer</th>
              <th>Name of Company</th>
              <th>Name of Policy</th>
              <th>Policy Number</th>
              <th>Type of Policy</th>
              <th>Date of Purchase</th>
              <th>Premium Date</th>
              <th>Premium Amount</th>
              <th>Sum Insured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {healthInsurance.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No health insurance policies found</td>
              </tr>
            ) : (
              healthInsurance.map((item, index) => (
                <tr key={index}>
                  <td>{item.customerName}</td>
                  <td>{item.companyName}</td>
                  <td>{item.policyName}</td>
                  <td>{item.policyNumber}</td>
                  <td>{item.policyType}</td>
                  <td>{item.purchaseDate}</td>
                  <td>{item.premiumDate}</td>
                  <td>₹{item.premiumAmount?.toLocaleString('en-IN')}</td>
                  <td>₹{item.sumInsured?.toLocaleString('en-IN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => openModal('insurance', item, 'health')}>
                        <FiEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete('insurance', item._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const GeneralInsuranceSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>General Insurance</h3>
        <button className="btn-add-investment" onClick={() => openModal('insurance', null, 'general')}>
          <FiPlus /> Add New
        </button>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name of Customer</th>
              <th>Name of Company</th>
              <th>Name of Policy</th>
              <th>Policy Number</th>
              <th>Type of Policy</th>
              <th>Category</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Term</th>
              <th>Premium Amount</th>
              <th>GST</th>
              <th>Total Premium</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {generalInsurance.length === 0 ? (
              <tr>
                <td colSpan="14" className="no-data">No general insurance policies found</td>
              </tr>
            ) : (
              generalInsurance.map((item, index) => (
                <tr key={index}>
                  <td>{item.customerName}</td>
                  <td>{item.companyName}</td>
                  <td>{item.policyName}</td>
                  <td>{item.policyNumber}</td>
                  <td>{item.policyType}</td>
                  <td>{item.policyCategory}</td>
                  <td>{item.policyStartDate ? fmtDate(item.policyStartDate) : '-'}</td>
                  <td>{item.policyEndDate ? fmtDate(item.policyEndDate) : '-'}</td>
                  <td>{item.policyTerm}</td>
                  <td>₹{item.premiumAmount?.toLocaleString('en-IN')}</td>
                  <td>₹{item.gstAmount?.toLocaleString('en-IN')}</td>
                  <td>₹{item.totalPremium?.toLocaleString('en-IN')}</td>
                  <td><span className={`status-badge ${item.paymentStatus?.toLowerCase()}`}>{item.paymentStatus}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => openModal('insurance', item, 'general')}>
                        <FiEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete('insurance', item._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );


  if (loading && mutualFundsLumpsum.length === 0) {
    return (
      <div className="investment-container">
        <div className="loading-state">
          <p>Loading investment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Investment Valuation</h1>
        <p>Complete portfolio overview with detailed analysis</p>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchAllData} className="retry-btn">
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <TabButton id="summary" label="Summary" isActive={activeTab === 'summary'} onClick={setActiveTab} />
          <TabButton id="mutual-lumpsum" label="Mutual Fund Lumpsum" isActive={activeTab === 'mutual-lumpsum'} onClick={setActiveTab} />
          <TabButton id="mutual-sip" label="Mutual Fund SIP" isActive={activeTab === 'mutual-sip'} onClick={setActiveTab} />
          <TabButton id="shares" label="Shares" isActive={activeTab === 'shares'} onClick={setActiveTab} />
          <TabButton id="life-insurance" label="Life Insurance" isActive={activeTab === 'life-insurance'} onClick={setActiveTab} />
          <TabButton id="health-insurance" label="Health Insurance" isActive={activeTab === 'health-insurance'} onClick={setActiveTab} />
          <TabButton id="general-insurance" label="General Insurance" isActive={activeTab === 'general-insurance'} onClick={setActiveTab} />
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && <SummarySection />}
        {activeTab === 'mutual-lumpsum' && <MutualFundLumpsumSection />}
        {activeTab === 'mutual-sip' && MutualFundSIPSection()}
        {activeTab === 'shares' && <SharesSection />}
        {activeTab === 'life-insurance' && <LifeInsuranceSection />}
        {activeTab === 'health-insurance' && <HealthInsuranceSection />}
        {activeTab === 'general-insurance' && <GeneralInsuranceSection />}
      </div>

      {/* Modals */}
      <MutualFundModal
        isOpen={modals.mutualFund.isOpen}
        onClose={() => closeModal('mutualFund')}
        onSuccess={handleModalSuccess}
        editData={modals.mutualFund.editData}
        investmentType={modals.mutualFund.type}
      />

      <ShareModal
        isOpen={modals.share.isOpen}
        onClose={() => closeModal('share')}
        onSuccess={handleModalSuccess}
        editData={modals.share.editData}
        shares={shares}
      />

      <InsuranceModal
        isOpen={modals.insurance.isOpen}
        onClose={() => closeModal('insurance')}
        onSuccess={handleModalSuccess}
        editData={modals.insurance.editData}
        insuranceType={modals.insurance.type}
      />
    </div>
  );
};

export default InvestmentValuationNew;