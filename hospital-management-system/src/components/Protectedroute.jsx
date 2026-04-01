// src/components/Protectedroute.jsx
import { Navigate } from 'react-router-dom';

// ── Role-specific storage keys ─────────────────────────────
// Each role stores its own token so multiple roles can be
// logged in simultaneously in different tabs.
export const tokenKey = (role) => `hospital_token_${role}`;
export const userKey  = (role) => `hospital_user_${role}`;

// Decode JWT expiry without verification
const getTokenExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null;
    } catch { return null; }
};

const ProtectedRoute = ({ children, allowedRole }) => {
    const token   = localStorage.getItem(tokenKey(allowedRole));
    const userStr = localStorage.getItem(userKey(allowedRole));

    // No token → login
    if (!token || !userStr) return <Navigate to="/login" replace />;

    // Expired → clean up + login
    const expiry = getTokenExpiry(token);
    if (expiry && Date.now() > expiry) {
        localStorage.removeItem(tokenKey(allowedRole));
        localStorage.removeItem(userKey(allowedRole));
        return <Navigate to="/login" replace />;
    }

    // Parse user
    let user;
    try { user = JSON.parse(userStr); }
    catch {
        localStorage.removeItem(tokenKey(allowedRole));
        localStorage.removeItem(userKey(allowedRole));
        return <Navigate to="/login" replace />;
    }

    // Role mismatch (shouldn't happen with role-specific keys, safety net)
    if (user.role !== allowedRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;