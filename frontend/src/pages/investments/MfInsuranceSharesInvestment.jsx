import { useEffect } from 'react';
import { FiPieChart, FiShield } from 'react-icons/fi';
import { trackFeatureUsage } from '../../utils/featureTracking';

const MfInsuranceSharesInvestment = () => {
  useEffect(() => {
    trackFeatureUsage('/family/investments/mf-insurance-shares', 'view');
  }, []);

  return (
    <div className="investment-container">
      <div className="investment-header">
        <h1>Mutual Funds, Insurance & Shares</h1>
      </div>
      
      <div className="coming-soon">
        <div className="coming-soon-icon">
          <FiPieChart />
        </div>
        <h2>Coming Soon</h2>
        <p>Comprehensive platform for managing Mutual Funds, Insurance policies, and Stock investments.</p>
        <div className="features-list">
          <h3>Features will include:</h3>
          <ul>
            <li>Mutual fund portfolio tracking</li>
            <li>SIP & lumpsum investments</li>
            <li>Life & Health insurance management</li>
            <li>Stock portfolio & demat integration</li>
            <li>NAV & market price tracking</li>
            <li>Insurance premium reminders</li>
            <li>Capital gain tax calculations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MfInsuranceSharesInvestment;
