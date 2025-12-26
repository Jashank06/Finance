import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const [familyOpen, setFamilyOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [investmentsOpen, setInvestmentsOpen] = useState(false);
  const [staticOpen, setStaticOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [businessDailyOpen, setBusinessDailyOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Finance App</h2>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className="nav-item">Dashboard</Link>
        <Link to="/family-profile" className="nav-item">Family Profile</Link>
        <Link to="/company-profile" className="nav-item">Company Profile</Link>

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
                  onClick={() => setDailyOpen(!dailyOpen)}
                >
                  Daily
                </div>
                {dailyOpen && (
                  <div className="nested-submenu">
                    <Link to="/family/daily/cash-cards-bank" className="nested-submenu-item">Cash, Cards & Bank Transactions</Link>
                    <Link to="/family/daily/loan-udhar" className="nested-submenu-item">Udhar Lena/Dena</Link>
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
                  onClick={() => setMonitoringOpen(!monitoringOpen)}
                >
                  Monitoring
                </div>
                {monitoringOpen && (
                  <div className="nested-submenu">
                    <Link to="/family/monitoring/milestones" className="nested-submenu-item">Milestone & Task Timeline</Link>
                    <Link to="/family/monitoring/targets-for-life" className="nested-submenu-item">Targets for Life</Link>
                    <Link to="/family/monitoring/bill-dates" className="nested-submenu-item">Bill Dates</Link>
                    {/* <Link to="/family/daily/bill-paying" className="nested-submenu-item">Bill Paying Checklist</Link> */}
                    <Link to="/family/monitoring/multiple-calendars" className="nested-submenu-item">Multiple Calendars</Link>
                    <Link to="/family/monitoring/reminders-notifications" className="nested-submenu-item">Reminders, Notifications</Link>
                    <Link to="/family/monitoring/yearly-calendar" className="nested-submenu-item">Yearly Calendar</Link>
                    <Link to="/family/monitoring/weekly-appointment" className="nested-submenu-item">Weekly Appointment Chart</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${investmentsOpen ? 'active' : ''}`}
                  onClick={() => setInvestmentsOpen(!investmentsOpen)}
                >
                  Investments
                </div>
                {investmentsOpen && (
                  <div className="nested-submenu">
                    <Link to="/family/investments/nps-ppf" className="nested-submenu-item">NPS / Post Office / PPF</Link>
                    <Link to="/family/investments/gold-sgb" className="nested-submenu-item">Gold / SGB / Silver / Bonds</Link>
                    <Link to="/family/investments/bank-schemes" className="nested-submenu-item">Bank Schemes - RD, FD</Link>
                    {/* <Link to="/family/investments/mf-insurance-shares" className="nested-submenu-item">MF, Insurance, Shares</Link> */}
                    <Link to="/family/investments/valuation-allocation" className="nested-submenu-item">Investment Valuation & Sectoral Allocation</Link>
                    <Link to="/family/investments/project-income-expense" className="nested-submenu-item">Project Wise Income / Expense</Link>
                    <Link to="/family/investments/profile" className="nested-submenu-item">Online Access</Link>
                    <Link to="/family/investments/loan-amortization" className="nested-submenu-item">Loan Amortization</Link>
                    <Link to="/family/investments/retirement" className="nested-submenu-item">Retirement Financial</Link>
                    <Link to="/family/investments/trading-details" className="nested-submenu-item">Trading Details</Link>
                    <Link to="/family/investments/profit-loss" className="nested-submenu-item">Profit & Loss</Link>
                  </div>
                )}
              </div>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${staticOpen ? 'active' : ''}`}
                  onClick={() => setStaticOpen(!staticOpen)}
                >
                  Static
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
              <Link to="/family/analytics" className="submenu-item">Analytics</Link>
              <Link to="/family/tasks" className="submenu-item">Tasks to Do</Link>
              <Link to="/family/daily/telephone-conversation" className="submenu-item">Telephone Conversation</Link>
              <Link to="/family/static/contact-management" className="submenu-item">Contact Management</Link>
              <Link to="/family/files" className="submenu-item">Files & Folders</Link>
            </div>
          )}
        </div>

        {/* Business Section */}
        {/* Business Section */}
        {/* <div className="nav-section">
          <div
            className={`nav-item nav-header ${businessOpen ? 'active' : ''}`}
            onClick={() => setBusinessOpen(!businessOpen)}
          >
            Business
          </div>
          {businessOpen && (
            <div className="submenu">
              <Link to="/business/investments" className="submenu-item">Investments</Link>
              <div className="nav-subsection">
                <div
                  className={`submenu-item nav-header ${businessDailyOpen ? 'active' : ''}`}
                  onClick={() => setBusinessDailyOpen(!businessDailyOpen)}
                >
                  Daily
                </div>
                {businessDailyOpen && (
                  <div className="nested-submenu">
                    <Link to="/business/daily/cash-cards-bank" className="nested-submenu-item">Cash, Cards & Bank Transactions</Link>
                    <Link to="/business/daily/loan-udhar" className="nested-submenu-item">Udhar Lena/Dena</Link>
                    <Link to="/business/daily/bill-paying" className="nested-submenu-item">Bill Paying Checklist</Link>
                    <Link to="/business/daily/income-expenses" className="nested-submenu-item">Income & Expenses</Link>
                    <Link to="/business/daily/telephone-conversation" className="nested-submenu-item">Telephone Conversation</Link>
                  </div>
                )}
              </div>
              <Link to="/business/monitoring" className="submenu-item">Monitoring</Link>
              <Link to="/business/static" className="submenu-item">Static</Link>
              <Link to="/business/analytics" className="submenu-item">Analytics</Link>
              <Link to="/business/goals" className="submenu-item">Goal & Targets</Link>
              <Link to="/business/business" className="submenu-item">Business</Link>
              <Link to="/business/sales" className="submenu-item">Sales</Link>
              <Link to="/business/tasks" className="submenu-item">Tasks to Do</Link>
              <Link to="/business/files" className="submenu-item">Files & Folders</Link>
            </div>
          )}
        </div> */}

        <Link to="/libraries" className="nav-item">Libraries</Link>
        <Link to="/subscription" className="nav-item">Subscription Plan</Link>
        <Link to="/feedback" className="nav-item">Feedback</Link>
        <Link to="/contact" className="nav-item">Contact Developer</Link>
        <div onClick={handleLogout} className="nav-item logout">Logout</div>
      </nav>
    </div>
  );
};

export default Sidebar;
