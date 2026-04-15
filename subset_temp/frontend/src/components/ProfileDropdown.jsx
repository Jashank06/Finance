import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('user');
  const [uploading, setUploading] = useState(false);
  const [[c1, c2], setColors] = useState(['#000000', '#2d2d2d']);
  const [showLogoActions, setShowLogoActions] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowLogoActions(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 2MB as requested)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size should be less than 2MB');
      return;
    }

    setUploading(true);
    setShowLogoActions(false);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        try {
          const response = await authAPI.updateProfile({ avatar: base64String });
          if (response.data.success) {
            setUser({ ...user, avatar: base64String });
          }
        } catch (err) {
          console.error('Error uploading logo:', err);
          alert('Failed to upload logo');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setUploading(false);
    }
  };

  const handleDeleteLogo = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove your logo?')) return;

    setUploading(true);
    setShowLogoActions(false);
    try {
      const response = await authAPI.updateProfile({ avatar: null });
      if (response.data.success) {
        setUser({ ...user, avatar: null });
      }
    } catch (err) {
      console.error('Error deleting logo:', err);
      alert('Failed to delete logo');
    } finally {
      setUploading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const name = user.name || user.email || '';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    // Monochrome/Luxury Black & White Gradients
    const colors = [
      ['#000000', '#2d2d2d'], // Deep Black
      ['#ffffff', '#e0e0e0'], // Soft White
      ['#1a1a1a', '#4a4a4a'], // Gunmetal
      ['#f2f2f2', '#bfbfbf'], // Silver
      ['#333333', '#000000'], // Charcoal
    ];
    if (user) {
      const idx = (user.email || '').charCodeAt(0) % colors.length;
      setColors(colors[idx]);
    }
  }, [user]);

  const isDarkAvatar = c1 === '#000000' || c1 === '#1a1a1a' || c1 === '#333333';

  const familyLinks = [
    { icon: '👨‍👩‍👧‍👦', label: 'Family Profile', path: '/family-profile', desc: 'Members & overview' },
    { icon: '💰', label: 'Daily Finance', path: '/family/daily/cash-cards-bank', desc: 'Cash, cards & bank' },
    { icon: '📊', label: 'Investments', path: '/family/investments/valuation-allocation', desc: 'Valuation & P&L' },
    { icon: '📅', label: 'Monitoring', path: '/family/monitoring/bill-dates', desc: 'Bills & calendar' },
    { icon: '📁', label: 'Static Records', path: '/family/static/basic-details', desc: 'Documents & data' },
  ];

  const companyLinks = [
    { icon: '🏢', label: 'Company Profile', path: '/company-profile', desc: 'Business overview' },
    { icon: '📈', label: 'Net Worth', path: '/net-worth', desc: 'Assets & liabilities' },
    { icon: '🎯', label: 'Finance Radar', path: '/finance-radar', desc: 'Financial insights' },
    { icon: '📋', label: 'Subscription', path: '/subscription', desc: 'Plan & billing' },
    { icon: '📂', label: 'Documents', path: '/documents', desc: 'Files & folders' },
  ];

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleAvatarClick = () => {
    if (!user?.avatar) {
      fileInputRef.current.click();
    } else {
      setShowLogoActions(!showLogoActions);
    }
  };

  return (
    <div className="pd-wrapper" ref={dropdownRef}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Trigger Button */}
      <button
        className={`pd-trigger ${isOpen ? 'pd-active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Open profile menu"
      >
        <div
          className="pd-avatar"
          style={{ 
            background: user?.avatar ? 'none' : `linear-gradient(135deg, ${c1}, ${c2})`,
            color: isDarkAvatar ? '#fff' : '#000'
          }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="pd-avatar-img" />
          ) : (
            <span className="pd-avatar-initials">{getUserInitials()}</span>
          )}
          <div className="pd-avatar-glow" style={{ background: `radial-gradient(circle, ${isDarkAvatar ? '#ffffff' : '#000000'}22, transparent 70%)` }} />
        </div>
        <div className="pd-trigger-info">
          <span className="pd-trigger-name">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
          <span className="pd-trigger-role">Finance Account</span>
        </div>
        <svg
          className={`pd-trigger-chevron ${isOpen ? 'pd-rotated' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="pd-panel">
          {/* Liquid Background Layers */}
          <div className="pd-liquid-container">
            <div className="pd-liquid pd-liquid-1" />
            <div className="pd-liquid pd-liquid-2" />
            <div className="pd-liquid pd-liquid-3" />
          </div>

          {/* User Header */}
          <div className="pd-header">
            <div
              className="pd-panel-avatar pd-upload-trigger"
              onClick={() => !user?.avatar && fileInputRef.current.click()}
              title={user?.avatar ? "Logo options" : "Click to upload logo"}
              style={{ 
                background: user?.avatar ? 'none' : `linear-gradient(135deg, ${c1}, ${c2})`,
                color: isDarkAvatar ? '#fff' : '#000',
                border: isDarkAvatar ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.1)'
              }}
            >
              {/* Logo Action Overlay (Visible on Hover via CSS) */}
              {user?.avatar ? (
                <div className="pd-logo-actions-menu">
                  <button onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} title="Change Logo">
                    <span>🔄</span>
                  </button>
                  <button onClick={handleDeleteLogo} title="Remove Logo" className="pd-delete-icon">
                    <span>🗑️</span>
                  </button>
                </div>
              ) : (
                <div className="pd-avatar-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              )}

              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="pd-panel-avatar-img" />
              ) : (
                <span>{getUserInitials()}</span>
              )}
              <div className="pd-avatar-ring" style={{ borderColor: isDarkAvatar ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
            </div>
            <div className="pd-user-info">
              <h3 className="pd-name">{user?.name || 'User'}</h3>
              <p className="pd-email" title={user?.email}>{user?.email}</p>
              <div className="pd-badge">
                <span className="pd-badge-dot" />
                Active Account
              </div>
            </div>
          </div>

          <div className="pd-divider" />

          {/* Tab Navigation */}
          <div className="pd-tabs">
            <button
              className={`pd-tab-btn ${activeTab === 'user' ? 'pd-active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              <span>👤</span> Account
            </button>
            <button
              className={`pd-tab-btn ${activeTab === 'family' ? 'pd-active' : ''}`}
              onClick={() => setActiveTab('family')}
            >
              <span>🏠</span> Family
            </button>
            <button
              className={`pd-tab-btn ${activeTab === 'company' ? 'pd-active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              <span>🏢</span> Company
            </button>
          </div>

          {/* Tab Content */}
          <div className="pd-content">
            {activeTab === 'user' && (
              <div className="pd-tab-content pd-user-tab">
                <div className="pd-stat-grid">
                  <div className="pd-stat">
                    <div className="pd-stat-icon" style={{ background: '#000', color: '#fff' }}>💼</div>
                    <div className="pd-stat-text-wrap">
                      <div className="pd-stat-label">Account ID</div>
                      <div className="pd-stat-value">{user?._id?.slice(-6).toUpperCase() || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="pd-stat">
                    <div className="pd-stat-icon" style={{ background: '#fff', color: '#000', border: '1px solid #ddd' }}>📧</div>
                    <div className="pd-stat-text-wrap">
                      <div className="pd-stat-label">Email</div>
                      <div className="pd-stat-value pd-email-val" title={user?.email}>{user?.email || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="pd-stat">
                    <div className="pd-stat-icon" style={{ background: '#333', color: '#fff' }}>🔐</div>
                    <div className="pd-stat-text-wrap">
                      <div className="pd-stat-label">Plan</div>
                      <div className="pd-stat-value">{user?.subscriptionPlan?.name || 'Free'}</div>
                    </div>
                  </div>
                  <div className="pd-stat">
                    <div className="pd-stat-icon" style={{ background: '#f0f0f0', color: '#000', border: '1px solid #ddd' }}>✅</div>
                    <div className="pd-stat-text-wrap">
                      <div className="pd-stat-label">Status</div>
                      <div className="pd-stat-value" style={{ color: '#000' }}>Active</div>
                    </div>
                  </div>
                </div>
                {uploading && (
                  <div className="pd-uploading-indicator">
                    <span className="pd-spinner"></span>
                    <span>Processing...</span>
                  </div>
                )}
                <div className="pd-actions">
                  <button className="pd-action-btn pd-upgrade" onClick={() => navigateTo('/subscription')}>
                    <span>⭐</span> Upgrade Plan
                  </button>
                  <button className="pd-action-btn pd-danger" onClick={handleLogout}>
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'family' && (
              <div className="pd-tab-content">
                <p className="pd-tab-desc">Quick access to your Family Finance sections</p>
                <div className="pd-link-list">
                  {familyLinks.map((link) => (
                    <button
                      key={link.path}
                      className="pd-link-item"
                      onClick={() => navigateTo(link.path)}
                    >
                      <span className="pd-link-icon">{link.icon}</span>
                      <div className="pd-link-text">
                        <span className="pd-link-label">{link.label}</span>
                        <span className="pd-link-desc">{link.desc}</span>
                      </div>
                      <svg className="pd-link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="pd-tab-content">
                <p className="pd-tab-desc">Quick access to your Company Finance sections</p>
                <div className="pd-link-list">
                  {companyLinks.map((link) => (
                    <button
                      key={link.path}
                      className="pd-link-item"
                      onClick={() => navigateTo(link.path)}
                    >
                      <span className="pd-link-icon">{link.icon}</span>
                      <div className="pd-link-text">
                        <span className="pd-link-label">{link.label}</span>
                        <span className="pd-link-desc">{link.desc}</span>
                      </div>
                      <svg className="pd-link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
