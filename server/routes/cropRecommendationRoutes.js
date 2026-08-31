const express = require('express');
const router = express.Router();
const { recommendCrop, testConnection } = require('../controllers/cropRecommendationController');

// Test connection endpoint
router.get('/test', testConnection);

// Get crop recommendation
router.post('/predict', recommendCrop);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Crop Recommendation API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
