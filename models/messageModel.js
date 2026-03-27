/**
 * models/messageModel.js - Data Access Layer for Messages
 */
const db = require('../config/db');

const Message = {
  create: ({ from_id, to_id, content }) =>
    db.query(
      'INSERT INTO messages (from_id, to_id, content) VALUES (?, ?, ?)',
      [from_id, to_id, content]
    ),

  /**
   * Return all messages exchanged between two users ordered by time.
   */
  getConversation: (userA, userB) =>
    db.query(
      `SELECT id, from_id, to_id, content, is_read, created_at
       FROM messages
       WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)
       ORDER BY created_at ASC`,
      [userA, userB, userB, userA]
    ),

  markReadBetween: (userA, userB) =>
    db.query(
      'UPDATE messages SET is_read = TRUE WHERE from_id = ? AND to_id = ? AND is_read = FALSE',
      [userB, userA]
    ),
};

module.exports = Message;
