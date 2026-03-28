// hospital-backend/routes/doctor.js
const express = require('express');
const router = express.Router();

// Example: GET /api/doctor/profile
router.get('/profile', (req, res) => {
    res.json({ success: true, message: 'Doctor route working!' });
});

module.exports = router;