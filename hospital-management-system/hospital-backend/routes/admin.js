const express = require('express');
const router  = express.Router();

const { protect, roleOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const { getDoctors, addDoctor, editDoctor, deleteDoctor, toggleDoctorStatus } = require('../controllers/doctorController');
const { getPatients, editPatient, deletePatient, togglePatientStatus }        = require('../controllers/patientController');
const { getStats, getHomepage, updateHomepage, getAdmins, addAdmin, deleteAdmin } = require('../controllers/adminController');

// ✅ FIX: Homepage GET is PUBLIC (no auth needed)
router.get('/homepage', getHomepage);

// ── Protected Routes (Admin Only) ────────────
router.use(protect, roleOnly('admin'));

// ── Doctors ───────────────────────────────────
router.get   ('/doctors',            getDoctors);
router.post  ('/doctors',            upload.single('avatar'), addDoctor);
router.put   ('/doctors/:id',        upload.single('avatar'), editDoctor);
router.delete('/doctors/:id',        deleteDoctor);
router.patch ('/doctors/:id/status', toggleDoctorStatus);

// ── Patients ──────────────────────────────────
router.get   ('/patients',            getPatients);
router.put   ('/patients/:id',        upload.single('avatar'), editPatient);
router.delete('/patients/:id',        deletePatient);
router.patch ('/patients/:id/status', togglePatientStatus);

// ── Stats ─────────────────────────────────────
router.get('/stats', getStats);

// ── Homepage UPDATE (Admin Only) ──────────────
router.put('/homepage', updateHomepage);

// ── Admins ────────────────────────────────────
router.get   ('/admins',     getAdmins);
router.post  ('/admins',     addAdmin);
router.delete('/admins/:id', deleteAdmin);

module.exports = router;