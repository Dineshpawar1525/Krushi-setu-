// server.js

// Load environment variables FIRST
require('dotenv').config(); // Load environment variables from .env file

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
const http = require('http'); // Needed for Socket.io
const { Server } = require('socket.io');

// Create an Express application
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static('uploads'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Continuing without MongoDB...');
  });
} else {
  console.log('⚠️  No MongoDB URI provided, running without database');
}

// Simple test route
app.get('/', (req, res) => {
  res.send('Hello from the KrushiSetu backend!');
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const communityRoutes = require('./routes/communityRoutes');
const expertRoutes = require('./routes/expertRoutes');
const aiRoutes = require('./routes/aiRoutes');
const financialRoutes = require('./routes/financialRoutes');
const plantDiseaseRoutes = require('./routes/plantDiseaseRoutes');
const cropRecommendationRoutes = require('./routes/cropRecommendationRoutes');
const equipmentRoutes = require('./routes/equipmentRoutesSimple');
const equipmentBookingRoutes = require('./routes/equipmentBookingRoutes');
const farmerAnalyticsRoutes = require('./routes/farmerAnalyticsRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const teamRoutes = require('./routes/teamRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Use API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/financial-advice', financialRoutes);
app.use('/api/plant-disease', plantDiseaseRoutes);
app.use('/api/crop-recommendation', cropRecommendationRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/equipment-bookings', equipmentBookingRoutes);
app.use('/api/farmer-analytics', farmerAnalyticsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/analytics', analyticsRoutes);

// ---------------------- SOCKET.IO SETUP ----------------------

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Set Socket.io instance for community routes
communityRoutes.setSocketIO(io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('⚡ New client connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  // Join creator-specific room for join request notifications
  socket.on('joinCreatorRoom', (creatorId) => {
    socket.join(`creator_${creatorId}`);
    console.log(`Creator ${creatorId} joined their notification room`);
  });

  // Join community room for real-time messaging
  socket.on('joinCommunityRoom', (communityId) => {
    socket.join(`community_${communityId}`);
    console.log(`User ${socket.id} joined community room: ${communityId}`);
    // Send confirmation back to client
    socket.emit('joinedCommunityRoom', { communityId, success: true });
  });

  // Leave community room
  socket.on('leaveCommunityRoom', (communityId) => {
    socket.leave(`community_${communityId}`);
    console.log(`User ${socket.id} left community room: ${communityId}`);
  });

  // Handle sending chat messages (legacy support)
  socket.on('chatMessage', (data) => {
    // Broadcast message to everyone in the room
    io.to(data.room).emit('newMessage', {
      sender: data.sender,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle community message sending
  socket.on('communityMessage', (data) => {
    // Broadcast message to all members in the community
    io.to(`community_${data.communityId}`).emit('newMessage', {
      sender: data.sender,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ---------------------- START SERVER ----------------------
server.listen(port, () => {
  console.log(`🚀 Server with Socket.io is running on port: ${port}`);
});