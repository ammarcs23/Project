const db = require('../config/db');

// ── GET All Patients ──────────────────────────
// GET /api/admin/patients
const getPatients = async (req, res) => {
    try {
        const [patients] = await db.query(`
            SELECT p.*, u.name, u.email, u.is_active, u.created_at as registered_at
            FROM patients p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.id DESC
        `);
        res.json({ success: true, patients });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── EDIT Patient ──────────────────────────────
// PUT /api/admin/patients/:id
const editPatient = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const { name, email, age, gender, blood_type, phone, address, condition_ } = req.body;

        await conn.beginTransaction();

        await conn.query(
            'UPDATE users SET name=?, email=? WHERE id=(SELECT user_id FROM patients WHERE id=?)',
            [name, email, id]
        );

        await conn.query(
            `UPDATE patients SET age=?, gender=?, blood_type=?, phone=?, address=?, condition_=?
             WHERE id=?`,
            [age, gender, blood_type, phone, address, condition_, id]
        );

        await conn.commit();
        res.json({ success: true, message: 'Patient updated!' });

    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'Server error.' });
    } finally {
        conn.release();
    }
};

// ── DELETE Patient ────────────────────────────
// DELETE /api/admin/patients/:id
const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const [patient] = await db.query('SELECT user_id FROM patients WHERE id = ?', [id]);
        if (patient.length === 0)
            return res.status(404).json({ success: false, message: 'Patient not found.' });

        await db.query('DELETE FROM users WHERE id = ?', [patient[0].user_id]);
        res.json({ success: true, message: 'Patient deleted!' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ── TOGGLE Patient Active Status ──────────────
// PATCH /api/admin/patients/:id/status
const togglePatientStatus = async (req, res) => {
    try {
        const { id }        = req.params;
        const { is_active } = req.body;

        await db.query(
            'UPDATE users SET is_active=? WHERE id=(SELECT user_id FROM patients WHERE id=?)',
            [is_active, id]
        );
        res.json({ success: true, message: 'Status updated!' });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = { getPatients, editPatient, deletePatient, togglePatientStatus };