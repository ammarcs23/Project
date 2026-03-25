const express  = require('express');
const router   = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register  → Patient registration
router.post('/register', register);

// POST /api/auth/login     → All roles login
router.post('/login', login);

// GET  /api/auth/me        → Get logged in user (protected)
router.get('/me', protect, getMe);

module.exports = router;