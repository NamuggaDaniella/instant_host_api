const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { sendMessage, getConversation } = require('../controllers/messageController');

// Send a message from authenticated user to another user
router.post('/messages', authenticateToken, sendMessage);

// Get conversation with another user
router.get('/messages/with/:otherId', authenticateToken, getConversation);

module.exports = router;
