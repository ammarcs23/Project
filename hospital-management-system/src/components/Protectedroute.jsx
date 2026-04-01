// src/components/Protectedroute.jsx
import { Navigate } from 'react-router-dom';

// Decode JWT payload without verification (just to read expiry)
const getTokenExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // convert to ms
    } catch {
        return null;
    }
};

const ProtectedRoute = ({ children, allowedRole }) => {
    const token   = localStorage.getItem('hospital_token');
    const userStr = localStorage.getItem('hospital_user');

    // 1. No token or user → login
    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }

    // 2. Token expired client-side check (avoid wasted API calls)
    const expiry = getTokenExpiry(token);
    if (expiry && Date.now() > expiry) {
        localStorage.removeItem('hospital_token');
        localStorage.removeItem('hospital_user');
        return <Navigate to="/login" replace />;
    }

    // 3. Parse user
    let user;
    try {
        user = JSON.parse(userStr);
    } catch {
        localStorage.removeItem('hospital_token');
        localStorage.removeItem('hospital_user');
        return <Navigate to="/login" replace />;
    }

    // 4. Wrong role → redirect to correct dashboard
    if (allowedRole && user.role !== allowedRole) {
        if (user.role === 'admin')   return <Navigate to="/admin"   replace />;
        if (user.role === 'doctor')  return <Navigate to="/doctor"  replace />;
        if (user.role === 'patient') return <Navigate to="/patient" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;