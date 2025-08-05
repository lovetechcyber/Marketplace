const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, default: '' },
  media: { type: String, default: '' }, // image/video/audio URL
  mediaType: { type: String, enum: ['image', 'video', 'audio', 'none'], default: 'none' },
  timestamp: { type: Date, default: Date.now }
});


const chatSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 2 members only
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
