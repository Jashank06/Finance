import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiCheckCircle, FiClock, FiAlertCircle, FiZap, FiCalendar, FiCreditCard, FiArrowRight, FiTrendingUp, FiAward, FiStar } from 'react-icons/fi';
import './UserSubscription.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const UserSubscription = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    fetchUserData();
    fetchAvailablePlans();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      setUser(userData);
      
      // Calculate days remaining
      if (userData.subscriptionExpiry) {
        const expiry = new Date(userData.subscriptionExpiry);
        const today = new Date();
        const timeDiff = expiry.getTime() - today.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        setDaysRemaining(days);
      }

      // Set current plan
      if (userData.subscriptionPlan) {
        setCurrentPlan(userData.subscriptionPlan);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/subscription-plans/public`);
      setAvailablePlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: '#10b981', bg: '#d1fae5', icon: FiCheckCircle, text: 'Active' },
      trial: { color: '#3b82f6', bg: '#dbeafe', icon: FiClock, text: 'Trial' },
      expired: { color: '#ef4444', bg: '#fee2e2', icon: FiAlertCircle, text: 'Expired' },
      cancelled: { color: '#6b7280', bg: '#f3f4f6', icon: FiAlertCircle, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.trial;
    const Icon = config.icon;

    return (
      <div className="status-badge" style={{ background: config.bg, color: config.color }}>
        <Icon size={16} />
        <span>{config.text}</span>
      </div>
    );
  };

  const getDaysRemainingColor = (days) => {
    if (days < 0) return '#ef4444';
    if (days <= 7) return '#f59e0b';
    if (days <= 30) return '#3b82f6';
    return '#10b981';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="subscription-loading">
        <div className="spinner"></div>
        <p>Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="user-subscription-page">
      <div className="subscription-header">
        <FiAward size={48} style={{ marginBottom: '1rem', opacity: 0.9 }} />
        <h1>My Subscription</h1>
        <p>Manage your subscription plan and billing details</p>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <FiZap size={24} />
          </div>
          <div className="stat-info">
            <h4>Active Plan</h4>
            <p>{currentPlan?.name || 'No Plan'}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <FiCalendar size={24} />
          </div>
          <div className="stat-info">
            <h4>Days Left</h4>
            <p style={{ color: getDaysRemainingColor(daysRemaining), fontWeight: 700 }}>
              {daysRemaining > 0 ? daysRemaining : 0} Days
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <FiTrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h4>Status</h4>
            <p style={{ 
              color: user?.subscriptionStatus === 'active' ? '#10b981' : 
                     user?.subscriptionStatus === 'trial' ? '#3b82f6' : '#ef4444',
              fontWeight: 600,
              textTransform: 'capitalize'
            }}>
              {user?.subscriptionStatus || 'N/A'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <FiStar size={24} />
          </div>
          <div className="stat-info">
            <h4>Features</h4>
            <p>{currentPlan?.features?.length || 0} Enabled</p>
          </div>
        </div>
      </div>

      {/* Current Subscription Card */}
      <div className="current-subscription-card">
        <div className="card-header">
          <div className="header-left">
            <FiCreditCard size={24} />
            <h2>Current Plan</h2>
          </div>
          {user?.subscriptionStatus && getStatusBadge(user.subscriptionStatus)}
        </div>

        <div className="subscription-details">
          <div className="detail-row">
            <div className="detail-item">
              <label>Plan Name</label>
              <div className="detail-value plan-name">
                <FiZap size={20} />
                <span>{currentPlan?.name || 'No Active Plan'}</span>
              </div>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <div className="detail-value">
                {user?.subscriptionStatus || 'N/A'}
              </div>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <label>Started On</label>
              <div className="detail-value">
                <FiCalendar size={18} />
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>

            <div className="detail-item">
              <label>Expires On</label>
              <div className="detail-value">
                <FiCalendar size={18} />
                <span>{formatDate(user?.subscriptionExpiry)}</span>
              </div>
            </div>
          </div>

          {/* Days Remaining */}
          {user?.subscriptionExpiry && (
            <div className="days-remaining-banner" style={{ 
              borderColor: getDaysRemainingColor(daysRemaining),
              background: `${getDaysRemainingColor(daysRemaining)}10`
            }}>
              <FiClock size={24} color={getDaysRemainingColor(daysRemaining)} />
              <div style={{ flex: 1 }}>
                <h3 style={{ color: getDaysRemainingColor(daysRemaining) }}>
                  {daysRemaining > 0 ? `${daysRemaining} Days Remaining` : 'Subscription Expired'}
                </h3>
                <p>
                  {daysRemaining > 0 
                    ? `Your subscription will expire on ${formatDate(user.subscriptionExpiry)}`
                    : `Your subscription expired on ${formatDate(user.subscriptionExpiry)}`
                  }
                </p>
                {/* Progress Bar */}
                {daysRemaining > 0 && (
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ 
                        width: `${Math.min((daysRemaining / 365) * 100, 100)}%`,
                        background: getDaysRemainingColor(daysRemaining)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Plan Features */}
          {currentPlan && (
            <div className="current-plan-features">
              <h3>Your Plan Includes</h3>
              <div className="features-grid">
                {currentPlan.features?.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <FiCheckCircle size={18} color="#10b981" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade/Available Plans Section */}
      <div className="available-plans-section">
        <div className="section-header">
          <h2>Upgrade Your Plan</h2>
          <p>Choose a plan that fits your needs</p>
        </div>

        <div className="plans-grid">
          {availablePlans.map((plan) => {
            // Handle both string and object comparison for plan ID
            const currentPlanId = typeof currentPlan?._id === 'object' 
              ? currentPlan._id.toString() 
              : currentPlan?._id;
            const planId = typeof plan._id === 'object' 
              ? plan._id.toString() 
              : plan._id;
            const isCurrentPlan = currentPlanId === planId;
            
            return (
              <div 
                key={plan._id} 
                className={`plan-card ${isCurrentPlan ? 'current-plan' : ''} ${plan.isPopular ? 'popular' : ''}`}
              >
                {plan.isPopular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                {isCurrentPlan && (
                  <div className="current-badge">Current Plan</div>
                )}

                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <p className="plan-tagline">{plan.tagline}</p>
                </div>

                <div className="plan-price">
                  <span className="currency">{plan.currency}</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/{plan.period}</span>
                </div>

                {plan.description && (
                  <p className="plan-description">{plan.description}</p>
                )}

                <div className="plan-features">
                  {plan.features?.map((feature, index) => (
                    <div key={index} className="feature">
                      <FiCheckCircle size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className={`plan-button ${isCurrentPlan ? 'current' : ''}`}
                  disabled={isCurrentPlan}
                  onClick={() => {
                    if (!isCurrentPlan) {
                      // Implement upgrade logic here
                      alert('Upgrade functionality will be implemented soon. Please contact support.');
                    }
                  }}
                >
                  {isCurrentPlan ? 'Current Plan' : (
                    <>
                      {plan.buttonText || 'Upgrade Now'}
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History (Placeholder) */}
      <div className="billing-history-section">
        <h2>Billing History</h2>
        <div className="empty-state">
          <FiCreditCard size={48} color="#9ca3af" />
          <p>No billing history available</p>
        </div>
      </div>
    </div>
  );
};

export default UserSubscription;
