// hospital-backend/controllers/chatController.js
const db = require('../config/db');

// GET /api/chat/:appointmentId — fetch all messages
const getMessages = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;
        const role   = req.user.role;

        // Verify this user belongs to this appointment
        let authCheck;
        if (role === 'doctor') {
            const [doc] = await db.query('SELECT id FROM doctors WHERE user_id=?', [userId]);
            if (!doc.length) return res.status(403).json({ success:false, message:'Doctor not found.' });
            const [appt] = await db.query('SELECT id FROM appointments WHERE id=? AND doctor_id=?', [appointmentId, doc[0].id]);
            if (!appt.length) return res.status(403).json({ success:false, message:'Not your appointment.' });
        } else if (role === 'patient') {
            const [pt] = await db.query('SELECT id FROM patients WHERE user_id=?', [userId]);
            if (!pt.length) return res.status(403).json({ success:false, message:'Patient not found.' });
            const [appt] = await db.query('SELECT id FROM appointments WHERE id=? AND patient_id=?', [appointmentId, pt[0].id]);
            if (!appt.length) return res.status(403).json({ success:false, message:'Not your appointment.' });
        }

        const [messages] = await db.query(
            'SELECT * FROM chat_messages WHERE appointment_id=? ORDER BY created_at ASC',
            [appointmentId]
        );
        res.json({ success:true, messages });
    } catch(err) {
        console.error('getMessages error:', err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

// POST /api/chat/:appointmentId — send a message
const sendMessage = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;
        const role   = req.user.role;

        if (!message?.trim())
            return res.status(400).json({ success:false, message:'Message cannot be empty.' });

        // Get sender name + verify ownership
        let senderName;
        if (role === 'doctor') {
            const [doc] = await db.query(
                'SELECT u.name, d.id as doc_id FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.user_id=?',
                [userId]
            );
            if (!doc.length) return res.status(403).json({ success:false, message:'Doctor not found.' });
            const [appt] = await db.query('SELECT id FROM appointments WHERE id=? AND doctor_id=?', [appointmentId, doc[0].doc_id]);
            if (!appt.length) return res.status(403).json({ success:false, message:'Not your appointment.' });
            senderName = doc[0].name;
        } else if (role === 'patient') {
            const [pt] = await db.query(
                'SELECT u.name, p.id as pt_id FROM patients p JOIN users u ON p.user_id=u.id WHERE p.user_id=?',
                [userId]
            );
            if (!pt.length) return res.status(403).json({ success:false, message:'Patient not found.' });
            const [appt] = await db.query('SELECT id FROM appointments WHERE id=? AND patient_id=?', [appointmentId, pt[0].pt_id]);
            if (!appt.length) return res.status(403).json({ success:false, message:'Not your appointment.' });
            senderName = pt[0].name;
        } else {
            return res.status(403).json({ success:false, message:'Only doctors and patients can chat.' });
        }

        const [result] = await db.query(
            'INSERT INTO chat_messages (appointment_id, sender_role, sender_name, message) VALUES (?,?,?,?)',
            [appointmentId, role, senderName, message.trim()]
        );

        res.status(201).json({
            success: true,
            message: {
                id:             result.insertId,
                appointment_id: parseInt(appointmentId),
                sender_role:    role,
                sender_name:    senderName,
                message:        message.trim(),
                created_at:     new Date().toISOString()
            }
        });
    } catch(err) {
        console.error('sendMessage error:', err);
        res.status(500).json({ success:false, message:'Server error.' });
    }
};

module.exports = { getMessages, sendMessage };