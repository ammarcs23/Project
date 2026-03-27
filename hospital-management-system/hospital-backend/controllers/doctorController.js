// hospital-backend/controllers/doctorController.js
const db = require('../config/db');

// ── Helpers ──────────────────────────────────────────
const toMin  = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const toTime = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

const generateSlots = (start, end, breakStart, breakEnd, duration=30) => {
    const slots=[], endM=toMin(end), bsM=breakStart?toMin(breakStart):null, beM=breakEnd?toMin(breakEnd):null;
    let cur=toMin(start);
    while(cur+duration<=endM){
        const slotEnd=cur+duration;
        const overlaps = bsM!==null && beM!==null && cur<beM && slotEnd>bsM;
        if(!overlaps) slots.push(toTime(cur));
        cur+=duration;
    }
    return slots;
};

const getDoctorByUser = async (userId) => {
    const [rows] = await db.query(
        `SELECT d.*, u.name, u.email, u.is_active
         FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.user_id=?`, [userId]
    );
    return rows[0]||null;
};

// ── GET PROFILE ───────────────────────────────────────
const getProfile = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        res.json({success:true,doctor:doc});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

// ── UPDATE PROFILE ────────────────────────────────────
const updateProfile = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const {name,specialty,experience,fee,phone} = req.body;
        const avatar = req.file ? `/uploads/${req.file.filename}` : doc.avatar;
        await db.query(
            `UPDATE doctors SET specialty=?,experience=?,fee=?,phone=?,avatar=? WHERE id=?`,
            [specialty||doc.specialty, experience||doc.experience, fee||doc.fee, phone||doc.phone, avatar, doc.id]
        );
        if(name) await db.query(`UPDATE users SET name=? WHERE id=?`,[name,req.user.id]);
        res.json({success:true,message:'Profile updated!'});
    } catch(err){ console.error(err); res.status(500).json({success:false,message:'Server error.'}); }
};

