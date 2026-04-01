// hospital-backend/routes/auth.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendOTP, verifyOTP, login, getMe } = require('../controllers/authController');

router.post('/send-otp',    sendOTP);
router.post('/verify-otp',  verifyOTP);
router.post('/login',       login);
router.get ('/me',          protect, getMe);

module.exports = router;