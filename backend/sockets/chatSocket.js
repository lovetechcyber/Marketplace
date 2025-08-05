const Chat = require('../models/Chat');
const { uploader } = require('../services/cloudinaryService');

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('⚡ User connected:', socket.id);

    // Join room
    socket.on('joinRoom', ({ chatId }) => {
      socket.join(chatId);
    });

    // Send message
    socket.on('sendMessage', async ({ chatId, senderId, text, mediaBuffer, mediaType }) => {
      let mediaUrl = '';

      if (mediaBuffer) {
        const uploaded = await uploader.upload_stream_to_cloudinary(
          Buffer.from(mediaBuffer.data),
          'chat_media'
        );
        mediaUrl = uploaded.secure_url;
      }

      const newMessage = {
        senderId,
        text,
        media: mediaUrl,
        timestamp: new Date()
      };

      const updatedChat = await Chat.findByIdAndUpdate(chatId, {
        $push: { messages: newMessage },
        $set: { lastUpdated: new Date() }
      }, { new: true });

      io.to(chatId).emit('receiveMessage', newMessage);
    });
  });
};
