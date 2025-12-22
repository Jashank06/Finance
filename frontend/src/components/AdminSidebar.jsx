import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiUsers,
    FiCreditCard,
    FiDatabase,
    FiBarChart2,
    FiFileText,
    FiMail,
    FiMessageSquare,
    FiLogOut,
    FiShield
} from 'react-icons/fi';
import './Sidebar.css';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/subscribers', icon: FiUsers, label: 'Subscriber Management' },
        { path: '/admin/plans', icon: FiCreditCard, label: 'Subscription Plans' },
        { path: '/admin/space-retailing', icon: FiDatabase, label: 'Space Retailing' },
        { path: '/admin/analytics', icon: FiBarChart2, label: 'Features Usage Analytics' },
        { path: '/admin/blogs', icon: FiFileText, label: 'Blogs' },
        { path: '/admin/contact', icon: FiMail, label: 'Contact Developer' },
        { path: '/admin/feedback', icon: FiMessageSquare, label: 'Feedback' },
    ];

    return (
        <div className="sidebar" style={{ background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="sidebar-header" style={{ borderBottom: '2px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiShield size={24} color="#10b981" />
                    <h2 style={{ color: '#10b981' }}>Admin Panel</h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Finance App Management
                </p>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.path}
                            className="nav-item"
                            onClick={() => navigate(item.path)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '1rem',
                                color: '#e2e8f0',
                                transition: 'all 0.2s',
                                borderLeft: '3px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#334155';
                                e.currentTarget.style.borderLeftColor = '#10b981';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderLeftColor = 'transparent';
                            }}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    );
                })}

                <div
                    className="nav-item logout"
                    onClick={handleLogout}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        marginTop: '2rem',
                        color: '#ef4444',
                        transition: 'all 0.2s',
                        borderTop: '1px solid #334155'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#7f1d1d';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <FiLogOut size={20} />
                    <span>Logout</span>
                </div>
            </nav>
        </div>
    );
};

export default AdminSidebar;
