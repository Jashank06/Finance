import { useEffect, useState, useMemo } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiDollarSign, FiActivity, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { investmentValuationAPI } from '../../utils/investmentValuationAPI';
import { staticAPI } from '../../utils/staticAPI';
import { investmentAPI } from '../../utils/investmentAPI';
import MutualFundModal from '../../components/MutualFundModal';
import ShareModal from '../../components/ShareModal';
import InsuranceModal from '../../components/InsuranceModal';
import LoanModal from '../../components/LoanModal';
import './Investment.css';

const InvestmentValuationNew = () => {
  // State for all investment data
  const [mutualFundsLumpsum, setMutualFundsLumpsum] = useState([]);
  const [mutualFundsSIP, setMutualFundsSIP] = useState([]);
  const [shares, setShares] = useState([]);
  const [lifeInsurance, setLifeInsurance] = useState([]);
  const [healthInsurance, setHealthInsurance] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [error, setError] = useState(null);

  // Modal states
  const [modals, setModals] = useState({
    mutualFund: { isOpen: false, editData: null, type: 'lumpsum' },
    share: { isOpen: false, editData: null },
    insurance: { isOpen: false, editData: null, type: 'life' },
    loan: { isOpen: false, editData: null }
  });

  // Fetch all data on component mount
  useEffect(() => {
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
      setMutualFundsLumpsum(allMutualFunds.filter(mf => mf.investmentType === 'lumpsum'));
      setMutualFundsSIP(allMutualFunds.filter(mf => mf.investmentType === 'sip'));

      // Merge Basic Details Mutual Funds (Portfolio)
      if (basicDetails && basicDetails.mutualFundsPortfolio) {
        const basicMFs = basicDetails.mutualFundsPortfolio.map((item, index) => ({
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
        const staticMFs = basicDetails.mutualFunds.map((item, index) => ({
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

      // Merge Basic Details Shares
      // Merge Basic Details Shares
      if (basicDetails && basicDetails.sharesPortfolio) {
        const basicShares = basicDetails.sharesPortfolio.map((item, index) => {
          // Basic Details has purchaseNAV, currentNAV, purchaseValue, currentValuation
          // Investment Valuation expects purchasePrice, currentPrice, purchaseAmount, currentValuation
          const purchasePrice = parseFloat(item.purchaseNAV) || 0;
          const currentPrice = parseFloat(item.currentNAV) || 0; // Mapping NAV to Price
          const quantity = parseFloat(item.numberOfUnits) || 0;
          const purchaseVal = parseFloat(item.purchaseValue) || 0;
          const currentVal = parseFloat(item.currentValuation) || 0;

          return {
            _id: `basic-share-${index}`,
            broker: item.dematCompany || '-',
            investorName: item.investorName || '-',
            scripName: item.scriptName || 'Unknown Script', // Note: scriptName vs scripName
            purchasePrice: purchasePrice,
            quantity: quantity,
            purchaseAmount: purchaseVal,
            currentPrice: currentPrice,
            currentValuation: currentVal,
            unrealisedPL: currentVal - purchaseVal,
            purchaseDate: item.dateOfPurchase ? new Date(item.dateOfPurchase).toLocaleDateString() : '-',
            source: 'Basic Details'
          };
        });
        setShares(prev => {
          // Filter out any duplicates if necessary, or just append
          // For now, simple append
          return [...prev, ...basicShares];
        });
      }

      // Separate insurance by type
      const allInsurance = insuranceRes.data.data.insurance || [];
      setLifeInsurance(allInsurance.filter(ins => ins.insuranceType === 'life'));
      setHealthInsurance(allInsurance.filter(ins => ins.insuranceType === 'health'));

      // Merge Basic Details Insurance (Life implied)
      if (basicDetails && basicDetails.insurancePortfolio) {
        const basicInsurance = basicDetails.insurancePortfolio.map((item, index) => ({
          _id: `basic-ins-${index}`,
          companyName: item.insuranceCompany,
          policyName: item.policyName,
          policyNumber: item.policyNumber,
          premiumAmount: parseFloat(item.premiumAmount) || 0,
          sumAssured: parseFloat(item.sumAssured) || 0,
          maturityDate: item.maturityDate,
          insuranceType: 'life',
          source: 'Basic Details'
        }));
        setLifeInsurance(prev => [...prev, ...basicInsurance]);
      }

      setLoans(loansRes.data.data.loans || []);

      // Merge Amortization Loans (Lent only)
      const lentLoans = amortizationLoans.filter(l => l.type === 'Lent').map(l => ({
        _id: l._id,
        debtorName: l.name, // Mapping Name to Debtor
        companyName: 'Personal Loan',
        loanType: 'Personal',
        commencementDate: l.startDate,
        closureDate: l.maturityDate,
        emiAmount: l.monthlyPayment, // Using calculated monthly payment
        // principalAmount: l.amount,
        balance: l.amount, // Using original amount as balance proxy if tracking not uniform
        source: 'Loan Amortization'
      }));

      setLoans(prev => [...prev, ...lentLoans]);

    } catch (error) {
      console.error('Error fetching investment data:', error);
      setError('Failed to load investment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
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
        case 'loan':
          await investmentValuationAPI.deleteLoan(id);
          break;
        default:
          throw new Error('Unknown item type');
      }

      // Refresh data after deletion
      await fetchAllData();

    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      setError(`Failed to delete ${type}. Please try again.`);
    } finally {
      setLoading(false);
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
    const loansTotal = loans.reduce((sum, item) => sum + (item.balance || 0), 0);

    const totalInvestments = mfLumpsumTotal + mfSipTotal + sharesTotal;
    const totalInsurance = lifeInsuranceTotal + healthInsuranceTotal;
    const totalLoans = loansTotal;

    return {
      totalInvestments,
      totalInsurance,
      totalLoans,
      netWorth: totalInvestments + totalInsurance - totalLoans,
      mutualFunds: mfLumpsumTotal + mfSipTotal,
      shares: sharesTotal,
      insurance: totalInsurance
    };
  }, [mutualFundsLumpsum, mutualFundsSIP, shares, lifeInsurance, healthInsurance, loans]);

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
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Investments</p>
            <h3 className="stat-value">₹{summary.totalInvestments.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Insurance</p>
            <h3 className="stat-value">₹{summary.totalInsurance.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiActivity />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Loans</p>
            <h3 className="stat-value">₹{summary.totalLoans.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
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

  const MutualFundLumpsumSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>Mutual Fund Lumpsum</h3>
        <button className="add-button" onClick={() => openModal('mutualFund', null, 'lumpsum')}>
          <FiPlus /> Add New
        </button>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Investment Broker</th>
              <th>Investor Name</th>
              <th>Name of Fund</th>
              <th>Type of Fund</th>
              <th>Folio Number</th>
              <th>No. Of Units</th>
              <th>Purchase NAV</th>
              <th>Purchase Value</th>
              <th>Current NAV</th>
              <th>Market Value</th>
              <th>Profit/Loss</th>
              <th>Transaction Days</th>
              <th>Annualized Return (%)</th>
              <th>Abs. Return (%)</th>
              <th>Holding Status</th>
              <th>Holding Pattern</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mutualFundsLumpsum.length === 0 ? (
              <tr>
                <td colSpan="17" className="no-data">No mutual fund lumpsum investments found</td>
              </tr>
            ) : (
              mutualFundsLumpsum.map((item, index) => (
                <tr key={item._id || index}>
                  <td>{item.broker}</td>
                  <td>{item.investorName}</td>
                  <td>{item.fundName}</td>
                  <td>{item.fundType}</td>
                  <td>{item.folioNumber}</td>
                  <td>{item.units}</td>
                  <td>₹{item.purchaseNAV?.toLocaleString('en-IN')}</td>
                  <td>₹{item.purchaseValue?.toLocaleString('en-IN')}</td>
                  <td>₹{item.currentNAV?.toLocaleString('en-IN')}</td>
                  <td>₹{item.marketValue?.toLocaleString('en-IN')}</td>
                  <td className={item.profit >= 0 ? 'profit' : 'loss'}>
                    ₹{item.profit?.toLocaleString('en-IN')}
                  </td>
                  <td>{item.transactionDays}</td>
                  <td>{item.annualizedReturn?.toFixed(2)}%</td>
                  <td>{item.absoluteReturn?.toFixed(2)}%</td>
                  <td>{item.holdingStatus}</td>
                  <td>{item.holdingPattern}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => openModal('mutualFund', item, 'lumpsum')}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete('mutual-fund', item._id)}
                      >
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

  const MutualFundSIPSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>Mutual Fund SIP</h3>
        <button className="add-button" onClick={() => openModal('mutualFund', null, 'sip')}>
          <FiPlus /> Add New
        </button>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Investment Broker</th>
              <th>Investor Name</th>
              <th>Name of Fund</th>
              <th>Type of Fund</th>
              <th>Folio Number</th>
              <th>SIP Date</th>
              <th>SIP Amount</th>
              <th>No. Of Units</th>
              <th>Purchase NAV</th>
              <th>Purchase Value</th>
              <th>Current NAV</th>
              <th>Market Value</th>
              <th>Profit/Loss</th>
              <th>Transaction Days</th>
              <th>Annualized Return (%)</th>
              <th>Abs. Return (%)</th>
              <th>Holding Status</th>
              <th>Holding Pattern</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mutualFundsSIP.length === 0 ? (
              <tr>
                <td colSpan="19" className="no-data">No mutual fund SIP investments found</td>
              </tr>
            ) : (
              mutualFundsSIP.map((item, index) => (
                <tr key={index}>
                  <td>{item.broker}</td>
                  <td>{item.investorName}</td>
                  <td>{item.fundName}</td>
                  <td>{item.fundType}</td>
                  <td>{item.folioNumber}</td>
                  <td>{item.sipDate}</td>
                  <td>₹{item.sipAmount?.toLocaleString('en-IN')}</td>
                  <td>{item.units}</td>
                  <td>₹{item.purchaseNAV}</td>
                  <td>₹{item.purchaseValue?.toLocaleString('en-IN')}</td>
                  <td>₹{item.currentNAV}</td>
                  <td>₹{item.marketValue?.toLocaleString('en-IN')}</td>
                  <td className={item.profit >= 0 ? 'profit' : 'loss'}>
                    ₹{item.profit?.toLocaleString('en-IN')}
                  </td>
                  <td>{item.transactionDays}</td>
                  <td>{item.annualizedReturn}%</td>
                  <td>{item.absoluteReturn}%</td>
                  <td>{item.holdingStatus}</td>
                  <td>{item.holdingPattern}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn"><FiEdit /></button>
                      <button className="delete-btn"><FiTrash2 /></button>
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

  const SharesSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>Shares</h3>
        <button className="add-button" onClick={() => openModal('share')}>
          <FiPlus /> Add New
        </button>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Investment Broker</th>
              <th>Type of Purchase</th>
              <th>Client ID</th>
              <th>DP ID</th>
              <th>Trading ID</th>
              <th>Investor Name</th>
              <th>Scrip Name</th>
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
              <th>Nominee</th>
              <th>Intra Day</th>
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
                  <td>{item.clientId}</td>
                  <td>{item.dpId}</td>
                  <td>{item.tradingId}</td>
                  <td>{item.investorName}</td>
                  <td>{item.scripName}</td>
                  <td>₹{item.purchasePrice}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.brokerage}</td>
                  <td>₹{item.stt}</td>
                  <td>₹{item.otherCharges}</td>
                  <td>₹{item.totalCharges}</td>
                  <td>₹{item.purchaseAmount?.toLocaleString('en-IN')}</td>
                  <td>{item.purchaseDate}</td>
                  <td>₹{item.currentPrice}</td>
                  <td>₹{item.currentValuation?.toLocaleString('en-IN')}</td>
                  <td>{item.cagr}%</td>
                  <td>{item.absoluteReturn}%</td>
                  <td className={item.unrealisedPL >= 0 ? 'profit' : 'loss'}>
                    ₹{item.unrealisedPL?.toLocaleString('en-IN')}
                  </td>
                  <td>{item.scripHolding}%</td>
                  <td>{item.nominee}</td>
                  <td>{item.intraDay ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn"><FiEdit /></button>
                      <button className="delete-btn"><FiTrash2 /></button>
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
        <button className="add-button" onClick={() => openModal('insurance', null, 'life')}>
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
                      <button className="edit-btn"><FiEdit /></button>
                      <button className="delete-btn"><FiTrash2 /></button>
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
        <button className="add-button" onClick={() => openModal('insurance', null, 'health')}>
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
                      <button className="edit-btn"><FiEdit /></button>
                      <button className="delete-btn"><FiTrash2 /></button>
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

  const LoansSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <h3>Loans</h3>
        <button className="add-button" onClick={() => openModal('loan')}>
          <FiPlus /> Add New
        </button>
      </div>

      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name of Debtor</th>
              <th>Name of Company/Bank</th>
              <th>Type of Loan</th>
              <th>Loan Commencement Date</th>
              <th>Loan Closure Date</th>
              <th>EMI Amount</th>
              <th>EMI Date</th>
              <th>Principal Amount</th>
              <th>Interest Amount</th>
              <th>Penalty</th>
              <th>Total EMI</th>
              <th>Balance</th>
              <th>Interest Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan="14" className="no-data">No loans found</td>
              </tr>
            ) : (
              loans.map((item, index) => (
                <tr key={index}>
                  <td>{item.debtorName}</td>
                  <td>{item.companyName}</td>
                  <td>{item.loanType}</td>
                  <td>{item.commencementDate}</td>
                  <td>{item.closureDate}</td>
                  <td>₹{item.emiAmount?.toLocaleString('en-IN')}</td>
                  <td>{item.emiDate}</td>
                  <td>₹{item.principalAmount?.toLocaleString('en-IN')}</td>
                  <td>₹{item.interestAmount?.toLocaleString('en-IN')}</td>
                  <td>₹{item.penalty?.toLocaleString('en-IN')}</td>
                  <td>₹{item.totalEmi?.toLocaleString('en-IN')}</td>
                  <td>₹{item.balance?.toLocaleString('en-IN')}</td>
                  <td>₹{item.interestPaid?.toLocaleString('en-IN')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn"><FiEdit /></button>
                      <button className="delete-btn"><FiTrash2 /></button>
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
          <TabButton id="loans" label="Loans" isActive={activeTab === 'loans'} onClick={setActiveTab} />
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && <SummarySection />}
        {activeTab === 'mutual-lumpsum' && <MutualFundLumpsumSection />}
        {activeTab === 'mutual-sip' && <MutualFundSIPSection />}
        {activeTab === 'shares' && <SharesSection />}
        {activeTab === 'life-insurance' && <LifeInsuranceSection />}
        {activeTab === 'health-insurance' && <HealthInsuranceSection />}
        {activeTab === 'loans' && <LoansSection />}
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
      />

      <InsuranceModal
        isOpen={modals.insurance.isOpen}
        onClose={() => closeModal('insurance')}
        onSuccess={handleModalSuccess}
        editData={modals.insurance.editData}
        insuranceType={modals.insurance.type}
      />

      <LoanModal
        isOpen={modals.loan.isOpen}
        onClose={() => closeModal('loan')}
        onSuccess={handleModalSuccess}
        editData={modals.loan.editData}
      />
    </div>
  );
};

export default InvestmentValuationNew;