import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiClock, FiAlertCircle, FiZap, FiCalendar, FiCreditCard, FiArrowRight, FiTrendingUp, FiAward, FiStar, FiShield, FiHardDrive, FiShoppingCart, FiCheck, FiPackage, FiDatabase } from 'react-icons/fi';
import './UserSubscription.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const UserSubscription = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [activeTab, setActiveTab] = useState('plan'); // 'plan' or 'storage'

  // Storage states
  const [storagePlans, setStoragePlans] = useState([]);
  const [storageInfo, setStorageInfo] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchStorageData();
  }, []);

  const fetchStorageData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [plansRes, infoRes] = await Promise.all([
        axios.get(`${API_URL}/space-plans`),
        axios.get(`${API_URL}/space-plans/user/storage`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStoragePlans(plansRes.data);
      setStorageInfo(infoRes.data);
    } catch (error) {
      console.error('Error fetching storage data:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchaseStorage = async (plan) => {
    setPurchasing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('❌ Failed to load payment gateway. Please try again.');
        setPurchasing(false);
        return;
      }

      const token = localStorage.getItem('token');
      const orderResponse = await axios.post(`${API_URL}/payment/create-order`, {
        planId: plan._id,
        amount: plan.price,
        planType: 'space',
        email: user.email,
        name: user.name,
        contact: user.mobile || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { order, razorpayKeyId } = orderResponse.data;

      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Finance App - Space Management',
        description: `${plan.name} - ${plan.storageSize}GB Storage`,
        order_id: order.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile || ''
        },
        theme: { color: '#000000' },
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(`${API_URL}/payment/verify-space-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan._id
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (verifyResponse.data.success) {
              alert('✅ Space plan purchased successfully!');
              fetchStorageData();
            } else {
              alert('❌ Payment verification failed.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
          }
          setPurchasing(false);
        },
        modal: {
          ondismiss: () => setPurchasing(false)
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('❌ Error initiating payment');
      setPurchasing(false);
    }
  };

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: '#047857', bg: '#d1fae5', icon: FiCheckCircle, text: 'Active' },
      trial: { color: '#0369a1', bg: '#e0f2fe', icon: FiClock, text: 'Trial' },
      expired: { color: '#b91c1c', bg: '#fee2e2', icon: FiAlertCircle, text: 'Expired' },
      cancelled: { color: '#374151', bg: '#f3f4f6', icon: FiAlertCircle, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.trial;
    const Icon = config.icon;

    return (
      <div className="status-badge" style={{ background: config.bg, color: config.color }}>
        <Icon size={14} />
        <span>{config.text}</span>
      </div>
    );
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1>{activeTab === 'plan' ? 'My Subscription' : 'Storage Management'}</h1>
            <p>{activeTab === 'plan' 
              ? 'Manage your billing, view your plan details, and upgrade your account.'
              : 'Upgrade your storage space to keep more financial documents safely.'}
            </p>
          </div>
          {activeTab === 'plan' && (
            <button
              onClick={() => navigate('/landing/pricing')}
              className="plan-button"
              style={{ width: 'auto', padding: '0.8rem 1.5rem', marginTop: '0' }}
            >
              Upgrade Plan <FiArrowRight />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="subscription-tabs">
          <button 
            className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            <FiAward /> Subscription Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'storage' ? 'active' : ''}`}
            onClick={() => setActiveTab('storage')}
          >
            <FiHardDrive /> Storage & Space
          </button>
        </div>
      </div>

      {activeTab === 'plan' ? (
        <>
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FiZap />
              </div>
              <div className="stat-info">
                <h4>Active Plan</h4>
                <p>{currentPlan?.name || 'No Plan'}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FiClock />
              </div>
              <div className="stat-info">
                <h4>Days Left</h4>
                <p>{daysRemaining > 0 ? daysRemaining : 0} Days</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FiTrendingUp />
              </div>
              <div className="stat-info">
                <h4>Status</h4>
                <p style={{ textTransform: 'capitalize' }}>
                  {user?.subscriptionStatus || 'N/A'}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FiShield />
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
                <FiCreditCard size={28} />
                <h2>Current Plan</h2>
              </div>
              {user?.subscriptionStatus && getStatusBadge(user.subscriptionStatus)}
            </div>

            <div className="subscription-details">
              <div className="detail-row">
                <div className="detail-item">
                  <label>Plan Name</label>
                  <div className="detail-value plan-name">
                    {currentPlan?.name || 'No Active Plan'}
                  </div>
                </div>
                <div className="detail-item">
                  <label>Cost</label>
                  <div className="detail-value">
                    {currentPlan?.currency} {currentPlan?.price} <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '4px' }}>/{currentPlan?.period}</span>
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <label>Started On</label>
                  <div className="detail-value">
                    <FiCalendar size={18} color="#64748b" />
                    <span>{formatDate(user?.createdAt)}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <label>Expires On</label>
                  <div className="detail-value">
                    <FiCalendar size={18} color="#64748b" />
                    <span>{formatDate(user?.subscriptionExpiry)}</span>
                  </div>
                </div>
              </div>

              {/* Days Remaining Banner */}
              {user?.subscriptionExpiry && daysRemaining > 0 && (
                <div className="days-remaining-banner">
                  <div style={{ flex: 1 }}>
                    <h3>{daysRemaining} Days Remaining</h3>
                    <p>Your subscription is active and valid until {formatDate(user.subscriptionExpiry)}.</p>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min((daysRemaining / 365) * 100, 100)}%`,
                          background: daysRemaining < 30 ? '#ef4444' : '#000000'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Current Plan Features */}
              {currentPlan && (
                <div className="current-plan-features">
                  <h3>Plan Features Included</h3>
                  <div className="features-grid">
                    {currentPlan.features?.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <FiCheckCircle size={18} color="#000" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        </>
      ) : (
        <div className="storage-management-tab">
          {/* Storage Usage Overview */}
          <div className="usage-overview-card">
            <div className="usage-header">
              <div className="usage-title-info">
                <FiHardDrive size={32} />
                <div>
                  <h3>Storage Usage</h3>
                  <p>You have used {((storageInfo?.usedStorage || 0) / 1024).toFixed(2)} MB of {storageInfo?.totalStorage || 0} GB</p>
                </div>
              </div>
              <div className="usage-percentage">
                {storageInfo?.totalStorage > 0 ? ((storageInfo.usedStorage / (storageInfo.totalStorage * 1024 * 1024)) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="usage-progress-bar">
              <div 
                className="usage-progress-fill" 
                style={{ width: `${Math.min((storageInfo?.usedStorage || 0) / (storageInfo?.totalStorage * 1024 * 1024) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Storage Plans Grid */}
          <h2 className="section-subtitle">Available Storage Upgrades</h2>
          <div className="storage-plans-grid">
            {storagePlans.map(plan => (
              <div key={plan._id} className={`storage-plan-card ${plan.isPopular ? 'popular' : ''}`}>
                {plan.isPopular && <div className="popular-ribbon">Best Value</div>}
                <div className="storage-icon-box">
                  <FiPackage size={40} />
                </div>
                <h3 className="plan-storage-size">{plan.storageSize} GB</h3>
                <p className="plan-price-tag">{plan.currency}{plan.price} <span>/ {plan.period}</span></p>
                <ul className="plan-feature-list">
                  {plan.features.map((f, i) => (
                    <li key={i}><FiCheck size={14} /> {f}</li>
                  ))}
                </ul>
                <button 
                  className="buy-storage-btn" 
                  onClick={() => handlePurchaseStorage(plan)}
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Get Storage'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubscription;
