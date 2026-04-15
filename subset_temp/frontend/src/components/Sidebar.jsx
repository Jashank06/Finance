import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import UpgradeModal from './UpgradeModal';
import './Sidebar.css';

const Sidebar = () => {
  const [familyOpen, setFamilyOpen] = useState(false);
  const [staticOpen, setStaticOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ isOpen: false, featureName: '' });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { hasFeatureAccess } = useFeatureAccess();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <Link to="/dashboard" className="sidebar-header">
        <h2>Dashboard</h2>
      </Link>

      <nav className="sidebar-nav">
        <Link to="/net-worth" className="nav-item" style={{ color: '#a78bfa', fontWeight: 600 }}>Net Worth</Link>

        {/* Family Section */}
        <div className="nav-section">
          <div
            className={`nav-item nav-header ${familyOpen ? 'active' : ''}`}
            onClick={() => setFamilyOpen(!familyOpen)}
          >
            Family
          </div>
          {familyOpen && (
            <div className="submenu">
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${dailyOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('daily_finance')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Daily Finance Management' });
                    } else {
                      setDailyOpen(!dailyOpen);
                    }
                  }}
                >
                  Daily {!hasFeatureAccess('daily_finance') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {dailyOpen && (
                  <div className="nested-submenu">
                    <Link to="/family/daily/cash-cards-bank" className="nested-submenu-item">Cash, Cards & Bank Transactions</Link>
                    <Link to="/family/daily/loan-udhar" className="nested-submenu-item">Udhar Lena / Dena / Credit Card / Loan / Wallet</Link>
                    <Link to="/family/daily/loan-amortization" className="nested-submenu-item">Loan Management</Link>
                    <Link to="/family/daily/manage-finance" className="nested-submenu-item">Manage Finance</Link>
                    <Link to="/family/daily/income-expenses" className="nested-submenu-item">Income & Expenses</Link>
                    <Link to="/family/daily/cheque-register" className="nested-submenu-item">Cheque Register</Link>
                    <Link to="/family/daily/daily-cash-register" className="nested-submenu-item">Daily Cash Register</Link>
                  </div>
                )}
              </div>
              <Link to="/family/tasks" className="submenu-item">Tasks to Do</Link>
              <Link to="/family/daily/telephone-conversation" className="submenu-item">Telephone Conversation</Link>
              <Link to="/family/static/contact-management" className="submenu-item">Contact Management</Link>
              <Link to="/documents" className="submenu-item">📁 Files & Folders</Link>
            </div>
          )}
        </div>




        <Link to="/libraries" className="nav-item">Libraries</Link>
        <Link to="/subscription" className="nav-item">Subscription Plan</Link>
        <Link to="/contact" className="nav-item">Contact Developer</Link>
        <div onClick={handleLogout} className="nav-item logout">Logout</div>
      </nav>

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false, featureName: '' })}
        featureName={upgradeModal.featureName}
      />
    </div>
  );
};

export default Sidebar;
