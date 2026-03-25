// src/services/authService.js
// Yeh file React frontend mein rakho: src/services/authService.js

const API = 'http://localhost:5000/api';

// ── Login ─────────────────────────────────────
export const loginUser = async ({ email, password, role, doctorId }) => {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: role.toLowerCase(), doctorId })
    });
    return res.json();
};

// ── Register (Patient) ───────────────────────
export const registerUser = async ({ name, email, password }) => {
    const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    return res.json();
};

// ── Save token to localStorage ───────────────
export const saveAuth = (token, user) => {
    localStorage.setItem('hospital_token', token);
    localStorage.setItem('hospital_user', JSON.stringify(user));
};

// ── Get saved user ───────────────────────────
export const getUser = () => {
    const user = localStorage.getItem('hospital_user');
    return user ? JSON.parse(user) : null;
};

// ── Get token ────────────────────────────────
export const getToken = () => localStorage.getItem('hospital_token');

// ── Logout ──────────────────────────────────
export const logout = () => {
    localStorage.removeItem('hospital_token');
    localStorage.removeItem('hospital_user');
};