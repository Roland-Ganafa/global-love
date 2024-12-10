require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const contentRoutes = require('./routes/content');
const mediaRoutes = require('./routes/media');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const { apiLimiter, authLimiter, profileLimiter, uploadLimiter } = require('./middleware/rateLimit');

// Apply rate limiters to specific routes
app.use('/api/auth', authLimiter);
app.use('/api/users/profile', profileLimiter);
app.use('/api/media/upload', uploadLimiter);
app.use('/api', apiLimiter);

// Error handling middleware (place before routes)
app.use((err, req, res, next) => {
  if (err instanceof RateLimitExceeded) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: err.message,
      retryAfter: err.retryAfter
    });
  }
  next(err);
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/content', require('./routes/content'));
app.use('/api/media', require('./routes/media'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.chatId).emit('receive_message', data);
    console.log(`Message sent in chat ${data.chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
