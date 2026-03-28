// hospital-backend/routes/patient.js
const express = require('express');
const router  = express.Router();
const { protect, roleOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
    getMyProfile, updateMyProfile,
    getMyAppointments, bookAppointment, cancelAppointment, saveMyAnalysis,
    getActiveDoctors,
} = require('../controllers/patientController');

// All routes — must be logged in as patient
router.use(protect, roleOnly('patient'));

// Profile
router.get('/profile',                            getMyProfile);
router.put('/profile', upload.single('avatar'),   updateMyProfile);

// Doctors list (for booking)
router.get('/doctors', getActiveDoctors);

// Appointments
router.get('/appointments',                       getMyAppointments);
router.post('/appointments',                      bookAppointment);
router.put('/appointments/:id/cancel',            cancelAppointment);
router.put('/appointments/:id/analysis',          saveMyAnalysis);

module.exports = router;