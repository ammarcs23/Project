const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('../config/Db');
require('dotenv').config();

// ── Generate JWT ──────────────────────────────
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// ── REGISTER (Patient only) ───────────────────
// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'All fields are required.' });

        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0)
            return res.status(400).json({ success: false, message: 'Email already registered.' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'patient']
        );

        // Create patient profile automatically
        await db.query(
            'INSERT INTO patients (user_id) VALUES (?)',
            [result.insertId]
        );

        const newUser = { id: result.insertId, name, email, role: 'patient' };
        const token   = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            token,
            user: newUser
        });

    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error. Try again.' });
    }
};

// ── LOGIN (All roles) ─────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password, role, doctorId } = req.body;

        if (!email || !password || !role)
            return res.status(400).json({ success: false, message: 'Email, password and role are required.' });

        // Find user by email + role
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ? AND role = ? AND is_active = TRUE',
            [email, role]
        );

        if (users.length === 0)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        // Extra check for doctor: verify Doctor ID
        if (role === 'doctor') {
            if (!doctorId)
                return res.status(400).json({ success: false, message: 'Doctor ID is required.' });

            const [doctors] = await db.query(
                'SELECT * FROM doctors WHERE user_id = ? AND doctor_id = ?',
                [user.id, doctorId]
            );

            if (doctors.length === 0)
                return res.status(401).json({ success: false, message: 'Invalid Doctor ID. Contact admin.' });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: `Welcome back, ${user.name}!`,
            token,
            user: {
                id:    user.id,
                name:  user.name,
                email: user.email,
                role:  user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error. Try again.' });
    }
};

// ── GET CURRENT USER ─────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0)
            return res.status(404).json({ success: false, message: 'User not found.' });

        res.json({ success: true, user: users[0] });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { register, login, getMe };