const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { protect: auth } = require('../middlewares/auth');

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login?error=google_auth_failed' 
  }), 
  authController.googleCallback
);

// Local authentication routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/user', auth, authController.getUser);
router.get('/verify', auth, authController.verifyToken);
router.post('/logout', authController.logout);

module.exports = router;

