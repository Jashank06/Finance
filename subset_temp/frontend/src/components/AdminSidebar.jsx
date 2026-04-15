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
import './AdminSidebar.css';

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
        { path: '/admin/success-stories', icon: FiMessageSquare, label: 'Success Stories' },
        { path: '/admin/careers', icon: FiUsers, label: 'Career Openings' },
        { path: '/admin/contact-messages', icon: FiMail, label: 'Contact Messages' },
        { path: '/admin/contact', icon: FiMail, label: 'Contact Developer' },
    ];

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-header">
                <div className="admin-header-content">
                    <div className="admin-header-icon-wrapper">
                        <div className="admin-header-icon">
                            <FiShield size={24} color="#FFFFFF" />
                        </div>
                    </div>
                    <h2>Admin Panel</h2>
                    <p className="admin-sidebar-subtitle">Finance App Management</p>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.path}
                            className="admin-nav-item"
                            onClick={() => navigate(item.path)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    );
                })}

                <div
                    className="admin-nav-item logout"
                    onClick={handleLogout}
                >
                    <FiLogOut size={20} />
                    <span>Logout</span>
                </div>
            </nav>
        </div>
    );
};

export default AdminSidebar;
