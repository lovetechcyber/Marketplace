const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const chatSocket = require('./sockets/chatSocket');
require('dotenv').config();

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*', // set your frontend origin
    methods: ['GET', 'POST']
  }
});

chatSocket(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  });

module.exports = io;
