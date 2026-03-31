// hospital-backend/controllers/doctorController.js
const db     = require('../config/db');
const bcrypt = require('bcryptjs');

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════

const toMin  = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const toTime = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

const generateSlots = (start, end, breakStart, breakEnd, duration=30) => {
    const slots=[], endM=toMin(end);
    const bsM = breakStart ? toMin(breakStart) : null;
    const beM = breakEnd   ? toMin(breakEnd)   : null;
    let cur = toMin(start);
    while(cur + duration <= endM) {
        const slotEnd = cur + duration;
        const overlaps = bsM !== null && beM !== null && cur < beM && slotEnd > bsM;
        if (!overlaps) slots.push(toTime(cur));
        cur += duration;
    }
    return slots;
};

const getDoctorByUser = async (userId) => {
    const [rows] = await db.query(
        `SELECT d.*, u.name, u.email, u.is_active
         FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.user_id=?`,
        [userId]
    );
    return rows[0] || null;
};

// Auto-generate next Doctor ID
const nextDoctorId = async () => {
    const [[last]] = await db.query(
        `SELECT doctor_id FROM doctors ORDER BY id DESC LIMIT 1`
    );
    if (!last) return 'D001';
    const num = parseInt(last.doctor_id.replace('D','')) + 1;
    return 'D' + String(num).padStart(3,'0');
};

// ══════════════════════════════════════════════════════
//  ADMIN — DOCTOR CRUD
// ══════════════════════════════════════════════════════

// GET /api/admin/doctors
const getDoctors = async (req, res) => {
    try {
        const [doctors] = await db.query(
            `SELECT d.*, u.name, u.email FROM doctors d
             JOIN users u ON d.user_id=u.id ORDER BY d.id DESC`
        );
        res.json({ success:true, doctors });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// POST /api/admin/doctors
const addDoctor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { name, email, password, specialty, experience, fee, phone, status } = req.body;
        if (!name || !email || !password || !specialty)
            return res.status(400).json({ success:false, message:'Name, email, password & specialty required.' });

        const [existing] = await db.query('SELECT id FROM users WHERE email=?', [email]);
        if (existing.length > 0)
            return res.status(400).json({ success:false, message:'Email already registered.' });

        const hash     = await bcrypt.hash(password, 10);
        const doctorId = await nextDoctorId();
        const avatar   = req.file ? `/uploads/${req.file.filename}` : null;

        await conn.beginTransaction();

        const [userResult] = await conn.query(
            'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
            [name, email, hash, 'doctor']
        );
        await conn.query(
            'INSERT INTO doctors (user_id, doctor_id, specialty, experience, fee, phone, avatar, status) VALUES (?,?,?,?,?,?,?,?)',
            [userResult.insertId, doctorId, specialty, experience||null, fee||null, phone||null, avatar, status||'Active']
        );

        await conn.commit();
        res.status(201).json({ success:true, message:`Dr. ${name} added!`, doctorId });
    } catch(err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    } finally {
        conn.release();
    }
};

// PUT /api/admin/doctors/:id
const editDoctor = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const { name, email, password, specialty, experience, fee, phone, status } = req.body;

        const [docRow] = await conn.query(
            'SELECT d.*, u.name as uname, u.email as uemail FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.id=?',
            [id]
        );
        if (!docRow[0]) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const avatar = req.file ? `/uploads/${req.file.filename}` : docRow[0].avatar;

        await conn.beginTransaction();

        if (name || email) {
            await conn.query(
                'UPDATE users SET name=?, email=? WHERE id=?',
                [name||docRow[0].uname, email||docRow[0].uemail, docRow[0].user_id]
            );
        }
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            await conn.query('UPDATE users SET password=? WHERE id=?', [hash, docRow[0].user_id]);
        }
        await conn.query(
            `UPDATE doctors SET specialty=?, experience=?, fee=?, phone=?, avatar=?, status=? WHERE id=?`,
            [specialty||docRow[0].specialty, experience||docRow[0].experience,
             fee||docRow[0].fee, phone||docRow[0].phone, avatar, status||docRow[0].status, id]
        );

        await conn.commit();
        res.json({ success:true, message:'Doctor updated!' });
    } catch(err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    } finally {
        conn.release();
    }
};

