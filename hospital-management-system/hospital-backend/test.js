require('dotenv').config();
const db = require('./config/db');

const getDoctorByUser = async (userId) => {
    const [rows] = await db.query(
        `SELECT d.*, u.name, u.email, u.is_active
         FROM doctors d JOIN users u ON d.user_id=u.id WHERE d.user_id=?`,
        [userId]
    );
    return rows[0] || null;
};

// Abdul Salam ka user_id dhundho
db.query(`SELECT u.id, u.name, u.role FROM users u 
          JOIN doctors d ON d.user_id=u.id 
          WHERE d.id=4`)
.then(async ([rows]) => {
    console.log('Doctor user:', rows[0]);
    const userId = rows[0].id;
    
    const doc = await getDoctorByUser(userId);
    console.log('Doctor found:', doc ? 'YES' : 'NO');
    console.log('Doctor id:', doc?.id);
    
    // Ab appointments query
    const [appts] = await db.query(
        `SELECT a.*, 
                COALESCE(u.name, 'Unknown') as patient_name, 
                p.age, p.gender,
                p.phone as patient_phone, 
                p.condition_ as condition,
                p.blood_type, 
                p.avatar as patient_avatar
         FROM appointments a
         LEFT JOIN patients p ON a.patient_id=p.id
         LEFT JOIN users u ON p.user_id=u.id
         WHERE a.doctor_id=?
         ORDER BY a.created_at DESC`,
        [doc.id]
    );
    console.log('APPOINTMENTS:', appts.length);
    process.exit();
})
.catch(e => {
    console.log('ERROR:', e.message);
    process.exit();
});