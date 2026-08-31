# 🌱 AgriAI (KrushiSetu) - Complete Project Flow & Architecture

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Authentication Flow](#authentication-flow)
4. [Frontend Structure](#frontend-structure)
5. [Backend Structure](#backend-structure)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Real-time Features](#real-time-features)
9. [AI/ML Integration](#aiml-integration)
10. [Development Setup](#development-setup)
11. [Deployment Guide](#deployment-guide)
12. [Security Implementation](#security-implementation)

---

## 🎯 Project Overview

**AgriAI (KrushiSetu)** is a comprehensive smart agricultural platform that provides:

- 🤖 **AI-Powered Features**: Plant disease detection, crop recommendations, yield prediction
- 👥 **Community Features**: Farmer communities, expert consultation, real-time chat
- 🛠️ **Equipment Sharing**: Rental marketplace for agricultural equipment
- 📊 **Analytics**: Farm performance tracking, expense management
- 🌦️ **Weather Integration**: Climate data and smart farming advice
- 🏛️ **Government Schemes**: Subsidy tracking and benefit management

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        AGRIAI PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (React + Vite)           │  BACKEND (Express.js)      │
│  ┌─────────────────────────────┐   │  ┌─────────────────────────┐│
│  │ • Landing Page              │   │  │ • Authentication        ││
│  │ • Login/Register            │   │  │ • User Management       ││
│  │ • Dashboard                 │   │  │ • API Routes            ││
│  │ • Protected Routes          │   │  │ • Socket.io Server      ││
│  │ • Real-time Chat            │   │  │ • File Upload          ││
│  └─────────────────────────────┘   │  └─────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  DATABASE (MongoDB)              │  AI/ML SERVICES (Python)    │
│  ┌─────────────────────────────┐   │  ┌─────────────────────────┐│
│  │ • User Collection           │   │  │ • CNN Disease Detection ││
│  │ • Community Collection      │   │  │ • Crop Recommendation  ││
│  │ • Equipment Collection      │   │  │ • Yield Prediction     ││
│  │ • Message Collection        │   │  │ • Analytics API         ││
│  └─────────────────────────────┘   │  └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### 1. User Registration Flow
```
User Input → Frontend Validation → API Call → Backend Processing → Database Storage → JWT Token → Frontend State Update → Dashboard Redirect
```

### 2. Login Flow
```
Email/Password → Validation → Backend Auth → Password Verification → JWT Generation → Cookie Setting → Context Update → Dashboard Access
```

### 3. Google OAuth Flow
```
Google Button → Google OAuth → Callback → User Creation/Linking → JWT Token → Dashboard Redirect
```

### 4. Protected Route Flow
```
Route Access → Auth Check → Token Verification → Server Validation → Access Granted/Denied
```

---

## 🎨 Frontend Structure

### Core Components
```
client/src/
├── components/           # Reusable UI components
│   ├── DashboardNav.jsx
│   ├── ProtectedRoute.jsx
│   ├── EquipmentSharing.jsx
│   └── PlantDiseaseDetector.jsx
├── pages/               # Route pages
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── [Feature Pages]
├── Authorisation/       # Authentication
│   └── AuthProvider.jsx
├── hooks/              # Custom hooks
│   └── useAuthState.js
└── utils/              # Utility functions
    └── authUtils.js
```

### Key Features
- **React 19** with Vite build system
- **TailwindCSS** for modern styling
- **React Router** for navigation
- **Context API** for state management
- **Socket.io-client** for real-time features
- **Axios** for API communication

---

## ⚙️ Backend Structure

### Core Architecture
```
server/
├── controllers/         # Business logic
│   ├── AuthController.js
│   ├── plantDiseaseController.js
│   └── [Other Controllers]
├── models/             # Database schemas
│   ├── User.js
│   ├── Community.js
│   └── [Other Models]
├── routes/             # API endpoints
│   ├── authRoutes.js
│   ├── plantDiseaseRoutes.js
│   └── [Other Routes]
├── middlewares/        # Middleware functions
│   └── auth.js
├── config/             # Configuration
│   └── passport.js
└── index.js            # Main server file
```

### Key Features
- **Express.js** server with middleware
- **MongoDB** with Mongoose ODM
- **Passport.js** for authentication
- **Socket.io** for real-time communication
- **JWT** for secure token management
- **Multer** for file uploads

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed with bcrypt),
  googleId: String (for OAuth),
  avatar: String,
  role: ['user', 'admin'],
  isActive: Boolean,
  lastLogin: Date,
  profile: {
    phone: String,
    location: String,
    farmSize: String,
    crops: String,
    experience: String,
    bio: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Community Model
```javascript
{
  name: String (required),
  description: String,
  creator: ObjectId (User reference),
  members: [ObjectId] (User references),
  messages: [ObjectId] (Message references),
  isActive: Boolean,
  createdAt: Date
}
```

### Equipment Model
```javascript
{
  name: String (required),
  description: String,
  category: String,
  price: Number,
  location: String,
  owner: ObjectId (User reference),
  images: [String],
  isAvailable: Boolean,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
GET  /api/auth/google            # Google OAuth
GET  /api/auth/google/callback   # OAuth callback
GET  /api/auth/user              # Get current user
GET  /api/auth/verify            # Verify token
POST /api/auth/logout            # User logout
```

### Feature Endpoints
```
# Plant Disease Detection
POST /api/plant-disease/upload   # Upload image for analysis
GET  /api/plant-disease/history # Get analysis history

# Crop Recommendation
POST /api/crop-recommendation    # Get crop suggestions
GET  /api/crop-recommendation/history

# Equipment Sharing
GET  /api/equipment              # List equipment
POST /api/equipment              # Add equipment
POST /api/equipment-bookings     # Book equipment

# Community Features
GET  /api/communities            # List communities
POST /api/communities            # Create community
GET  /api/communities/:id/messages # Get messages

# Expert Consultation
GET  /api/experts                # List experts
POST /api/experts/consultation   # Book consultation

# Analytics
GET  /api/farmer-analytics       # Get analytics data
POST /api/farmer-analytics       # Add analytics data
```

---

## ⚡ Real-time Features

### Socket.io Implementation
```javascript
// Server-side (server/index.js)
io.on('connection', (socket) => {
  // Join user-specific room
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
  });
  
  // Join community room
  socket.on('joinCommunityRoom', (communityId) => {
    socket.join(`community_${communityId}`);
  });
  
  // Handle community messages
  socket.on('communityMessage', (data) => {
    io.to(`community_${data.communityId}`).emit('newMessage', {
      sender: data.sender,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });
});
```

### Frontend Integration
```javascript
// Client-side
import io from 'socket.io-client';

const socket = io(process.env.VITE_BACKEND_URL);

// Join community room
socket.emit('joinCommunityRoom', communityId);

// Send message
socket.emit('communityMessage', {
  communityId,
  sender: user.name,
  message: messageText
});
```

---

## 🤖 AI/ML Integration

### Plant Disease Detection
```python
# CNN Model (cnn_model/app.py)
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image

def predict_disease(image_path):
    model = load_model('plant_disease_resnet.h5')
    image = preprocess_image(image_path)
    prediction = model.predict(image)
    return get_disease_info(prediction)
```

### Crop Recommendation
```python
# Crop Recommendation (Crop_Recommendation/app.py)
import pickle
import pandas as pd

def recommend_crop(soil_data, weather_data):
    model = pickle.load(open('crop_recommendation.pkl', 'rb'))
    prediction = model.predict([soil_data, weather_data])
    return get_crop_info(prediction)
```

### Yield Prediction
```python
# Yield Prediction (crop_yeild_prediction/app.py)
def predict_yield(location, weather, soil_conditions):
    model = pickle.load(open('crop_yield_model.pkl', 'rb'))
    features = prepare_features(location, weather, soil_conditions)
    yield_prediction = model.predict(features)
    return yield_prediction
```

---

## 🛠️ Development Setup

### 1. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Configure environment variables
# PORT=8000
# MONGO_URI=mongodb://localhost:27017/agriai
# JWT_SECRET=your-secret-key
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create environment file
# VITE_BACKEND_URL=http://localhost:8000

# Start development server
npm run dev
```

### 3. Python Services Setup
```bash
# CNN Model for Plant Disease Detection
cd cnn_model
pip install -r requirements.txt
python app.py  # Runs on port 5000

# Crop Recommendation Service
cd Crop_Recommendation
pip install -r requirements.txt
python run_server.py  # Runs on port 5001

# Yield Prediction Service
cd crop_yeild_prediction
pip install -r requirements.txt
python run_server.py  # Runs on port 5002

# Farmer Analytics Service
cd Farmer Analytics
pip install -r requirements.txt
python app.py  # Runs on port 5003
```

### 4. Database Setup
```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb

# Start MongoDB service
sudo systemctl start mongodb
# or
brew services start mongodb
```

---

## 🚀 Deployment Guide

### Production Environment Variables
```env
# Backend (.env)
NODE_ENV=production
PORT=8000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agriai
JWT_SECRET=your-production-secret-key
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
FRONTEND_URL=https://your-frontend-domain.com

# Frontend (.env)
VITE_BACKEND_URL=https://your-backend-domain.com
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Railway, Heroku, or AWS EC2
- **Database**: MongoDB Atlas
- **AI Services**: AWS Lambda, Google Cloud Functions, or separate VPS

---

## 🔒 Security Implementation

### Authentication Security
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration with secure cookies
- **HTTP-only Cookies**: XSS protection
- **CORS Configuration**: Proper cross-origin handling

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Mongoose ODM protection
- **File Upload Security**: Multer with type and size validation
- **Environment Variables**: Secure configuration management

### API Security
- **Rate Limiting**: Prevent API abuse
- **Request Validation**: Input sanitization
- **Error Handling**: Secure error messages
- **HTTPS**: SSL/TLS encryption in production

---

## 📊 Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Browser caching for static assets
- **Bundle Optimization**: Tree shaking and minification

### Backend Optimizations
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Redis for session management
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Efficient database connections

### AI/ML Optimizations
- **Model Optimization**: Quantized models for faster inference
- **Batch Processing**: Efficient image processing
- **Caching**: Model result caching
- **Async Processing**: Non-blocking AI operations

---

## 🎯 Key Features Summary

### ✅ Implemented Features
1. **User Authentication**: Login, Register, Google OAuth
2. **AI Disease Detection**: CNN-based plant disease diagnosis
3. **Crop Recommendations**: ML-based crop suggestions
4. **Equipment Sharing**: Rental marketplace
5. **Farmer Community**: Real-time chat and discussions
6. **Expert Consultation**: Video call booking system
7. **Analytics Dashboard**: Farm performance tracking
8. **Expense Tracker**: Financial management
9. **Weather Integration**: Climate data and advice
10. **Government Schemes**: Subsidy and benefit tracking

### 🔄 Real-time Features
- **Live Chat**: Socket.io-based community messaging
- **Notifications**: Real-time user notifications
- **Room Management**: Dynamic community rooms
- **Message Broadcasting**: Efficient message delivery

### 🤖 AI/ML Features
- **Plant Disease Detection**: CNN with ResNet architecture
- **Crop Yield Prediction**: Statistical modeling
- **Smart Recommendations**: ML-based suggestions
- **Image Processing**: Automated image analysis

---

## 📈 Future Enhancements

### Planned Features
1. **Mobile App**: React Native implementation
2. **IoT Integration**: Sensor data collection
3. **Blockchain**: Supply chain tracking
4. **Advanced AI**: More sophisticated ML models
5. **Multi-language**: Internationalization support
6. **Voice Commands**: Voice-controlled interface
7. **AR Features**: Augmented reality for field analysis

### Scalability Improvements
1. **Microservices**: Service-oriented architecture
2. **Load Balancing**: Multiple server instances
3. **CDN**: Content delivery network
4. **Database Sharding**: Horizontal scaling
5. **Caching Layer**: Redis/Memcached implementation

---

## 🎉 Conclusion

**AgriAI (KrushiSetu)** is a comprehensive, production-ready smart agricultural platform that provides:

- **Complete Authentication System** with multiple providers
- **AI-Powered Features** for smart farming
- **Real-time Community Features** for farmer collaboration
- **Equipment Sharing Marketplace** for resource optimization
- **Analytics and Tracking** for farm management
- **Government Integration** for subsidy management

The platform is built with modern technologies, follows security best practices, and provides a scalable architecture for future growth. It's ready for production deployment and can serve thousands of farmers with its comprehensive feature set.

**🌱 Empowering farmers with AI-driven agricultural solutions! 🚀**
