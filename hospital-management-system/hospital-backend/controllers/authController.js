// hospital-backend/controllers/authController.js
const bcrypt                       = require('bcryptjs');
const jwt                          = require('jsonwebtoken');
const db                           = require('../config/db');
const { sendOTPEmail, sendResetEmail } = require('../utils/mailer');
require('dotenv').config();

// ── In-memory stores ─────────────────────────────────
const otpStore   = new Map(); // registration:  email → { otp, name, password, expiresAt }
const resetStore = new Map(); // reset:         email → { otp, role, expiresAt }

const generateToken = (user) =>
    jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// ─────────────────────────────────────────────────────
//  REGISTRATION — Step 1: send OTP
//  POST /api/auth/send-otp
// ─────────────────────────────────────────────────────
const sendOTP = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ success: false, message: 'Invalid email address.' });

        const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length)
            return res.status(400).json({ success: false, message: 'This email is already registered. Please login.' });

        const otp = generateOTP();
        otpStore.set(email, { otp, name, password, expiresAt: Date.now() + 10 * 60 * 1000 });

        try {
            await sendOTPEmail(email, name, otp);
        } catch (mailErr) {
            console.error('Mail error:', mailErr.message);
            return res.status(500).json({ success: false, message: 'Failed to send email. Check EMAIL_USER and EMAIL_PASS in .env' });
        }

        res.json({ success: true, message: 'Verification code sent! Check your inbox (and spam folder).' });
    } catch (err) {
        console.error('sendOTP error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────
//  REGISTRATION — Step 2: verify OTP → create account
//  POST /api/auth/verify-otp
// ─────────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ success: false, message: 'Email and code required.' });

        const record = otpStore.get(email);
        if (!record)
            return res.status(400).json({ success: false, message: 'No verification pending. Please register again.' });

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'Code expired. Please register again.' });
        }

        if (record.otp !== String(otp).trim())
            return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' });

        otpStore.delete(email);

        const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length)
            return res.status(400).json({ success: false, message: 'Email already registered.' });

        const hash     = await bcrypt.hash(record.password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
            [record.name, email, hash, 'patient']
        );
        await db.query('INSERT INTO patients (user_id) VALUES (?)', [result.insertId]);

        const newUser = { id: result.insertId, name: record.name, email, role: 'patient' };
        res.status(201).json({
            success: true,
            message: `Welcome to MediCare+, ${record.name}! Account created successfully.`,
            token:   generateToken(newUser),
            user:    newUser,
        });
    } catch (err) {
        console.error('verifyOTP error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────
//  FORGOT PASSWORD — Step 1: send reset OTP
//  POST /api/auth/forgot-password
//  Body: { email, role }   role = patient | doctor | admin
// ─────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role)
            return res.status(400).json({ success: false, message: 'Email and role are required.' });

        const [users] = await db.query(
            'SELECT id, name FROM users WHERE email=? AND role=? AND is_active=TRUE',
            [email, role]
        );
        // Always return success to prevent email enumeration
        if (!users.length)
            return res.json({ success: true, message: 'If that email exists, a reset code has been sent.' });

        const user = users[0];
        const otp  = generateOTP();
        resetStore.set(`${email}_${role}`, { otp, role, expiresAt: Date.now() + 10 * 60 * 1000 });

        try {
            await sendResetEmail(email, user.name, otp, role);
        } catch (mailErr) {
            console.error('Reset mail error:', mailErr.message);
            return res.status(500).json({ success: false, message: 'Failed to send email. Check .env EMAIL config.' });
        }

        res.json({ success: true, message: 'Password reset code sent! Check your inbox.' });
    } catch (err) {
        console.error('forgotPassword error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────
//  FORGOT PASSWORD — Step 2: verify OTP
//  POST /api/auth/verify-reset-otp
//  Body: { email, role, otp }
// ─────────────────────────────────────────────────────
const verifyResetOTP = async (req, res) => {
    try {
        const { email, role, otp } = req.body;
        if (!email || !role || !otp)
            return res.status(400).json({ success: false, message: 'Email, role and code required.' });

        const key    = `${email}_${role}`;
        const record = resetStore.get(key);
        if (!record)
            return res.status(400).json({ success: false, message: 'No reset request found. Please start again.' });

        if (Date.now() > record.expiresAt) {
            resetStore.delete(key);
            return res.status(400).json({ success: false, message: 'Code expired. Please request a new one.' });
        }

        if (record.otp !== String(otp).trim())
            return res.status(400).json({ success: false, message: 'Incorrect code. Please try again.' });

        // Don't delete yet — needed for reset-password step
        res.json({ success: true, message: 'Code verified! Now set your new password.' });
    } catch (err) {
        console.error('verifyResetOTP error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────
//  FORGOT PASSWORD — Step 3: set new password
//  POST /api/auth/reset-password
//  Body: { email, role, otp, newPassword }
// ─────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { email, role, otp, newPassword } = req.body;
        if (!email || !role || !otp || !newPassword)
            return res.status(400).json({ success: false, message: 'All fields required.' });

        if (newPassword.length < 6)
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

        const key    = `${email}_${role}`;
        const record = resetStore.get(key);
        if (!record)
            return res.status(400).json({ success: false, message: 'Session expired. Please start again.' });

        if (Date.now() > record.expiresAt) {
            resetStore.delete(key);
            return res.status(400).json({ success: false, message: 'Code expired. Please request a new one.' });
        }

        if (record.otp !== String(otp).trim())
            return res.status(400).json({ success: false, message: 'Invalid session. Please start again.' });

        resetStore.delete(key); // consume

        const hash = await bcrypt.hash(newPassword, 10);
        const [result] = await db.query(
            'UPDATE users SET password=? WHERE email=? AND role=?',
            [hash, email, role]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'User not found.' });

        res.json({ success: true, message: 'Password reset successfully! Please login with your new password.' });
    } catch (err) {
        console.error('resetPassword error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────
//  LOGIN — All roles
//  POST /api/auth/login
// ─────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password, role, doctorId } = req.body;
        if (!email || !password || !role)
            return res.status(400).json({ success: false, message: 'Email, password and role required.' });

        const [users] = await db.query(
            'SELECT * FROM users WHERE email=? AND role=? AND is_active=TRUE',
            [email, role]
        );
        if (!users.length)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const user    = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        if (role === 'doctor') {
            if (!doctorId)
                return res.status(400).json({ success: false, message: 'Doctor ID is required.' });
            const [docs] = await db.query(
                'SELECT id FROM doctors WHERE user_id=? AND doctor_id=?',
                [user.id, doctorId]
            );
            if (!docs.length)
                return res.status(401).json({ success: false, message: 'Invalid Doctor ID. Contact admin.' });
        }

        const tokenUser = { id: user.id, name: user.name, email: user.email, role: user.role };
        res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token:   generateToken(tokenUser),
            user:    tokenUser,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ─────────────────────────────────────────────────────
//  GET /api/auth/me
// ─────────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id,name,email,role,created_at FROM users WHERE id=?',
            [req.user.id]
        );
        if (!users.length)
            return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, user: users[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { sendOTP, verifyOTP, forgotPassword, verifyResetOTP, resetPassword, login, getMe };