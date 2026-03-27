const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ── DASHBOARD STATS ───────────────────────────
// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const [[{ totalDoctors }]]      = await db.query('SELECT COUNT(*) as totalDoctors FROM doctors');
        const [[{ totalPatients }]]     = await db.query('SELECT COUNT(*) as totalPatients FROM patients');
        const [[{ totalAppointments }]] = await db.query('SELECT COUNT(*) as totalAppointments FROM appointments');
        const [[{ todayAppointments }]] = await db.query(
            "SELECT COUNT(*) as todayAppointments FROM appointments WHERE DATE(created_at) = CURDATE()"
        );
        const [[{ activeDoctors }]]     = await db.query("SELECT COUNT(*) as activeDoctors FROM doctors WHERE status='Active'");
        const [[{ pendingAppointments }]] = await db.query(
            "SELECT COUNT(*) as pendingAppointments FROM appointments WHERE status='Pending'"
        );

        // Monthly patient registrations (last 12 months)
        const [monthly] = await db.query(`
            SELECT MONTH(created_at) as month, COUNT(*) as count
            FROM patients
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY MONTH(created_at)
            ORDER BY month
        `);

        // Specialty distribution
        const [specialties] = await db.query(`
            SELECT specialty, COUNT(*) as count
            FROM doctors
            GROUP BY specialty
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            stats: {
                totalDoctors,
                totalPatients,
                totalAppointments,
                todayAppointments,
                activeDoctors,
                pendingAppointments,
            },
            monthly,
            specialties,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── HOMEPAGE CONTENT ──────────────────────────
// GET /api/admin/homepage
const getHomepage = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT content FROM homepage_content WHERE id = 1');
        if (rows.length === 0)
            return res.json({ success: true, content: null });

        res.json({ success: true, content: JSON.parse(rows[0].content) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/admin/homepage
const updateHomepage = async (req, res) => {
    try {
        const content = JSON.stringify(req.body);

        // Upsert — agar row nahi hai toh insert, hai toh update
        await db.query(`
            INSERT INTO homepage_content (id, content) VALUES (1, ?)
            ON DUPLICATE KEY UPDATE content = ?
        `, [content, content]);

        res.json({ success: true, message: 'Homepage updated!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── ADMIN MANAGEMENT ──────────────────────────
// GET /api/admin/admins
const getAdmins = async (req, res) => {
    try {
        const [admins] = await db.query(
            "SELECT id, name, email, created_at FROM users WHERE role='admin' ORDER BY id"
        );
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/admin/admins
const addAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'All fields required.' });

        const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length > 0)
            return res.status(400).json({ success: false, message: 'Email already exists.' });

        const hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hash, 'admin']
        );

        res.status(201).json({ success: true, message: `Admin ${name} added!` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// DELETE /api/admin/admins/:id
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Pehle check karo sirf ek admin na reh jaye
        const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM users WHERE role='admin'");
        if (count <= 1)
            return res.status(400).json({ success: false, message: 'Cannot delete the only admin!' });

        await db.query("DELETE FROM users WHERE id=? AND role='admin'", [id]);
        res.json({ success: true, message: 'Admin deleted!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getStats, getHomepage, updateHomepage, getAdmins, addAdmin, deleteAdmin };