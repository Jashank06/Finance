import { useState, useEffect } from 'react';
import './AdminPages.css';
import { FiEdit, FiTrash2, FiSearch, FiClock, FiCalendar, FiUsers, FiAlertCircle } from 'react-icons/fi';
import '../investments/Investment.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SubscriberManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extensionDays, setExtensionDays] = useState(30);
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchSubscribers();
        fetchStats();
    }, [filterStatus]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setSubscribers(response.data.users);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching subscribers:', err);
            setError(err.response?.data?.message || 'Failed to fetch subscribers');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users/stats/overview`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleSearch = () => {
        fetchSubscribers();
    };

    const handleExtendSubscription = async () => {
        if (!selectedUser || !extensionDays) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                `${API_URL}/users/${selectedUser._id}/subscription`,
                { extensionDays: parseInt(extensionDays) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Subscription extended successfully!');
                setShowExtendModal(false);
                setSelectedUser(null);
                setExtensionDays(30);
                fetchSubscribers();
                fetchStats();
            }
        } catch (err) {
            console.error('Error extending subscription:', err);
            alert(err.response?.data?.message || 'Failed to extend subscription');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                alert('User deleted successfully!');
                fetchSubscribers();
                fetchStats();
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: { bg: '#10b98115', color: '#10b981' },
            trial: { bg: '#3b82f615', color: '#3b82f6' },
            expired: { bg: '#ef444415', color: '#ef4444' },
            cancelled: { bg: '#6b728015', color: '#6b7280' }
        };
        return colors[status] || colors.trial;
    };

    const getPlanColor = (planName) => {
        if (!planName) return { bg: '#6b728015', color: '#6b7280' };
        
        const name = planName.toLowerCase();
        if (name.includes('premium') || name.includes('enterprise')) {
            return { bg: '#8b5cf615', color: '#8b5cf6' };
        } else if (name.includes('pro') || name.includes('professional')) {
            return { bg: '#10b98115', color: '#10b981' };
        }
        return { bg: '#3b82f615', color: '#3b82f6' };
    };

    const getDaysRemaining = (expiryDate) => {
        if (!expiryDate) return null;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const filteredSubscribers = subscribers.filter(sub => {
        const matchesSearch = 
            sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="investment-container">
            <div className="investment-header">
                <h1>Subscriber Management</h1>
                <p>Manage all platform subscribers and their subscriptions</p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem', 
                    marginBottom: '2rem' 
                }}>
                    <div style={{ 
                        background: '#fff', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiUsers style={{ color: '#3b82f6' }} />
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Users</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                            {stats.totalUsers}
                        </div>
                    </div>

                    <div style={{ 
                        background: '#fff', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiCalendar style={{ color: '#10b981' }} />
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Active</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                            {stats.activeSubscriptions}
                        </div>
                    </div>

                    <div style={{ 
                        background: '#fff', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiClock style={{ color: '#3b82f6' }} />
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Trial</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                            {stats.trialUsers}
                        </div>
                    </div>

                    <div style={{ 
                        background: '#fff', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiAlertCircle style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Expired</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                            {stats.expiredSubscriptions}
                        </div>
                    </div>
                </div>
            )}

            <div className="investment-section">
                <div className="section-header">
                    <div style={{ flex: 1 }}>
                        <h3>All Subscribers</h3>
                        <p className="section-subtitle">{filteredSubscribers.length} subscribers</p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Filter by Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                minWidth: '120px'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="trial">Trial</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <FiSearch style={{ 
                                position: 'absolute', 
                                left: '10px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: '#6b7280' 
                            }} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                style={{
                                    paddingLeft: '2.5rem',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    width: '300px'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        Loading subscribers...
                    </div>
                ) : error ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem', 
                        color: '#ef4444',
                        background: '#fef2f2',
                        borderRadius: '8px',
                        margin: '1rem'
                    }}>
                        {error}
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="investments-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Plan</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                    <th>Expiry Date</th>
                                    <th>Days Left</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                            No subscribers found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubscribers.map(sub => {
                                        const daysLeft = getDaysRemaining(sub.subscriptionExpiry);
                                        const statusColor = getStatusColor(sub.subscriptionStatus);
                                        const planColor = getPlanColor(sub.subscriptionPlan?.name);

                                        return (
                                            <tr key={sub._id}>
                                                <td><strong>{sub.name}</strong></td>
                                                <td>{sub.email}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        background: planColor.bg,
                                                        color: planColor.color,
                                                        fontWeight: '500'
                                                    }}>
                                                        {sub.subscriptionPlan?.name || 'No Plan'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        background: statusColor.bg,
                                                        color: statusColor.color,
                                                        fontWeight: '500',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {sub.subscriptionStatus}
                                                    </span>
                                                </td>
                                                <td>{new Date(sub.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td>
                                                    {sub.subscriptionExpiry 
                                                        ? new Date(sub.subscriptionExpiry).toLocaleDateString('en-IN')
                                                        : '-'
                                                    }
                                                </td>
                                                <td>
                                                    {daysLeft !== null ? (
                                                        <span style={{
                                                            color: daysLeft < 7 ? '#ef4444' : daysLeft < 30 ? '#f59e0b' : '#10b981',
                                                            fontWeight: '500'
                                                        }}>
                                                            {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td>
                                                    <div className="investment-actions">
                                                        <button 
                                                            className="btn-icon" 
                                                            title="Extend Subscription"
                                                            onClick={() => {
                                                                setSelectedUser(sub);
                                                                setShowExtendModal(true);
                                                            }}
                                                        >
                                                            <FiClock />
                                                        </button>
                                                        <button 
                                                            className="btn-icon btn-danger" 
                                                            title="Delete User"
                                                            onClick={() => handleDeleteUser(sub._id, sub.name)}
                                                            disabled={sub.isAdmin}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Extend Subscription Modal */}
            {showExtendModal && selectedUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Extend Subscription</h3>
                        
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                            <p><strong>User:</strong> {selectedUser.name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Current Plan:</strong> {selectedUser.subscriptionPlan?.name || 'No Plan'}</p>
                            <p><strong>Current Expiry:</strong> {
                                selectedUser.subscriptionExpiry 
                                    ? new Date(selectedUser.subscriptionExpiry).toLocaleDateString('en-IN')
                                    : 'Not set'
                            }</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Extension Period (Days)
                            </label>
                            <input
                                type="number"
                                value={extensionDays}
                                onChange={(e) => setExtensionDays(e.target.value)}
                                min="1"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {[7, 30, 90, 180, 365].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setExtensionDays(days)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            background: extensionDays == days ? '#3b82f6' : '#fff',
                                            color: extensionDays == days ? '#fff' : '#374151',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {days} days
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setShowExtendModal(false);
                                    setSelectedUser(null);
                                    setExtensionDays(30);
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExtendSubscription}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: '#3b82f6',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}
                            >
                                Extend Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriberManagement;
