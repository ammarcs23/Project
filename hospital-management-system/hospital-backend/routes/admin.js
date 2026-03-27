const express = require('express');
const router  = express.Router();

const { protect, roleOnly } = require('../middleware/authMiddleware');

const {
    getDoctors, addDoctor, editDoctor, deleteDoctor, toggleDoctorStatus
} = require('../controllers/doctorController');

const {
    getPatients, editPatient, deletePatient, togglePatientStatus
} = require('../controllers/patientController');

const {
    getStats, getHomepage, updateHomepage,
    getAdmins, addAdmin, deleteAdmin
} = require('../controllers/adminController');

// Sab routes admin only hain
router.use(protect, roleOnly('admin'));

// ── Doctors ──────────────────────────────────
router.get   ('/doctors',              getDoctors);
router.post  ('/doctors',              addDoctor);
router.put   ('/doctors/:id',          editDoctor);
router.delete('/doctors/:id',          deleteDoctor);
router.patch ('/doctors/:id/status',   toggleDoctorStatus);

// ── Patients ─────────────────────────────────
router.get   ('/patients',             getPatients);
router.put   ('/patients/:id',         editPatient);
router.delete('/patients/:id',         deletePatient);
router.patch ('/patients/:id/status',  togglePatientStatus);

// ── Dashboard Stats ───────────────────────────
router.get('/stats', getStats);

// ── Homepage Content ──────────────────────────
router.get('/homepage',  getHomepage);
router.put('/homepage',  updateHomepage);

// ── Admin Management ──────────────────────────
router.get   ('/admins',    getAdmins);
router.post  ('/admins',    addAdmin);
router.delete('/admins/:id', deleteAdmin);

module.exports = router;