// ── GET SCHEDULE ──────────────────────────────────────
const getSchedule = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const [schedule] = await db.query(
            `SELECT * FROM doctor_schedules WHERE doctor_id=?
             ORDER BY FIELD(day,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
            [doc.id]
        );
        res.json({success:true,schedule});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

// ── SAVE SCHEDULE ─────────────────────────────────────
const saveSchedule = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const {schedule} = req.body;
        if(!Array.isArray(schedule)||schedule.length===0)
            return res.status(400).json({success:false,message:'Schedule array required.'});
        for(const row of schedule){
            const {day,start_time,end_time,break_start,break_end,slot_duration,is_available} = row;
            await db.query(
                `INSERT INTO doctor_schedules (doctor_id,day,start_time,end_time,break_start,break_end,slot_duration,is_available)
                 VALUES (?,?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE
                   start_time=VALUES(start_time),end_time=VALUES(end_time),
                   break_start=VALUES(break_start),break_end=VALUES(break_end),
                   slot_duration=VALUES(slot_duration),is_available=VALUES(is_available)`,
                [doc.id,day,start_time,end_time,break_start||null,break_end||null,slot_duration||30,is_available!==undefined?is_available:true]
            );
        }
        res.json({success:true,message:'Schedule saved!'});
    } catch(err){ console.error(err); res.status(500).json({success:false,message:'Server error.'}); }
};

// ── GET AVAILABLE SLOTS (for patient booking) ─────────
const getAvailableSlots = async (req,res) => {
    try {
        const {doctor_id,date} = req.query;
        if(!doctor_id||!date) return res.status(400).json({success:false,message:'doctor_id and date required.'});

        const dayName = new Date(date+'T00:00:00').toLocaleDateString('en-US',{weekday:'long'});
        const [schRows] = await db.query(
            `SELECT * FROM doctor_schedules WHERE doctor_id=? AND day=? AND is_available=1`,
            [doctor_id, dayName]
        );
        if(schRows.length===0) return res.json({success:true,slots:[],message:'Doctor not available on this day.'});

        const sch=schRows[0];
        const [[doc]] = await db.query(`SELECT status FROM doctors WHERE id=?`,[doctor_id]);
        if(!doc||doc.status!=='Active') return res.json({success:true,slots:[],message:'Doctor is not accepting appointments.'});

        const allSlots = generateSlots(sch.start_time,sch.end_time,sch.break_start,sch.break_end,sch.slot_duration);
        const [booked] = await db.query(
            `SELECT time_slot FROM appointments WHERE doctor_id=? AND date=? AND status IN ('Pending','Confirmed')`,
            [doctor_id,date]
        );
        const bookedSet = new Set(booked.map(b=>b.time_slot));
        const slots = allSlots.map(t=>({time:t,available:!bookedSet.has(t)}));
        res.json({success:true,slots,schedule:sch});
    } catch(err){ console.error(err); res.status(500).json({success:false,message:'Server error.'}); }
};

// ── GET MY APPOINTMENTS ───────────────────────────────
const getAppointments = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const {status,date} = req.query;
        let sql=`SELECT a.*, u.name as patient_name, p.age, p.gender,
                        p.phone as patient_phone, p.condition_ as condition,
                        p.blood_type, p.avatar as patient_avatar
                 FROM appointments a
                 JOIN patients p ON a.patient_id=p.id
                 JOIN users u    ON p.user_id=u.id
                 WHERE a.doctor_id=?`;
        const params=[doc.id];
        if(status&&status!=='All'){sql+=` AND a.status=?`;params.push(status);}
        if(date)                  {sql+=` AND a.date=?`;  params.push(date);}
        sql+=` ORDER BY a.date DESC, a.time_slot ASC`;
        const [appointments] = await db.query(sql,params);
        res.json({success:true,appointments});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

// ── UPDATE APPOINTMENT STATUS ─────────────────────────
const updateAppointmentStatus = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const {id}=req.params, {status,notes,cancel_reason}=req.body;
        if(!['Confirmed','Completed','Cancelled'].includes(status))
            return res.status(400).json({success:false,message:'Invalid status.'});
        await db.query(
            `UPDATE appointments SET status=?,notes=?,cancel_reason=? WHERE id=? AND doctor_id=?`,
            [status,notes||null,cancel_reason||null,id,doc.id]
        );
        res.json({success:true,message:`Appointment ${status}!`});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

// ── TOGGLE STATUS (auto-cancel future appts) ──────────
const toggleStatus = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const {status} = req.body;
        await db.query(`UPDATE doctors SET status=? WHERE id=?`,[status,doc.id]);
        let cancelledCount=0;
        if(status==='Inactive'||status==='On Leave'){
            const [result] = await db.query(
                `UPDATE appointments
                 SET status='Cancelled',
                     cancel_reason='Doctor is currently unavailable. Please rebook when available.'
                 WHERE doctor_id=? AND status IN ('Pending','Confirmed') AND date>=CURDATE()`,
                [doc.id]
            );
            cancelledCount=result.affectedRows;
        }
        res.json({success:true,message:`Status set to ${status}.${cancelledCount>0?` ${cancelledCount} appointment(s) auto-cancelled.`:''}`,cancelledCount});
    } catch(err){ console.error(err); res.status(500).json({success:false,message:'Server error.'}); }
};

// ── GET MY PATIENTS ───────────────────────────────────
const getMyPatients = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const [patients] = await db.query(
            `SELECT DISTINCT p.*, u.name, u.email,
                    COUNT(a.id) as visit_count,
                    MAX(a.date) as last_visit,
                    MAX(a.ai_risk) as latest_risk
             FROM appointments a
             JOIN patients p ON a.patient_id=p.id
             JOIN users u    ON p.user_id=u.id
             WHERE a.doctor_id=? AND a.status IN ('Confirmed','Completed')
             GROUP BY p.id ORDER BY last_visit DESC`,
            [doc.id]
        );
        res.json({success:true,patients});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

// ── SAVE AI ANALYSIS ──────────────────────────────────
const saveAIAnalysis = async (req,res) => {
    try {
        const doc = await getDoctorByUser(req.user.id);
        if(!doc) return res.status(404).json({success:false,message:'Doctor not found.'});
        const {id}=req.params, {ai_analysis,ai_risk}=req.body;
        await db.query(
            `UPDATE appointments SET ai_analysis=?,ai_risk=? WHERE id=? AND doctor_id=?`,
            [ai_analysis,ai_risk||'Low',id,doc.id]
        );
        res.json({success:true,message:'AI analysis saved!'});
    } catch(err){ res.status(500).json({success:false,message:'Server error.'}); }
};

module.exports = {
    getProfile, updateProfile,
    getSchedule, saveSchedule,
    getAvailableSlots,
    getAppointments, updateAppointmentStatus,
    toggleStatus,
    getMyPatients,
    saveAIAnalysis
};