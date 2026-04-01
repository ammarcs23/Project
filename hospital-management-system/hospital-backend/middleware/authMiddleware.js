const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── Verify Token ──────────────────────────────
const protect = (req, res, next) => {
    // Already authenticated in this request (prevent double-protect issues)
    if (req.user) return next();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized. Token missing.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // { id, name, email, role }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
        }
        return res.status(401).json({ success: false, message: 'Token invalid.' });
    }
};

// ── Role Check ────────────────────────────────
const roleOnly = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}.`
        });
    }
    next();
};

module.exports = { protect, roleOnly };