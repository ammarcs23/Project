const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const fs     = require('fs');
const path   = require('path');

// ── Auto Generate Doctor ID ───────────────────
const generateDoctorId = async () => {
    const [rows] = await db.query('SELECT doctor_id FROM doctors ORDER BY id DESC LIMIT 1');
    if (rows.length === 0) return 'D001';
    const last = rows[0].doctor_id;
    const num  = parseInt(last.substring(1)) + 1;
    return 'D' + String(num).padStart(3, '0');
};

// ── GET All Doctors ───────────────────────────
const getDoctors = async (req, res) => {
    try {
        const [doctors] = await db.query(`
            SELECT d.*, u.name, u.email, u.is_active
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.id DESC
        `);
        // Add full avatar URL
        doctors.forEach(d => {
            if (d.avatar && !d.avatar.startsWith('http')) {
                d.avatar = `http://localhost:5000/uploads/${d.avatar}`;
            }
        });
        res.json({ success: true, doctors });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── ADD Doctor ────────────────────────────────
const addDoctor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { name, email, password, specialty, experience, fee, phone, status } = req.body;
        const avatarFile = req.file ? req.file.filename : null;

        if (!name || !email || !password || !specialty)
            return res.status(400).json({ success: false, message: 'Name, email, password and specialty required.' });

        const [existing] = await conn.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length > 0)
            return res.status(400).json({ success: false, message: 'Email already registered.' });

        await conn.beginTransaction();

        const hashedPass = await bcrypt.hash(password, 10);

        const [userResult] = await conn.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPass, 'doctor']
        );

        const doctorId = await generateDoctorId();

        await conn.query(
            `INSERT INTO doctors (user_id, doctor_id, specialty, experience, fee, phone, avatar, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userResult.insertId, doctorId, specialty,
             experience || null, fee || null, phone || null,
             avatarFile, status || 'Active']
        );

        await conn.commit();

        res.status(201).json({
            success:  true,
            message:  `Dr. ${name} added! Doctor ID: ${doctorId}`,
            doctorId,
        });

    } catch (err) {
        await conn.rollback();
        if (req.file) fs.unlinkSync(req.file.path); // uploaded file hata do agar error aya
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    } finally {
        conn.release();
    }
};

// ── EDIT Doctor ───────────────────────────────
const editDoctor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const { name, email, specialty, experience, fee, phone, status } = req.body;
        const avatarFile = req.file ? req.file.filename : null;

        await conn.beginTransaction();

        // Get old avatar to delete
        if (avatarFile) {
            const [old] = await conn.query('SELECT avatar FROM doctors WHERE id=?', [id]);
            if (old[0]?.avatar) {
                const oldPath = path.join(__dirname, '../uploads', old[0].avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
        }

        await conn.query(
            'UPDATE users SET name=?, email=? WHERE id=(SELECT user_id FROM doctors WHERE id=?)',
            [name, email, id]
        );

        const avatarUpdate = avatarFile
            ? ', avatar=?'
            : '';
        const params = avatarFile
            ? [specialty, experience, fee, phone, status, avatarFile, id]
            : [specialty, experience, fee, phone, status, id];

        await conn.query(
            `UPDATE doctors SET specialty=?, experience=?, fee=?, phone=?, status=?${avatarUpdate} WHERE id=?`,
            params
        );

        await conn.commit();
        res.json({ success: true, message: 'Doctor updated!' });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    } finally {
        conn.release();
    }
};

// ── DELETE Doctor ─────────────────────────────
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const [doctor] = await db.query('SELECT user_id, avatar FROM doctors WHERE id=?', [id]);
        if (doctor.length === 0)
            return res.status(404).json({ success: false, message: 'Doctor not found.' });

        // Avatar file bhi delete karo
        if (doctor[0].avatar) {
            const filePath = path.join(__dirname, '../uploads', doctor[0].avatar);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM users WHERE id=?', [doctor[0].user_id]);
        res.json({ success: true, message: 'Doctor deleted!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── TOGGLE Status ─────────────────────────────
const toggleDoctorStatus = async (req, res) => {
    try {
        await db.query('UPDATE doctors SET status=? WHERE id=?', [req.body.status, req.params.id]);
        res.json({ success: true, message: 'Status updated!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getDoctors, addDoctor, editDoctor, deleteDoctor, toggleDoctorStatus };