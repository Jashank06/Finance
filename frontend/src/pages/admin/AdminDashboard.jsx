import { FiUsers, FiCreditCard, FiTrendingUp, FiActivity } from 'react-icons/fi';
import './AdminPages.css';

import '../investments/Investment.css';

const AdminDashboard = () => {
    const stats = [
        { icon: FiUsers, label: 'Total Subscribers', value: '1,234', color: '#3b82f6' },
        { icon: FiCreditCard, label: 'Active Plans', value: '5', color: '#10b981' },
        { icon: FiTrendingUp, label: 'Monthly Revenue', value: '₹45,000', color: '#f59e0b' },
        { icon: FiActivity, label: 'Active Users Today', value: '892', color: '#8b5cf6' }
    ];

    return (
        <div className="investment-container">
            <div className="investment-header">
                <h1>Admin Dashboard</h1>
                <p>Manage your Finance App platform</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} style={{
                            background: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderLeft: `4px solid ${stat.color}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {stat.label}
                                    </p>
                                    <h2 style={{ fontSize: '2rem', color: '#1f2937', margin: 0 }}>
                                        {stat.value}
                                    </h2>
                                </div>
                                <div style={{
                                    background: `${stat.color}15`,
                                    padding: '0.75rem',
                                    borderRadius: '8px'
                                }}>
                                    <Icon size={24} color={stat.color} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h3>Quick Actions</h3>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                    Common administrative tasks
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Add New Subscriber', route: '/admin/subscribers' },
                        { label: 'Create Plan', route: '/admin/plans' },
                        { label: 'View Analytics', route: '/admin/analytics' },
                        { label: 'Manage Blogs', route: '/admin/blogs' },
                        { label: 'Review Feedback', route: '/admin/feedback' }
                    ].map((action, idx) => (
                        <button
                            key={idx}
                            style={{
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
