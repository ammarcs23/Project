// hospital-backend/controllers/patientController.js
const db = require('../config/Db');

// ══════════════════════════════════════════════
//  ADMIN — PATIENT CRUD
// ══════════════════════════════════════════════

const getPatients = async (req, res) => {
    try {
        const [patients] = await db.query(`
            SELECT p.*, u.name, u.email, u.is_active, u.created_at as registered_at
            FROM patients p JOIN users u ON p.user_id=u.id
            ORDER BY p.id DESC
        `);
        res.json({ success:true, patients });
    } catch(err){ console.error(err); res.status(500).json({success:false,message:'Server error.'}); }
};

const editPatient = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { id } = req.params;
        const { name, email, age, gender, blood_type, phone, address, condition_ } = req.body;
        const [[pt]] = await conn.query('SELECT user_id, avatar FROM patients WHERE id=?', [id]);
        if (!pt) return res.status(404).json({success:false,message:'Patient not found.'});
        const avatar = req.file ? `/uploads/${req.file.filename}` : pt.avatar;
        await conn.beginTransaction();
        await conn.query('UPDATE users SET name=?, email=? WHERE id=?', [name, email, pt.user_id]);
        await conn.query(
            `UPDATE patients SET age=?,gender=?,blood_type=?,phone=?,address=?,condition_=?,avatar=? WHERE id=?`,
            [age,gender,blood_type,phone,address,condition_,avatar,id]
        );
        await conn.commit();
        res.json({success:true,message:'Patient updated!'});
    } catch(err){
        await conn.rollback(); console.error(err);
        res.status(500).json({success:false,message:'Server error.'});
    } finally { conn.release(); }
};

