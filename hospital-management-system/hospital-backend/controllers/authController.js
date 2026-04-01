// hospital-backend/controllers/authController.js
const bcrypt           = require('bcryptjs');
const jwt              = require('jsonwebtoken');
const db               = require('../config/db');
const { sendOTPEmail } = require('../utils/mailer');
require('dotenv').config();

// In-memory OTP store: email -> { otp, name, password, expiresAt }
const otpStore = new Map();

const generateToken = (user) =>
    jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /api/auth/send-otp  — Step 1: validate + send code
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

        const otp       = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000;
        otpStore.set(email, { otp, name, password, expiresAt });

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

// POST /api/auth/verify-otp  — Step 2: verify code + create account
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ success: false, message: 'Email and verification code required.' });

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

// POST /api/auth/login  — All roles
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

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id,name,email,role,created_at FROM users WHERE id=?',
            [req.user.id]
        );
        if (!users.length) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, user: users[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { sendOTP, verifyOTP, login, getMe };