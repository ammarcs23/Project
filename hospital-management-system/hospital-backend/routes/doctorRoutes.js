const express = require('express');
const router  = express.Router();
const { protect, roleOnly } = require('../middleware/authMiddleware');

const {
    getDoctorProfile,
    getScheduleSettings,
    updateScheduleSettings,
    getAvailableSlots,
    getDoctorAppointments,
    updateAppointmentStatus,
    getDoctorPatients,
} = require('../controllers/doctorController');

// Doctor ke apne routes (login required + doctor role)
router.use(protect, roleOnly('doctor'));

router.get ('/profile',                   getDoctorProfile);
router.get ('/schedule',                  getScheduleSettings);
router.put ('/schedule',                  updateScheduleSettings);
router.get ('/appointments',              getDoctorAppointments);
router.put ('/appointments/:id/status',   updateAppointmentStatus);
router.get ('/patients',                  getDoctorPatients);

module.exports = router;