// DELETE /api/admin/doctors/:id
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const [[doc]] = await db.query('SELECT user_id FROM doctors WHERE id=?', [id]);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });
        await db.query('DELETE FROM users WHERE id=?', [doc.user_id]);
        res.json({ success:true, message:'Doctor deleted!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// PATCH /api/admin/doctors/:id/status
const toggleDoctorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE doctors SET status=? WHERE id=?', [status, id]);
        res.json({ success:true, message:'Status updated!' });
    } catch(err) {
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// ══════════════════════════════════════════════════════
//  DOCTOR SELF — PROFILE
// ══════════════════════════════════════════════════════

const getProfile = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });
        res.json({ success:true, doctor:doc });
    } catch(err) { res.status(500).json({ success:false, message:'Server error.' }); }
};

const updateProfile = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const { name, specialty, experience, fee, phone } = req.body;
        const avatar = req.file ? `/uploads/${req.file.filename}` : doc.avatar;

        await db.query(
            `UPDATE doctors SET specialty=?, experience=?, fee=?, phone=?, avatar=? WHERE id=?`,
            [specialty||doc.specialty, experience||doc.experience, fee||doc.fee, phone||doc.phone, avatar, doc.id]
        );
        if (name) await db.query(`UPDATE users SET name=? WHERE id=?`, [name, req.user.id]);
        res.json({ success:true, message:'Profile updated!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// ══════════════════════════════════════════════════════
//  DOCTOR SELF — SCHEDULE
// ══════════════════════════════════════════════════════

const getSchedule = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const [schedule] = await db.query(
            `SELECT * FROM doctor_schedules WHERE doctor_id=?
             ORDER BY FIELD(day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
            [doc.id]
        );
        res.json({ success:true, schedule });
    } catch(err) { res.status(500).json({ success:false, message:'Server error.' }); }
};

const saveSchedule = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const { schedule } = req.body;
        if (!Array.isArray(schedule) || !schedule.length)
            return res.status(400).json({ success:false, message:'Schedule array required.' });

        for (const row of schedule) {
            const { day, start_time, end_time, break_start, break_end, slot_duration, is_available } = row;
            await db.query(
                `INSERT INTO doctor_schedules
                    (doctor_id, day, start_time, end_time, break_start, break_end, slot_duration, is_available)
                 VALUES (?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                    start_time=VALUES(start_time), end_time=VALUES(end_time),
                    break_start=VALUES(break_start), break_end=VALUES(break_end),
                    slot_duration=VALUES(slot_duration), is_available=VALUES(is_available)`,
                [doc.id, day, start_time, end_time,
                 break_start||null, break_end||null,
                 slot_duration||30, is_available!==undefined ? is_available : true]
            );
        }
        res.json({ success:true, message:'Schedule saved!' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// ══════════════════════════════════════════════════════
//  AVAILABLE SLOTS — for patient booking (public, any role)
// ══════════════════════════════════════════════════════

const getAvailableSlots = async (req, res) => {
    try {
        const { doctor_id, date } = req.query;
        if (!doctor_id || !date)
            return res.status(400).json({ success:false, message:'doctor_id and date required.' });

        const dayName = new Date(date+'T00:00:00').toLocaleDateString('en-US',{weekday:'long'});

        const [schRows] = await db.query(
            `SELECT * FROM doctor_schedules WHERE doctor_id=? AND day=? AND is_available=1`,
            [doctor_id, dayName]
        );
        if (!schRows.length)
            return res.json({ success:true, slots:[], message:'Doctor not available on this day.' });

        const sch = schRows[0];

        const [[doc]] = await db.query(`SELECT status FROM doctors WHERE id=?`, [doctor_id]);
        if (!doc || doc.status !== 'Active')
            return res.json({ success:true, slots:[], message:'Doctor is not accepting appointments.' });

        const allSlots = generateSlots(sch.start_time, sch.end_time, sch.break_start, sch.break_end, sch.slot_duration);

        // Get booked slots - handles both old and new column names
        let booked = [];
        try {
            const [rows] = await db.query(
                `SELECT time_slot FROM appointments
                 WHERE doctor_id=? AND date=? AND status IN ('Pending','Confirmed')`,
                [doctor_id, date]
            );
            booked = rows;
        } catch(colErr) {
            // If columns don't exist yet (old DB schema), return all slots as available
            console.log('appointments columns not found, returning all slots as available');
        }
        const bookedSet = new Set(booked.map(b => b.time_slot));
        const slots = allSlots.map(t => ({ time:t, available:!bookedSet.has(t) }));

        res.json({ success:true, slots, schedule:sch });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// ══════════════════════════════════════════════════════
//  DOCTOR SELF — APPOINTMENTS
// ══════════════════════════════════════════════════════

const getAppointments = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const { status, date } = req.query;
        let sql = `SELECT a.*, u.name as patient_name, p.age, p.gender,
                          p.phone as patient_phone, p.condition_ as condition,
                          p.blood_type, p.avatar as patient_avatar
                   FROM appointments a
                   JOIN patients p ON a.patient_id=p.id
                   JOIN users u    ON p.user_id=u.id
                   WHERE a.doctor_id=?`;
        const params = [doc.id];
        if (status && status !== 'All') { sql += ` AND a.status=?`; params.push(status); }
        sql += ` ORDER BY a.created_at DESC`;

        const [appointments] = await db.query(sql, params);
        res.json({ success:true, appointments });
    } catch(err) { res.status(500).json({ success:false, message:'Server error.' }); }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const { id } = req.params;
        const { status, notes, cancel_reason } = req.body;

        if (!['Confirmed','Completed','Cancelled'].includes(status))
            return res.status(400).json({ success:false, message:'Invalid status.' });

        await db.query(
            `UPDATE appointments SET status=?, notes=?, cancel_reason=? WHERE id=? AND doctor_id=?`,
            [status, notes||null, cancel_reason||null, id, doc.id]
        );
        res.json({ success:true, message:`Appointment ${status}!` });
    } catch(err) { res.status(500).json({ success:false, message:'Server error.' }); }
};

// ══════════════════════════════════════════════════════
//  DOCTOR SELF — STATUS TOGGLE (auto-cancel)
// ══════════════════════════════════════════════════════

const toggleStatus = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const { status } = req.body;
        await db.query(`UPDATE doctors SET status=? WHERE id=?`, [status, doc.id]);

        let cancelledCount = 0;
        if (status === 'Inactive' || status === 'On Leave') {
            const [result] = await db.query(
                `UPDATE appointments
                 SET status='Cancelled',
                     cancel_reason='Doctor is currently unavailable. Please rebook when available.'
                 WHERE doctor_id=? AND status IN ('Pending','Confirmed') AND created_at >= NOW() - INTERVAL 1 YEAR`,
                [doc.id]
            );
            cancelledCount = result.affectedRows;
        }
        res.json({
            success: true,
            message: `Status set to ${status}.${cancelledCount > 0 ? ` ${cancelledCount} appointment(s) auto-cancelled.` : ''}`,
            cancelledCount
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// ══════════════════════════════════════════════════════
//  DOCTOR SELF — MY PATIENTS
// ══════════════════════════════════════════════════════

const getMyPatients = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const [patients] = await db.query(
            `SELECT p.id, p.age, p.gender, p.blood_type, p.phone, p.avatar,
                    p.condition_ as condition_,
                    u.name, u.email,
                    COUNT(a.id)          as visit_count,
                    MAX(a.created_at)    as last_visit,
                    MAX(a.ai_risk)       as latest_risk
             FROM appointments a
             JOIN patients p ON a.patient_id = p.id
             JOIN users u    ON p.user_id = u.id
             WHERE a.doctor_id=? AND a.status IN ('Pending','Confirmed','Completed')
             GROUP BY p.id, p.age, p.gender, p.blood_type, p.phone, p.avatar, p.condition_, u.name, u.email
             ORDER BY last_visit DESC`,
            [doc.id]
        );
        res.json({ success:true, patients });
    } catch(err) { res.status(500).json({ success:false, message:'Server error.' }); }
};

// ══════════════════════════════════════════════════════
//  DOCTOR SELF — AI ANALYSIS
// ══════════════════════════════════════════════════════

const saveAIAnalysis = async (req, res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if (!doc) return res.status(404).json({ success:false, message:'Doctor not found.' });

        const { id } = req.params;
        const { ai_analysis, ai_risk } = req.body;
        await db.query(
            `UPDATE appointments SET ai_analysis=?, ai_risk=? WHERE id=? AND doctor_id=?`,
            [ai_analysis, ai_risk||'Low', id, doc.id]
        );
        res.json({ success:true, message:'AI analysis saved!' });
    } catch(err) { res.status(500).json({ success:false, message:'Server error.' }); }
};

module.exports = {
    // Admin functions
    getDoctors, addDoctor, editDoctor, deleteDoctor, toggleDoctorStatus,
    // Doctor self functions
    getProfile, updateProfile,
    getSchedule, saveSchedule,
    getAvailableSlots,
    getAppointments, updateAppointmentStatus,
    toggleStatus,
    getMyPatients,
    saveAIAnalysis,
};