// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem('hospital_token');
    const user  = JSON.parse(localStorage.getItem('hospital_user') || 'null');

    // Token nahi hai → login page par bhejo
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role match nahi karta → login page par bhejo
    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;