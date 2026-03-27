const db     = require('../config/db');
const bcrypt = require('bcryptjs');

// ── DASHBOARD STATS ───────────────────────────
const getStats = async (req, res) => {
    try {
        const [[{ totalDoctors }]]        = await db.query('SELECT COUNT(*) as totalDoctors FROM doctors');
        const [[{ totalPatients }]]       = await db.query('SELECT COUNT(*) as totalPatients FROM patients');
        const [[{ totalAppointments }]]   = await db.query('SELECT COUNT(*) as totalAppointments FROM appointments');
        const [[{ activeDoctors }]]       = await db.query("SELECT COUNT(*) as activeDoctors FROM doctors WHERE status='Active'");
        const [[{ pendingAppointments }]] = await db.query("SELECT COUNT(*) as pendingAppointments FROM appointments WHERE status='Pending'");
        const [[{ todayAppointments }]]   = await db.query("SELECT COUNT(*) as todayAppointments FROM appointments WHERE DATE(created_at)=CURDATE()");

        res.json({
            success: true,
            stats: { totalDoctors, totalPatients, totalAppointments, activeDoctors, pendingAppointments, todayAppointments }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── HOMEPAGE ──────────────────────────────────
const getHomepage = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT content FROM homepage_content WHERE id=1');
        if (rows.length === 0) return res.json({ success: true, content: null });
        res.json({ success: true, content: JSON.parse(rows[0].content) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const updateHomepage = async (req, res) => {
    try {
        const content = JSON.stringify(req.body);
        await db.query(
            'INSERT INTO homepage_content (id, content) VALUES (1,?) ON DUPLICATE KEY UPDATE content=?',
            [content, content]
        );
        res.json({ success: true, message: 'Homepage updated!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── GET ALL ADMINS ────────────────────────────
const getAdmins = async (req, res) => {
    try {
        const [admins] = await db.query(
            "SELECT id, name, email, created_at FROM users WHERE role='admin' ORDER BY id ASC"
        );
        // First admin = Super Admin (lowest id)
        const result = admins.map((a, i) => ({ ...a, isSuperAdmin: i === 0 }));
        res.json({ success: true, admins: result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── ADD ADMIN (Super Admin only) ──────────────
const addAdmin = async (req, res) => {
    try {
        // Check if requester is super admin (first/lowest id admin)
        const [firstAdmin] = await db.query(
            "SELECT id FROM users WHERE role='admin' ORDER BY id ASC LIMIT 1"
        );
        if (firstAdmin[0].id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only Super Admin can add new admins.' });
        }

        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'All fields required.' });

        const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length > 0)
            return res.status(400).json({ success: false, message: 'Email already exists.' });

        const hash = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
            [name, email, hash, 'admin']
        );

        res.status(201).json({ success: true, message: `Admin ${name} added successfully!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── DELETE ADMIN (Super Admin only) ───────────
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // Super admin check
        const [firstAdmin] = await db.query(
            "SELECT id FROM users WHERE role='admin' ORDER BY id ASC LIMIT 1"
        );
        if (firstAdmin[0].id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only Super Admin can delete admins.' });
        }

        // Cannot delete super admin (himself)
        if (parseInt(id) === firstAdmin[0].id) {
            return res.status(400).json({ success: false, message: 'Super Admin cannot be deleted!' });
        }

        // Must have at least 1 admin
        const [[{ count }]] = await db.query("SELECT COUNT(*) as count FROM users WHERE role='admin'");
        if (count <= 1) {
            return res.status(400).json({ success: false, message: 'Cannot delete the only admin!' });
        }

        await db.query("DELETE FROM users WHERE id=? AND role='admin'", [id]);
        res.json({ success: true, message: 'Admin deleted!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getStats, getHomepage, updateHomepage, getAdmins, addAdmin, deleteAdmin };