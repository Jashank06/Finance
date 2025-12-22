import AdminSidebar from './AdminSidebar';
import './Layout.css';

const AdminLayout = ({ children }) => {
    return (
        <div className="layout">
            <AdminSidebar />
            <main className="main-content" style={{ background: '#f8fafc' }}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