const deletePatient = async (req, res) => {
    try {
        const [[patient]] = await db.query('SELECT user_id FROM patients WHERE id=?', [req.params.id]);
        if (!patient) return res.status(404).json({success:false,message:'Patient not found.'});
        await db.query('DELETE FROM users WHERE id=?', [patient.user_id]);
        res.json({success:true,message:'Patient deleted!'});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

const togglePatientStatus = async (req, res) => {
    try {
        await db.query(
            'UPDATE users SET is_active=? WHERE id=(SELECT user_id FROM patients WHERE id=?)',
            [req.body.is_active, req.params.id]
        );
        res.json({success:true,message:'Status updated!'});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

// ══════════════════════════════════════════════
//  PATIENT SELF
// ══════════════════════════════════════════════

const getMyProfile = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, u.name, u.email FROM patients p
             JOIN users u ON p.user_id=u.id WHERE p.user_id=?`, [req.user.id]
        );
        if (!rows[0]) return res.status(404).json({success:false,message:'Patient not found.'});
        res.json({success:true,patient:rows[0]});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

const updateMyProfile = async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { name, age, gender, blood_type, phone, address, condition_ } = req.body;
        const [[pt]] = await conn.query('SELECT id, avatar FROM patients WHERE user_id=?', [req.user.id]);
        if (!pt) return res.status(404).json({success:false,message:'Patient not found.'});
        const avatar = req.file ? `/uploads/${req.file.filename}` : pt.avatar;
        await conn.beginTransaction();
        if (name) await conn.query('UPDATE users SET name=? WHERE id=?', [name, req.user.id]);
        await conn.query(
            `UPDATE patients SET age=?,gender=?,blood_type=?,phone=?,address=?,condition_=?,avatar=? WHERE id=?`,
            [age||null,gender||null,blood_type||null,phone||null,address||null,condition_||null,avatar,pt.id]
        );
        await conn.commit();
        res.json({success:true,message:'Profile updated!'});
    } catch(err){
        await conn.rollback(); console.error(err);
        res.status(500).json({success:false,message:'Server error.'});
    } finally { conn.release(); }
};

const getMyAppointments = async (req, res) => {
    try {
        const [[pt]] = await db.query('SELECT id FROM patients WHERE user_id=?', [req.user.id]);
        if (!pt) return res.status(404).json({success:false,message:'Patient not found.'});
        const [appointments] = await db.query(
            `SELECT a.*, u.name as doctor_name, d.specialty,
                    d.avatar as doctor_avatar, d.fee, d.phone as doctor_phone, d.doctor_id
             FROM appointments a
             JOIN doctors d ON a.doctor_id=d.id
             JOIN users u   ON d.user_id=u.id
             WHERE a.patient_id=?
             ORDER BY a.date DESC, a.time_slot ASC`,
            [pt.id]
        );
        res.json({success:true,appointments});
    } catch(err){ console.error(err); res.status(500).json({success:false,message:'Server error.'}); }
};

const bookAppointment = async (req, res) => {
    try {
        const [[pt]] = await db.query('SELECT id FROM patients WHERE user_id=?', [req.user.id]);
        if (!pt) return res.status(404).json({success:false,message:'Patient profile not found.'});
        const {doctor_id, date, time_slot, visit_type, problem} = req.body;
        if (!doctor_id||!date||!time_slot||!problem)
            return res.status(400).json({success:false,message:'All fields required.'});
        const [taken] = await db.query(
            `SELECT id FROM appointments WHERE doctor_id=? AND date=? AND time_slot=? AND status IN ('Pending','Confirmed')`,
            [doctor_id,date,time_slot]
        );
        if (taken.length > 0)
            return res.status(400).json({success:false,message:'Slot already booked. Choose another.'});
        const [[doc]] = await db.query(`SELECT status FROM doctors WHERE id=?`,[doctor_id]);
        if (!doc||doc.status!=='Active')
            return res.status(400).json({success:false,message:'Doctor is not available.'});
        const [result] = await db.query(
            `INSERT INTO appointments (patient_id,doctor_id,date,time_slot,visit_type,problem,status)
             VALUES (?,?,?,?,?,?,'Pending')`,
            [pt.id,doctor_id,date,time_slot,visit_type||'in-person',problem]
        );
        res.status(201).json({success:true,message:'Appointment booked!',appointment_id:result.insertId});
    } catch(err){ console.error(err); res.status(500).json({success:false,message:'Server error.'}); }
};

const cancelAppointment = async (req, res) => {
    try {
        const [[pt]] = await db.query('SELECT id FROM patients WHERE user_id=?', [req.user.id]);
        const [result] = await db.query(
            `UPDATE appointments SET status='Cancelled', cancel_reason=?
             WHERE id=? AND patient_id=? AND status IN ('Pending','Confirmed')`,
            [req.body.reason||'Cancelled by patient.', req.params.id, pt.id]
        );
        if (result.affectedRows===0)
            return res.status(400).json({success:false,message:'Cannot cancel this appointment.'});
        res.json({success:true,message:'Appointment cancelled.'});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

const saveMyAnalysis = async (req, res) => {
    try {
        const [[pt]] = await db.query('SELECT id FROM patients WHERE user_id=?', [req.user.id]);
        const {ai_analysis, ai_risk} = req.body;
        await db.query(
            `UPDATE appointments SET ai_analysis=?, ai_risk=? WHERE id=? AND patient_id=?`,
            [ai_analysis, ai_risk||'Low', req.params.id, pt.id]
        );
        res.json({success:true,message:'Analysis saved!'});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

const getActiveDoctors = async (req, res) => {
    try {
        const [doctors] = await db.query(
            `SELECT d.id, d.doctor_id, d.specialty, d.experience, d.fee, d.avatar, d.status, u.name
             FROM doctors d JOIN users u ON d.user_id=u.id
             WHERE d.status='Active' ORDER BY d.specialty, u.name`
        );
        res.json({success:true,doctors});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

module.exports = {
    getPatients, editPatient, deletePatient, togglePatientStatus,
    getMyProfile, updateMyProfile,
    getMyAppointments, bookAppointment, cancelAppointment, saveMyAnalysis,
    getActiveDoctors,
};