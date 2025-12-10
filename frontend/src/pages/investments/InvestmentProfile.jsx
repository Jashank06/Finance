import { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiShield, FiCreditCard, FiDollarSign, FiPieChart, FiTrendingUp, FiDatabase } from 'react-icons/fi';
import { investmentProfileAPI } from '../../utils/investmentProfileAPI';
import BankAccountModal from '../../components/BankAccountModal';
import CardDetailModal from '../../components/CardDetailModal';
import PaymentGatewayModal from '../../components/PaymentGatewayModal';
import InsuranceProfileModal from '../../components/InsuranceProfileModal';
import MutualFundProfileModal from '../../components/MutualFundProfileModal';
import ShareProfileModal from '../../components/ShareProfileModal';
import './Investment.css';

const InvestmentProfile = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);
  const [paymentGateways, setPaymentGateways] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [mutualFunds, setMutualFunds] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bank-accounts');
  const [error, setError] = useState(null);
  
  const [modals, setModals] = useState({
    bankAccount: { isOpen: false, editData: null },
    cardDetail: { isOpen: false, editData: null },
    paymentGateway: { isOpen: false, editData: null },
    insurance: { isOpen: false, editData: null },
    mutualFund: { isOpen: false, editData: null },
    share: { isOpen: false, editData: null }
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        bankAccountsRes,
        cardDetailsRes,
        paymentGatewaysRes,
        insuranceRes,
        mutualFundsRes,
        sharesRes
      ] = await Promise.all([
        investmentProfileAPI.getBankAccounts(),
        investmentProfileAPI.getCardDetails(),
        investmentProfileAPI.getPaymentGateways(),
        investmentProfileAPI.getInsurance(),
        investmentProfileAPI.getMutualFunds(),
        investmentProfileAPI.getShares()
      ]);

      setBankAccounts(bankAccountsRes.data.data || []);
      setCardDetails(cardDetailsRes.data.data || []);
      setPaymentGateways(paymentGatewaysRes.data.data || []);
      setInsurance(insuranceRes.data.data || []);
      setMutualFunds(mutualFundsRes.data.data || []);
      setShares(sharesRes.data.data || []);

    } catch (error) {
      console.error('Error fetching investment profile data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      
      switch (type) {
        case 'bank-account':
          await investmentProfileAPI.deleteBankAccount(id);
          break;
        case 'card-detail':
          await investmentProfileAPI.deleteCardDetail(id);
          break;
        case 'payment-gateway':
          await investmentProfileAPI.deletePaymentGateway(id);
          break;
        case 'insurance':
          await investmentProfileAPI.deleteInsurance(id);
          break;
        case 'mutual-fund':
          await investmentProfileAPI.deleteMutualFund(id);
          break;
        case 'share':
          await investmentProfileAPI.deleteShare(id);
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

  const openModal = (type, editData = null) => {
    setModals(prev => ({
      ...prev,
      [type]: {
        isOpen: true,
        editData
      }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: {
        isOpen: false,
        editData: null
      }
    }));
  };

  const handleModalSuccess = async () => {
    await fetchAllData();
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      <Icon className="tab-icon" />
      {label}
    </button>
  );

  const BankAccountsSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <div>
          <h3>Bank Details</h3>
          <p className="section-subtitle">Manage your bank account information</p>
        </div>
        <button className="add-button" onClick={() => openModal('bankAccount')}>
          <FiPlus /> Add Bank Account
        </button>
      </div>
      
      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Bank</th>
              <th>Account Number</th>
              <th>URL</th>
              <th>User ID</th>
              <th>Password</th>
              <th>Transaction Password</th>
              <th>IFSC</th>
              <th>CIF</th>
              <th>Nominee</th>
              <th>Email ID</th>
              <th>Mobile Number</th>
              <th>Address</th>
              <th>Customer Care Number</th>
              <th>Customer Care Email ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bankAccounts.length === 0 ? (
              <tr>
                <td colSpan="16" className="no-data">No bank accounts found. Click "Add Bank Account" to get started.</td>
              </tr>
            ) : (
              bankAccounts.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.bank}</td>
                  <td>{item.accountNumber}</td>
                  <td>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">Link</a> : '-'}</td>
                  <td>{item.loginUserId || '-'}</td>
                  <td>{item.password ? '••••••••' : '-'}</td>
                  <td>{item.transactionPassword ? '••••••••' : '-'}</td>
                  <td>{item.ifsc || '-'}</td>
                  <td>{item.cif || '-'}</td>
                  <td>{item.nominee || '-'}</td>
                  <td>{item.emailId || '-'}</td>
                  <td>{item.mobileNumber || '-'}</td>
                  <td>{item.address || '-'}</td>
                  <td>{item.customerCareNumber || '-'}</td>
                  <td>{item.customerCareEmailId || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => openModal('bankAccount', item)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete('bank-account', item._id)}
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

  const CardDetailsSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <div>
          <h3>Card Details</h3>
          <p className="section-subtitle">Manage your credit and debit card information</p>
        </div>
        <button className="add-button" onClick={() => openModal('cardDetail')}>
          <FiPlus /> Add Card
        </button>
      </div>
      
      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type of Account</th>
              <th>Bank</th>
              <th>ATM Pin</th>
              <th>Account Number</th>
              <th>Card Number</th>
              <th>Expiry Date</th>
              <th>CVV</th>
              <th>Customer Care Number</th>
              <th>Customer Care Email ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cardDetails.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">No card details found. Click "Add Card" to get started.</td>
              </tr>
            ) : (
              cardDetails.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.typeOfAccount}</td>
                  <td>{item.bank}</td>
                  <td>{item.atmPin ? '••••' : '-'}</td>
                  <td>{item.accountNumber || '-'}</td>
                  <td>{item.cardNumber ? `****${item.cardNumber.slice(-4)}` : '-'}</td>
                  <td>{item.expiryDate || '-'}</td>
                  <td>{item.cvv ? '•••' : '-'}</td>
                  <td>{item.customerCareNumber || '-'}</td>
                  <td>{item.customerCareEmailId || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => openModal('cardDetail', item)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete('card-detail', item._id)}
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

  const PaymentGatewaysSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <div>
          <h3>Payment Gateway</h3>
          <p className="section-subtitle">Manage your payment gateway credentials</p>
        </div>
        <button className="add-button" onClick={() => openModal('paymentGateway')}>
          <FiPlus /> Add Payment Gateway
        </button>
      </div>
      
      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Login</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentGateways.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">No payment gateways found. Click "Add Payment Gateway" to get started.</td>
              </tr>
            ) : (
              paymentGateways.map((item) => (
                <tr key={item._id}>
                  <td><a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a></td>
                  <td>{item.login}</td>
                  <td>••••••••</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => openModal('paymentGateway', item)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete('payment-gateway', item._id)}
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

  const InsuranceSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <div>
          <h3>Insurance</h3>
          <p className="section-subtitle">Manage your insurance policy details</p>
        </div>
        <button className="add-button" onClick={() => openModal('insurance')}>
          <FiPlus /> Add Insurance
        </button>
      </div>
      
      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name of Insurer</th>
              <th>Name of Policy</th>
              <th>Insurance Type</th>
              <th>Policy Number</th>
              <th>URL</th>
              <th>User ID</th>
              <th>Password</th>
              <th>Tel No.</th>
              <th>Toll Free No.</th>
              <th>Email ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {insurance.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">No insurance policies found. Click "Add Insurance" to get started.</td>
              </tr>
            ) : (
              insurance.map((item) => (
                <tr key={item._id}>
                  <td>{item.nameOfInsurer}</td>
                  <td>{item.nameOfPolicy}</td>
                  <td>{item.insuranceType}</td>
                  <td>{item.policyNumber}</td>
                  <td>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">Link</a> : '-'}</td>
                  <td>{item.loginUserId || '-'}</td>
                  <td>{item.password ? '••••••••' : '-'}</td>
                  <td>{item.telNo || '-'}</td>
                  <td>{item.tollFreeNo || '-'}</td>
                  <td>{item.emailId || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => openModal('insurance', item)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete('insurance', item._id)}
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

  const MutualFundsSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <div>
          <h3>Mutual Fund</h3>
          <p className="section-subtitle">Manage your mutual fund account access</p>
        </div>
        <button className="add-button" onClick={() => openModal('mutualFund')}>
          <FiPlus /> Add Mutual Fund
        </button>
      </div>
      
      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Name of Person</th>
              <th>Company</th>
              <th>URL</th>
              <th>User ID</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mutualFunds.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No mutual fund details found. Click "Add Mutual Fund" to get started.</td>
              </tr>
            ) : (
              mutualFunds.map((item) => (
                <tr key={item._id}>
                  <td>{item.nameOfPerson}</td>
                  <td>{item.company}</td>
                  <td>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">Link</a> : '-'}</td>
                  <td>{item.loginUserId || '-'}</td>
                  <td>{item.password ? '••••••••' : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => openModal('mutualFund', item)}
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

  const SharesSection = () => (
    <div className="investment-section">
      <div className="section-header">
        <div>
          <h3>Shares</h3>
          <p className="section-subtitle">Manage your share trading account access</p>
        </div>
        <button className="add-button" onClick={() => openModal('share')}>
          <FiPlus /> Add Share
        </button>
      </div>
      
      <div className="table-container">
        <table className="investment-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>URL</th>
              <th>User ID</th>
              <th>Password</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shares.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No share details found. Click "Add Share" to get started.</td>
              </tr>
            ) : (
              shares.map((item) => (
                <tr key={item._id}>
                  <td>{item.company}</td>
                  <td>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">Link</a> : '-'}</td>
                  <td>{item.loginUserId || '-'}</td>
                  <td>{item.password ? '••••••••' : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => openModal('share', item)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete('share', item._id)}
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

  if (loading && bankAccounts.length === 0) {
    return (
      <div className="investment-container">
        <div className="loading-state">
          <p>Loading investment profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Investment Profile</h1>
        <p>Manage all your financial accounts and credentials in one place</p>
        
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
          <TabButton id="bank-accounts" label="Bank Details" icon={FiDatabase} isActive={activeTab === 'bank-accounts'} onClick={setActiveTab} />
          <TabButton id="card-details" label="Card Details" icon={FiCreditCard} isActive={activeTab === 'card-details'} onClick={setActiveTab} />
          <TabButton id="payment-gateways" label="Payment Gateway" icon={FiDollarSign} isActive={activeTab === 'payment-gateways'} onClick={setActiveTab} />
          <TabButton id="insurance" label="Insurance" icon={FiShield} isActive={activeTab === 'insurance'} onClick={setActiveTab} />
          <TabButton id="mutual-funds" label="Mutual Fund" icon={FiPieChart} isActive={activeTab === 'mutual-funds'} onClick={setActiveTab} />
          <TabButton id="shares" label="Shares" icon={FiTrendingUp} isActive={activeTab === 'shares'} onClick={setActiveTab} />
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'bank-accounts' && <BankAccountsSection />}
        {activeTab === 'card-details' && <CardDetailsSection />}
        {activeTab === 'payment-gateways' && <PaymentGatewaysSection />}
        {activeTab === 'insurance' && <InsuranceSection />}
        {activeTab === 'mutual-funds' && <MutualFundsSection />}
        {activeTab === 'shares' && <SharesSection />}
      </div>

      {/* Modals */}
      <BankAccountModal
        isOpen={modals.bankAccount.isOpen}
        onClose={() => closeModal('bankAccount')}
        onSuccess={handleModalSuccess}
        editData={modals.bankAccount.editData}
      />
      
      <CardDetailModal
        isOpen={modals.cardDetail.isOpen}
        onClose={() => closeModal('cardDetail')}
        onSuccess={handleModalSuccess}
        editData={modals.cardDetail.editData}
      />
      
      <PaymentGatewayModal
        isOpen={modals.paymentGateway.isOpen}
        onClose={() => closeModal('paymentGateway')}
        onSuccess={handleModalSuccess}
        editData={modals.paymentGateway.editData}
      />
      
      <InsuranceProfileModal
        isOpen={modals.insurance.isOpen}
        onClose={() => closeModal('insurance')}
        onSuccess={handleModalSuccess}
        editData={modals.insurance.editData}
      />
      
      <MutualFundProfileModal
        isOpen={modals.mutualFund.isOpen}
        onClose={() => closeModal('mutualFund')}
        onSuccess={handleModalSuccess}
        editData={modals.mutualFund.editData}
      />
      
      <ShareProfileModal
        isOpen={modals.share.isOpen}
        onClose={() => closeModal('share')}
        onSuccess={handleModalSuccess}
        editData={modals.share.editData}
      />
    </div>
  );
};

export default InvestmentProfile;
