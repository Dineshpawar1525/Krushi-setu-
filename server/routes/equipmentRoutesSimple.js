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
const { protect } = require('../middlewares/auth');

// Public routes
router.get('/', getAllEquipment);
router.get('/filters', getEquipmentFilters);
router.get('/:id', getEquipmentById);
router.get('/:id/availability', checkAvailability);

// Protected routes
router.post('/', protect, createEquipment);
router.put('/:id', protect, updateEquipment);
router.delete('/:id', protect, deleteEquipment);
router.get('/user/:userId', protect, getUserEquipment);

module.exports = router;
