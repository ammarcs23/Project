const db     = require('../config/db');
const bcrypt = require('bcryptjs');

// ── Auto Generate Doctor ID ───────────────────
const generateDoctorId = async () => {
    const [rows] = await db.query(
        'SELECT doctor_id FROM doctors ORDER BY id DESC LIMIT 1'
    );
    if (rows.length === 0) return 'D001';
    const last   = rows[0].doctor_id;          // e.g. D007
    const num    = parseInt(last.substring(1)) + 1;
    return 'D' + String(num).padStart(3, '0'); // D008
};

// ── GET All Doctors ───────────────────────────
// GET /api/admin/doctors
const getDoctors = async (req, res) => {
    try {
        const [doctors] = await db.query(`
            SELECT d.*, u.name, u.email, u.is_active
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            ORDER BY d.id DESC
        `);
        res.json({ success: true, doctors });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── ADD Doctor ────────────────────────────────
// POST /api/admin/doctors
const addDoctor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { name, email, password, specialty, experience, fee, phone, avatar, status } = req.body;

        if (!name || !email || !password || !specialty)
            return res.status(400).json({ success: false, message: 'Name, email, password and specialty are required.' });

        // Check email exists
        const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0)
            return res.status(400).json({ success: false, message: 'Email already registered.' });

        await conn.beginTransaction();

        // Hash password
        const hashedPass = await bcrypt.hash(password, 10);

        // Create user
        const [userResult] = await conn.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPass, 'doctor']
        );

        // Generate Doctor ID
        const doctorId = await generateDoctorId();

        // Create doctor profile
        await conn.query(
            `INSERT INTO doctors (user_id, doctor_id, specialty, experience, fee, phone, avatar, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userResult.insertId, doctorId, specialty, experience || null,
             fee || null, phone || null, avatar || null, status || 'Active']
        );

        await conn.commit();

        res.status(201).json({
            success:   true,
            message:   `Dr. ${name} added successfully!`,
            doctorId,
        });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    } finally {
        conn.release();
    }
};

// ── EDIT Doctor ───────────────────────────────
// PUT /api/admin/doctors/:id
const editDoctor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const { name, email, specialty, experience, fee, phone, avatar, status } = req.body;

        await conn.beginTransaction();

        // Update users table
        await conn.query(
            'UPDATE users SET name = ?, email = ? WHERE id = (SELECT user_id FROM doctors WHERE id = ?)',
            [name, email, id]
        );

        // Update doctors table
        await conn.query(
            `UPDATE doctors SET specialty=?, experience=?, fee=?, phone=?, avatar=?, status=?
             WHERE id=?`,
            [specialty, experience, fee, phone, avatar, status, id]
        );

        await conn.commit();
        res.json({ success: true, message: 'Doctor updated successfully!' });

    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    } finally {
        conn.release();
    }
};

// ── DELETE Doctor ─────────────────────────────
// DELETE /api/admin/doctors/:id
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        // Get user_id first
        const [doctor] = await db.query('SELECT user_id FROM doctors WHERE id = ?', [id]);
        if (doctor.length === 0)
            return res.status(404).json({ success: false, message: 'Doctor not found.' });

        // Delete user (cascade will delete doctor too)
        await db.query('DELETE FROM users WHERE id = ?', [doctor[0].user_id]);

        res.json({ success: true, message: 'Doctor deleted successfully!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── TOGGLE Doctor Status ──────────────────────
// PATCH /api/admin/doctors/:id/status
const toggleDoctorStatus = async (req, res) => {
    try {
        const { id }     = req.params;
        const { status } = req.body;

        await db.query('UPDATE doctors SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Status updated!' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getDoctors, addDoctor, editDoctor, deleteDoctor, toggleDoctorStatus };