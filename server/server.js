const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const conversationsRoute = require('./routes/conversations');
const messagesRoute = require('./routes/messages');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST']
}));

// Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/conversations', conversationsRoute);
// Make messages route accessible at /api/conversations/:id/messages
app.use('/api/conversations', messagesRoute);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // joinRoom
  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined room ${conversationId}`);
  });

  // sendMessage
  socket.on('sendMessage', ({ conversationId, sender, text }) => {
    // broadcast new message to room
    io.to(conversationId).emit('receiveMessage', {
      conversationId,
      sender,
      text,
      createdAt: new Date(),
    });
  });

  socket.on('typing', ({ conversationId, senderId }) => {
    socket.to(conversationId).emit('typing', { conversationId, senderId });
  });

  socket.on('stopTyping', ({ conversationId, senderId }) => {
    socket.to(conversationId).emit('stopTyping', { conversationId, senderId });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp-clone')
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
  })
  .catch((err) => console.log(err));
