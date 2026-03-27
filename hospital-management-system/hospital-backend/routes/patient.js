const express = require('express');
const router  = express.Router();
const { protect, roleOnly } = require('../middleware/authMiddleware');

// Placeholder routes - baad mein controller se connect karein
router.get('/profile', protect, roleOnly('patient'), (req, res) => {
    res.json({ success: true, message: 'Patient route working!' });
});

module.exports = router;