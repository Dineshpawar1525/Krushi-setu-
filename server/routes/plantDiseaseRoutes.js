const express = require('express');
const router = express.Router();
const { upload, uploadAndPredict, getDiseaseInfo, getAllDiseases } = require('../controllers/plantDiseaseController');

// Upload and predict plant disease
router.post('/predict', upload.single('image'), uploadAndPredict);

// Get disease information by name
router.get('/disease/:diseaseName', getDiseaseInfo);

// Get all available diseases
router.get('/diseases', getAllDiseases);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Plant Disease Detection API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
