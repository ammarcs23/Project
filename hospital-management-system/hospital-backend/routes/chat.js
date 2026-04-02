// hospital-backend/routes/chat.js
const express = require('express');
const router  = express.Router();
const { protect, roleOnly } = require('../middleware/authMiddleware');
const { getMessages, sendMessage } = require('../controllers/chatController');

// Both doctor and patient can access — protect only (no roleOnly restriction)
router.use(protect, roleOnly('doctor','patient'));

router.get ('/:appointmentId',       getMessages);
router.post('/:appointmentId',       sendMessage);

module.exports = router;