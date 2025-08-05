const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Chat = require('../models/Chat');

// Create or get chat between two users
router.post('/access', verifyToken, async (req, res) => {
  const { otherUserId } = req.body;

  let chat = await Chat.findOne({
    members: { $all: [req.user.id, otherUserId] }
  });

  if (!chat) {
    chat = await Chat.create({ members: [req.user.id, otherUserId], messages: [] });
  }

  res.json(chat);
});

// Get all user chats
router.get('/', verifyToken, async (req, res) => {
  const chats = await Chat.find({ members: req.user.id }).sort({ lastUpdated: -1 });
  res.json(chats);
});

// Get messages in one chat
router.get('/:id', verifyToken, async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat || !chat.members.includes(req.user.id)) return res.status(403).json({ error: 'Access denied' });
  res.json(chat.messages);
});

module.exports = router;
