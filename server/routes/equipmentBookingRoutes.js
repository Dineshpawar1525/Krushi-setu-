const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  getBookingById,
  addBookingMessage,
  getBookingStats
} = require('../controllers/equipmentBookingController');
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Booking management
router.post('/', createBooking);
router.get('/user/:userId', getUserBookings);
router.get('/owner/:userId', getOwnerBookings);
router.get('/stats/:userId', getBookingStats);
router.get('/:bookingId', getBookingById);
router.put('/:bookingId/status', updateBookingStatus);
router.post('/:bookingId/messages', addBookingMessage);

module.exports = router;
