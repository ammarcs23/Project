// hospital-backend/routes/auth.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    sendOTP, verifyOTP,
    forgotPassword, verifyResetOTP, resetPassword,
    login, getMe
} = require('../controllers/authController');

// Registration
router.post('/send-otp',          sendOTP);
router.post('/verify-otp',        verifyOTP);

// Forgot password
router.post('/forgot-password',   forgotPassword);
router.post('/verify-reset-otp',  verifyResetOTP);
router.post('/reset-password',    resetPassword);

// Login + me
router.post('/login',             login);
router.get ('/me',                protect, getMe);

module.exports = router;