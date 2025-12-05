import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="welcome-card">
        <h2>Welcome, {user?.name}!</h2>
        <p>Welcome to your Finance Management System</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Family Section</h3>
          <p>Manage your family finances, investments, and transactions</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Business Section</h3>
          <p>Track business finances, goals, and sales</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Quick Stats</h3>
          <p>View your financial overview and analytics</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <p>Check your recent transactions and updates</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
