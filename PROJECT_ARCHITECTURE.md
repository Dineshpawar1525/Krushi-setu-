# AgriAI - Complete Project Architecture & Flow

## 🏗️ Project Overview

**KrushiSetu (AgriAI)** is a comprehensive smart agricultural platform that provides AI-powered crop recommendations, disease detection, equipment sharing, and community features for farmers.

## 📁 Project Structure

```
AgriAI/
├── client/                    # React Frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── Authorisation/   # Auth context & providers
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
├── server/                   # Express.js Backend
│   ├── controllers/         # Route handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middlewares/        # Auth & validation
│   └── config/             # Database & passport config
├── cnn_model/              # Python CNN for plant disease detection
├── Crop_Recommendation/    # Python Flask app for crop recommendations
└── Farmer Analytics/       # Python analytics API
```

## 🔐 Authentication System Architecture

### Backend Authentication Flow

1. **User Registration/Login**
   - **Local Auth**: Email/Password with bcrypt hashing
   - **Google OAuth**: Passport.js with Google Strategy
   - **JWT Tokens**: 7-day expiration with secure cookies

2. **Authentication Middleware**
   - Token validation in `middlewares/auth.js`
   - Supports both Bearer tokens and HTTP-only cookies
   - User session management with Passport.js

3. **Database Models**
   - **User Model**: MongoDB schema with bcrypt password hashing
   - **Profile Fields**: Location, farm size, crops, experience
   - **Role-based Access**: User/Admin roles

### Frontend Authentication Flow

1. **AuthProvider Context**
   - Global authentication state management
   - Token storage in localStorage
   - Automatic token validation

2. **Protected Routes**
   - `ProtectedRoute` component wraps secure pages
   - Automatic redirect to login for unauthenticated users
   - Loading states during auth verification

3. **Auth State Management**
   - `useAuthState` hook for global auth state
   - `authUtils` for localStorage operations
   - Automatic logout on token expiration

## 🚀 Application Flow

### 1. User Journey

```
Landing Page → Login/Register → Dashboard → Feature Pages
     ↓              ↓              ↓           ↓
Public Access → Authentication → Protected → AI Features
```

### 2. Authentication Flow

```
User Input → Validation → Backend Auth → JWT Token → Frontend State
     ↓            ↓           ↓            ↓           ↓
Form Submit → Client Check → Server Verify → Cookie Set → Context Update
```

### 3. Protected Route Flow

```
Route Access → Auth Check → Token Verify → Server Validation → Access Granted
     ↓             ↓           ↓              ↓                ↓
Component Load → useAuthState → checkAuth → Backend Verify → Render Content
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with Vite build system
- **TailwindCSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time features
- **React Toastify** for notifications

### Backend
- **Express.js** server with middleware
- **MongoDB** with Mongoose ODM
- **Passport.js** for authentication
- **JWT** for token management
- **Socket.io** for real-time communication
- **Multer** for file uploads

### AI/ML Services
- **Python Flask** apps for ML models
- **TensorFlow/Keras** for CNN models
- **Pickle** for model serialization
- **ResNet** architecture for plant disease detection

## 🔄 API Architecture

### Core Endpoints

```
/api/auth/
├── POST /register          # User registration
├── POST /login             # User login
├── GET /google             # Google OAuth
├── GET /google/callback    # OAuth callback
├── GET /user               # Get current user
├── GET /verify             # Verify token
└── POST /logout            # User logout

/api/plant-disease/         # AI disease detection
/api/crop-recommendation/   # Crop suggestions
/api/equipment/             # Equipment sharing
/api/communities/          # Farmer communities
/api/experts/               # Expert consultation
/api/farmer-analytics/      # Analytics data
```

### Real-time Features
- **Socket.io** for live chat in communities
- **Room-based messaging** for community discussions
- **Real-time notifications** for user activities

## 🎯 Key Features Implementation

### 1. AI-Powered Features
- **Plant Disease Detection**: CNN model with image upload
- **Crop Recommendations**: ML-based suggestions
- **Yield Prediction**: Statistical analysis with weather data

### 2. Community Features
- **Farmer Communities**: Real-time chat with Socket.io
- **Expert Consultation**: Video call booking system
- **Equipment Sharing**: Rental marketplace

### 3. Analytics & Tracking
- **Expense Tracker**: Financial management
- **Government Schemes**: Subsidy tracking
- **Weather Integration**: Climate data

## 🔧 Development Setup

### Backend Setup
```bash
cd server
npm install
cp env.example .env
npm run dev  # Port 8000
```

### Frontend Setup
```bash
cd client
npm install
npm run dev  # Port 3000
```

### Python Services
```bash
# CNN Model
cd cnn_model
pip install -r requirements.txt
python app.py  # Port 5000

# Crop Recommendation
cd Crop_Recommendation
pip install -r requirements.txt
python run_server.py  # Port 5001
```

## 🛡️ Security Implementation

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HTTP-only Cookies**: XSS protection
- **CORS Configuration**: Cross-origin request handling

### Data Protection
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Mongoose ODM
- **File Upload Security**: Multer with type validation
- **Environment Variables**: Secure configuration

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String,
  avatar: String,
  role: ['user', 'admin'],
  profile: {
    phone: String,
    location: String,
    farmSize: String,
    crops: String,
    experience: String,
    bio: String
  }
}
```

### Community Model
```javascript
{
  name: String,
  description: String,
  creator: ObjectId (User),
  members: [ObjectId],
  messages: [ObjectId],
  isActive: Boolean
}
```

## 🚀 Deployment Architecture

### Production Setup
- **Frontend**: Vercel/Netlify deployment
- **Backend**: Railway/Heroku deployment
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary/AWS S3
- **AI Services**: Separate Python deployments

### Environment Configuration
```env
# Backend
PORT=8000
MONGO_URI=mongodb://localhost:27017/agriai
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend
VITE_BACKEND_URL=http://localhost:8000
```

## 🔄 Data Flow Diagram

```
User Interface (React)
        ↓
API Gateway (Express.js)
        ↓
Authentication (Passport.js + JWT)
        ↓
Business Logic (Controllers)
        ↓
Data Layer (MongoDB + Mongoose)
        ↓
External Services (AI/ML APIs)
```

## 🎯 Future Enhancements

1. **Mobile App**: React Native implementation
2. **IoT Integration**: Sensor data collection
3. **Blockchain**: Supply chain tracking
4. **Advanced AI**: More sophisticated ML models
5. **Multi-language**: Internationalization support

## 📈 Performance Optimizations

1. **Frontend**: Code splitting, lazy loading
2. **Backend**: Caching, database indexing
3. **AI Models**: Model optimization, batch processing
4. **Real-time**: Efficient Socket.io room management

This architecture provides a scalable, secure, and feature-rich agricultural platform that can grow with user needs and technological advancements.
