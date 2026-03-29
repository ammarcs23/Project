// hospital-backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
require('dotenv').config();

const generateToken = (user) =>
    jwt.sign(
        { id:user.id, name:user.name, email:user.email, role:user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

// POST /api/auth/register  — Patient only
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name||!email||!password)
            return res.status(400).json({success:false, message:'All fields are required.'});

        const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length)
            return res.status(400).json({success:false, message:'Email already registered.'});

        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
            [name, email, hash, 'patient']
        );
        await db.query('INSERT INTO patients (user_id) VALUES (?)', [result.insertId]);

        const newUser = { id:result.insertId, name, email, role:'patient' };
        res.status(201).json({ success:true, message:'Account created!', token:generateToken(newUser), user:newUser });
    } catch(err) {
        console.error('Register error:', err);
        res.status(500).json({success:false, message:'Server error.'});
    }
};

// POST /api/auth/login  — All roles
const login = async (req, res) => {
    try {
        const { email, password, role, doctorId } = req.body;
        if (!email||!password||!role)
            return res.status(400).json({success:false, message:'Email, password and role required.'});

        const [users] = await db.query(
            'SELECT * FROM users WHERE email=? AND role=? AND is_active=TRUE',
            [email, role]
        );
        if (!users.length)
            return res.status(401).json({success:false, message:'Invalid email or password.'});

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({success:false, message:'Invalid email or password.'});

        // Doctor must provide Doctor ID
        if (role==='doctor') {
            if (!doctorId)
                return res.status(400).json({success:false, message:'Doctor ID is required.'});
            const [docs] = await db.query(
                'SELECT id FROM doctors WHERE user_id=? AND doctor_id=?',
                [user.id, doctorId]
            );
            if (!docs.length)
                return res.status(401).json({success:false, message:'Invalid Doctor ID. Contact admin.'});
        }

        const tokenUser = { id:user.id, name:user.name, email:user.email, role:user.role };
        res.json({
            success:true,
            message:`Welcome back, ${user.name}!`,
            token: generateToken(tokenUser),
            user:  tokenUser
        });
    } catch(err) {
        console.error('Login error:', err);
        res.status(500).json({success:false, message:'Server error.'});
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id,name,email,role,created_at FROM users WHERE id=?',
            [req.user.id]
        );
        if (!users.length) return res.status(404).json({success:false, message:'User not found.'});
        res.json({success:true, user:users[0]});
    } catch(err) {
        res.status(500).json({success:false, message:'Server error.'});
    }
};

module.exports = { register, login, getMe };