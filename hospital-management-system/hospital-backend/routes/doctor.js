// hospital-backend/routes/doctor.js
const express = require('express');
const router  = express.Router();
const { protect, roleOnly } = require('../middleware/authMiddleware');
const upload  = require('../middleware/upload');
const {
    getProfile, updateProfile,
    getSchedule, saveSchedule,
    getAvailableSlots,
    getAppointments, updateAppointmentStatus,
    toggleStatus, getMyPatients, saveAIAnalysis
} = require('../controllers/doctorController');

// ── Slots — any logged-in user (patient/doctor/admin can fetch slots) ──
router.get('/slots', protect, getAvailableSlots);

// ── All doctor-only routes ────────────────────────────
router.use(protect, roleOnly('doctor'));

router.get ('/profile',                           getProfile);
router.put ('/profile', upload.single('avatar'),  updateProfile);

router.get ('/schedule',  getSchedule);
router.post('/schedule',  saveSchedule);

router.get ('/appointments',               getAppointments);
router.put ('/appointments/:id/status',    updateAppointmentStatus);
router.put ('/appointments/:id/analysis',  saveAIAnalysis);

router.put ('/status',   toggleStatus);
router.get ('/patients', getMyPatients);

module.exports = router;