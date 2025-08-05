const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const chatSocket = require('./sockets/chatSocket');
chatSocket(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error(err));
