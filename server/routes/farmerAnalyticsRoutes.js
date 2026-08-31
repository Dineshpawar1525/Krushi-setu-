const express = require('express');
const router = express.Router();
const {
  getAnalyticsData,
  getFilterOptions,
  getAnalyticsSummary,
  getFilteredDistricts,
  getFilteredCrops,
  getFilteredSeasons
} = require('../controllers/farmerAnalyticsController');

// Get analytics data with filters
router.get('/data', getAnalyticsData);

// Get available filter options
router.get('/filters', getFilterOptions);

// Get analytics summary
router.get('/summary', getAnalyticsSummary);

// Get filtered districts based on selected states
router.get('/filtered-districts', getFilteredDistricts);

// Get filtered crops based on selected states and districts
router.get('/filtered-crops', getFilteredCrops);

// Get filtered seasons based on selected crops
router.get('/filtered-seasons', getFilteredSeasons);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Farmer Analytics API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
