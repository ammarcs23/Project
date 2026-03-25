const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── Verify Token ──────────────────────────────
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authorized. Token missing.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;   // { id, name, email, role }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
    }
};

// ── Role Check ────────────────────────────────
// Usage: roleOnly('admin') or roleOnly('admin','doctor')
const roleOnly = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. Only ${roles.join('/')} can access this.`
        });
    }
    next();
};

module.exports = { protect, roleOnly };