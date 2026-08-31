const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, changePassword, deleteAccount } = require('../controllers/UserController');
const { protect: authenticateToken } = require('../middlewares/auth');

// All user routes require authentication
router.use(authenticateToken);

// GET /api/user/profile - Get user profile
router.get('/profile', getUserProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', updateUserProfile);

// POST /api/user/change-password - Change password
router.post('/change-password', changePassword);

// DELETE /api/user/account - Delete user account
router.delete('/account', deleteAccount);

module.exports = router;
