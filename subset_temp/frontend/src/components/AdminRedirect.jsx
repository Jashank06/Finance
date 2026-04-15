import { Navigate } from 'react-router-dom';

const AdminRedirect = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/dashboard" replace />;
};

export default AdminRedirect;
