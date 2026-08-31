const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getUserEquipment,
  checkAvailability,
  getEquipmentFilters
} = require('../controllers/equipmentController');
const { authenticateToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for equipment images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/equipment/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'equipment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/', getAllEquipment);
router.get('/filters', getEquipmentFilters);
router.get('/:id', getEquipmentById);
router.get('/:id/availability', checkAvailability);

// Protected routes
router.post('/', authenticateToken, createEquipment);
router.put('/:id', authenticateToken, updateEquipment);
router.delete('/:id', authenticateToken, deleteEquipment);
router.get('/user/:userId', authenticateToken, getUserEquipment);

module.exports = router;
