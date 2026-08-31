const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/experts/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDF, and document files are allowed'));
    }
  }
});
const {
  registerExpert,
  getExperts,
  getExpert,
  getExpertConsultationTypes,
  getExpertAvailability,
  bookConsultation,
  getUserConsultations,
  updateConsultationStatus,
  cancelConsultation
} = require('../controllers/expertController');

// ------------------- PUBLIC ROUTES -------------------

// GET /api/experts - Get all experts with filtering
router.get('/', getExperts);

// POST /api/experts/register - Register as expert
router.post('/register', upload.single('proofFile'), registerExpert);

// GET /api/experts/:id - Get single expert details
router.get('/:id', getExpert);

// GET /api/experts/:id/consultation-types - Get expert's consultation types and pricing
router.get('/:id/consultation-types', getExpertConsultationTypes);

// GET /api/experts/:id/availability - Get expert's availability for a specific date
router.get('/:id/availability', getExpertAvailability);

// ------------------- PROTECTED ROUTES -------------------

// POST /api/experts/book - Book a consultation with an expert
router.post('/book', auth, bookConsultation);

// GET /api/experts/my-consultations - Get user's consultations
router.get('/my-consultations', auth, getUserConsultations);

// PUT /api/experts/consultations/:id/status - Update consultation status
router.put('/consultations/:id/status', auth, updateConsultationStatus);

// DELETE /api/experts/consultations/:id/cancel - Cancel a consultation
router.delete('/consultations/:id/cancel', auth, cancelConsultation);

module.exports = router;
