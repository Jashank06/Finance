import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import UpgradeModal from './UpgradeModal';
import './Sidebar.css';

const Sidebar = () => {
  const [familyOpen, setFamilyOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [investmentsOpen, setInvestmentsOpen] = useState(false);
  const [staticOpen, setStaticOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [businessDailyOpen, setBusinessDailyOpen] = useState(false);
  const [businessMonitoringOpen, setBusinessMonitoringOpen] = useState(false);
  const [businessInvestmentsOpen, setBusinessInvestmentsOpen] = useState(false);
  const [businessStaticOpen, setBusinessStaticOpen] = useState(false);
  const [businessReportsOpen, setBusinessReportsOpen] = useState(false);
  const [businessAnalyticsSubOpen, setBusinessAnalyticsSubOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [analyticsSubOpen, setAnalyticsSubOpen] = useState(false);
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
        <Link to="/finance-radar" className="nav-item" style={{ color: '#fb923c', fontWeight: 600 }}>Finance Radar</Link>

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
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${monitoringOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('monitoring')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Monitoring & Planning' });
                    } else {
                      setMonitoringOpen(!monitoringOpen);
                    }
                  }}
                >
                  Monitoring {!hasFeatureAccess('monitoring') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {monitoringOpen && (
                  <div className="nested-submenu">
                    <Link to="/family/monitoring/milestones" className="nested-submenu-item">Milestone & Task Timeline</Link>
                    <Link to="/family/monitoring/bill-dates" className="nested-submenu-item">Bill Dates</Link>
                    {/* <Link to="/family/daily/bill-paying" className="nested-submenu-item">Bill Paying Checklist</Link> */}
                    <Link to="/family/monitoring/multiple-calendars" className="nested-submenu-item">Multiple Calendars</Link>
                    <Link to="/family/monitoring/reminders-notifications" className="nested-submenu-item">Reminders, Notifications</Link>
                    <Link to="/family/monitoring/yearly-calendar" className="nested-submenu-item">Yearly Calendar</Link>
                    <Link to="/family/monitoring/weekly-appointment" className="nested-submenu-item">Weekly Appointment Chart</Link>
                    <Link to="/family/monitoring/portfolio" className="nested-submenu-item">Portfolio</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${investmentsOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('investments')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Investment Management' });
                    } else {
                      setInvestmentsOpen(!investmentsOpen);
                    }
                  }}
                >
                  Investments {!hasFeatureAccess('investments') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {investmentsOpen && (
                  <div className="nested-submenu">
                    <Link to="/family/investments/nps-ppf" className="nested-submenu-item">NPS / Post Office / PPF</Link>
                    <Link to="/family/investments/gold-sgb" className="nested-submenu-item">Gold / SGB / Silver / Bonds</Link>
                    <Link to="/family/investments/bank-schemes" className="nested-submenu-item">Bank Schemes - RD, FD</Link>
                    {/* <Link to="/family/investments/mf-insurance-shares" className="nested-submenu-item">MF, Insurance, Shares</Link> */}
                    <Link to="/family/investments/valuation-allocation" className="nested-submenu-item">Investment Valuation</Link>
                    <Link to="/family/monitoring/targets-for-life" className="nested-submenu-item">Targets for Life</Link>
                    <Link to="/family/investments/project-income-expense" className="nested-submenu-item">Project Wise Income / Expense</Link>
                    <Link to="/family/investments/profile" className="nested-submenu-item">Online Access</Link>
                    <Link to="/family/investments/retirement" className="nested-submenu-item">Retirement Financial</Link>
                    <Link to="/family/investments/trading-details" className="nested-submenu-item">Trading Details</Link>
                    <Link to="/family/investments/profit-loss" className="nested-submenu-item">Profit & Loss</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${staticOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('static_data')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Static Data & Records' });
                    } else {
                      setStaticOpen(!staticOpen);
                    }
                  }}
                >
                  Static {!hasFeatureAccess('static_data') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {staticOpen && (
                  <div className="nested-submenu">
                    <Link to="/family/static/basic-details" className="nested-submenu-item">Basic Details</Link>
                    {/* <Link to="/family/static/company-records" className="nested-submenu-item">Company Records</Link> */}
                    <Link to="/family/static/customer-support" className="nested-submenu-item">Customer Support</Link>
                    <Link to="/family/static/land-records" className="nested-submenu-item">Land Records</Link>
                    <Link to="/family/static/membership-list" className="nested-submenu-item">Membership List</Link>
                    <Link to="/family/static/online-access-details" className="nested-submenu-item">Online Access Details</Link>
                    <Link to="/family/static/mobile-email-details" className="nested-submenu-item">Mobile & Email Details</Link>
                    <Link to="/family/static/personal-records" className="nested-submenu-item">Personal Records</Link>
                    <Link to="/family/static/digital-assets" className="nested-submenu-item">Digital Assets</Link>
                    {/* <Link to="/family/static/family-profile" className="nested-submenu-item">Family Profile</Link> */}
                    <Link to="/family/static/inventory-record" className="nested-submenu-item">Inventory Record</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${reportsOpen ? 'active' : ''}`}
                  onClick={() => setReportsOpen(!reportsOpen)}
                >
                  Reports
                </div>
                {reportsOpen && (
                  <div className="nested-submenu">
                    <Link to="/reports/status-monitoring" className="nested-submenu-item">Status & Monitoring</Link>
                    <Link to="/reports/learning" className="nested-submenu-item">Learning</Link>
                    <Link to="/reports/want-in-action" className="nested-submenu-item">Want In Action</Link>
                    <Link to="/reports/expenses-spending" className="nested-submenu-item">Expenses / Spending</Link>
                    <Link to="/reports/date" className="nested-submenu-item">Date</Link>
                    <Link to="/reports/completion" className="nested-submenu-item">% Completion</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${analyticsSubOpen ? 'active' : ''}`}
                  onClick={() => setAnalyticsSubOpen(!analyticsSubOpen)}
                >
                  Analytics
                </div>
                {analyticsSubOpen && (
                  <div className="nested-submenu">
                    <Link to="/analytics/default-assumptions" className="nested-submenu-item">Default Assumptions & Mannual Inputs</Link>
                    <Link to="/analytics/recommendations" className="nested-submenu-item">Recommendations</Link>
                    <Link to="/analytics/goals-targets" className="nested-submenu-item">Goals & Targets Planned Vs Actual Vs Projections</Link>
                    <Link to="/analytics/expenses-levels" className="nested-submenu-item">Expenses Levels</Link>
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

        {/* Business Section */}
        <div className="nav-section">
          <div
            className={`nav-item nav-header ${businessOpen ? 'active' : ''}`}
            onClick={() => setBusinessOpen(!businessOpen)}
          >
            Business
          </div>
          {businessOpen && (
            <div className="submenu">
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${businessDailyOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('daily_finance')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Daily Finance Management' });
                    } else {
                      setBusinessDailyOpen(!businessDailyOpen);
                    }
                  }}
                >
                  Daily {!hasFeatureAccess('daily_finance') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {businessDailyOpen && (
                  <div className="nested-submenu">
                    <Link to="/business/daily/cash-cards-bank" className="nested-submenu-item">Cash, Cards & Bank Transactions</Link>
                    <Link to="/business/daily/loan-udhar" className="nested-submenu-item">Udhar Lena / Dena / Credit Card / Loan / Wallet</Link>
                    <Link to="/business/daily/loan-amortization" className="nested-submenu-item">Loan Management</Link>
                    <Link to="/business/daily/manage-finance" className="nested-submenu-item">Manage Finance</Link>
                    <Link to="/business/daily/income-expenses" className="nested-submenu-item">Income & Expenses</Link>
                    <Link to="/business/daily/cheque-register" className="nested-submenu-item">Cheque Register</Link>
                    <Link to="/business/daily/daily-cash-register" className="nested-submenu-item">Daily Cash Register</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${businessMonitoringOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('monitoring')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Monitoring & Planning' });
                    } else {
                      setBusinessMonitoringOpen(!businessMonitoringOpen);
                    }
                  }}
                >
                  Monitoring {!hasFeatureAccess('monitoring') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {businessMonitoringOpen && (
                  <div className="nested-submenu">
                    <Link to="/business/monitoring/milestones" className="nested-submenu-item">Milestone & Task Timeline</Link>
                    <Link to="/business/monitoring/bill-dates" className="nested-submenu-item">Bill Dates</Link>
                    <Link to="/business/monitoring/multiple-calendars" className="nested-submenu-item">Multiple Calendars</Link>
                    <Link to="/business/monitoring/reminders-notifications" className="nested-submenu-item">Reminders, Notifications</Link>
                    <Link to="/business/monitoring/yearly-calendar" className="nested-submenu-item">Yearly Calendar</Link>
                    <Link to="/business/monitoring/weekly-appointment" className="nested-submenu-item">Weekly Appointment Chart</Link>
                    <Link to="/business/monitoring/portfolio" className="nested-submenu-item">Portfolio</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${businessInvestmentsOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('investments')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Investment Management' });
                    } else {
                      setBusinessInvestmentsOpen(!businessInvestmentsOpen);
                    }
                  }}
                >
                  Investments {!hasFeatureAccess('investments') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {businessInvestmentsOpen && (
                  <div className="nested-submenu">
                    <Link to="/business/investments/nps-ppf" className="nested-submenu-item">NPS / Post Office / PPF</Link>
                    <Link to="/business/investments/gold-sgb" className="nested-submenu-item">Gold / SGB / Silver / Bonds</Link>
                    <Link to="/business/investments/bank-schemes" className="nested-submenu-item">Bank Schemes - RD, FD</Link>
                    <Link to="/business/investments/valuation-allocation" className="nested-submenu-item">Investment Valuation</Link>
                    <Link to="/business/monitoring/targets-for-life" className="nested-submenu-item">Targets for Life</Link>
                    <Link to="/business/investments/project-income-expense" className="nested-submenu-item">Project Wise Income / Expense</Link>
                    <Link to="/business/investments/profile" className="nested-submenu-item">Online Access</Link>
                    <Link to="/business/investments/retirement" className="nested-submenu-item">Retirement Financial</Link>
                    <Link to="/business/investments/trading-details" className="nested-submenu-item">Trading Details</Link>
                    <Link to="/business/investments/profit-loss" className="nested-submenu-item">Profit & Loss</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${businessStaticOpen ? 'active' : ''}`}
                  onClick={() => {
                    if (!hasFeatureAccess('static_data')) {
                      setUpgradeModal({ isOpen: true, featureName: 'Static Data & Records' });
                    } else {
                      setBusinessStaticOpen(!businessStaticOpen);
                    }
                  }}
                >
                  Static {!hasFeatureAccess('static_data') && <span style={{ marginLeft: 'auto' }}>🔒</span>}
                </div>
                {businessStaticOpen && (
                  <div className="nested-submenu">
                    <Link to="/company-profile" className="nested-submenu-item">🏢 Company Profile</Link>
                    <Link to="/business/static/basic-details" className="nested-submenu-item">Basic Details</Link>
                    <Link to="/business/static/customer-support" className="nested-submenu-item">Customer Support</Link>
                    <Link to="/business/static/land-records" className="nested-submenu-item">Land Records</Link>
                    <Link to="/business/static/membership-list" className="nested-submenu-item">Membership List</Link>
                    <Link to="/business/static/online-access-details" className="nested-submenu-item">Online Access Details</Link>
                    <Link to="/business/static/mobile-email-details" className="nested-submenu-item">Mobile & Email Details</Link>
                    <Link to="/business/static/personal-records" className="nested-submenu-item">Personal Records</Link>
                    <Link to="/business/static/digital-assets" className="nested-submenu-item">Digital Assets</Link>
                    <Link to="/business/static/inventory-record" className="nested-submenu-item">Inventory Record</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${businessReportsOpen ? 'active' : ''}`}
                  onClick={() => setBusinessReportsOpen(!businessReportsOpen)}
                >
                  Reports
                </div>
                {businessReportsOpen && (
                  <div className="nested-submenu">
                    <Link to="/business/reports/status-monitoring" className="nested-submenu-item">Status & Monitoring</Link>
                    <Link to="/business/reports/learning" className="nested-submenu-item">Learning</Link>
                    <Link to="/business/reports/want-in-action" className="nested-submenu-item">Want In Action</Link>
                    <Link to="/business/reports/expenses-spending" className="nested-submenu-item">Expenses / Spending</Link>
                    <Link to="/business/reports/date" className="nested-submenu-item">Date</Link>
                    <Link to="/business/reports/completion" className="nested-submenu-item">% Completion</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${businessAnalyticsSubOpen ? 'active' : ''}`}
                  onClick={() => setBusinessAnalyticsSubOpen(!businessAnalyticsSubOpen)}
                >
                  Analytics
                </div>
                {businessAnalyticsSubOpen && (
                  <div className="nested-submenu">
                    <Link to="/business/analytics/default-assumptions" className="nested-submenu-item">Default Assumptions & Mannual Inputs</Link>
                    <Link to="/business/analytics/recommendations" className="nested-submenu-item">Recommendations</Link>
                    <Link to="/business/analytics/goals-targets" className="nested-submenu-item">Goals & Targets Planned Vs Actual Vs Projections</Link>
                    <Link to="/business/analytics/expenses-levels" className="nested-submenu-item">Expenses Levels</Link>
                  </div>
                )}
              </div>
              <Link to="/business/tasks" className="submenu-item">Tasks to Do</Link>
              <Link to="/business/daily/telephone-conversation" className="submenu-item">Telephone Conversation</Link>
              <Link to="/business/static/contact-management" className="submenu-item">Contact Management</Link>
              <Link to="/business/documents" className="submenu-item">📁 Files & Folders</Link>
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
