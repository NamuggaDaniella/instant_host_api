const Message = require('../models/messageModel');
const User = require('../models/userModel');

/** POST /api/messages
 * Body: { to_id, content }
 * Auth required — sender is req.user.id
 */
const sendMessage = async (req, res) => {
  try {
    const from_id = req.user.id;
    const { to_id, content } = req.body;

    if (!to_id || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'to_id and content are required.' });
    }

    // Ensure recipient exists
    const [rows] = await User.findByIdFull(to_id);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found.' });
    }

    await Message.create({ from_id, to_id, content });
    res.json({ message: 'Message sent.' });
  } catch (err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

/** GET /api/messages/with/:otherId
 * Returns full conversation between authenticated user and :otherId
 */
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = parseInt(req.params.otherId, 10);

    if (!otherId) return res.status(400).json({ error: 'Invalid other user id.' });

    const [rows] = await Message.getConversation(userId, otherId);

    // Mark messages from the other user to the current user as read
    await Message.markReadBetween(userId, otherId);

    res.json({ conversation: rows });
  } catch (err) {
    console.error('getConversation error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendMessage, getConversation };
