const axios = require('axios');

// Function to call Python server for analytics
const runAnalyticsScript = async (filters) => {
  try {
    const response = await axios.post('http://localhost:5000/api/farmer-analytics/dashboard', filters);
    return response.data;
  } catch (error) {
    console.error('Error calling Python server:', error.message);
    throw new Error(`Python server error: ${error.message}`);
  }
};

// Get analytics data with filters
const getAnalyticsData = async (req, res) => {
  try {
    console.log('📊 Getting farmer analytics data...');
    
    const filters = {
      state: req.query.state ? req.query.state.split(',') : null,
      district: req.query.district ? req.query.district.split(',') : null,
      crop: req.query.crop ? req.query.crop.split(',') : null,
      season: req.query.season ? req.query.season.split(',') : null,
      year_start: req.query.year_start ? parseInt(req.query.year_start) : null,
      year_end: req.query.year_end ? parseInt(req.query.year_end) : null
    };

    console.log('🔍 Filters applied:', filters);

    const result = await runAnalyticsScript(filters);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics data',
      details: error.message
    });
  }
};

// Get available filter options
const getFilterOptions = async (req, res) => {
  try {
    console.log('📋 Getting filter options...');
    
    const result = await runAnalyticsScript({ action: 'get_options' });
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filter options',
      details: error.message
    });
  }
};

// Get analytics summary
const getAnalyticsSummary = async (req, res) => {
  try {
    console.log('📈 Getting analytics summary...');
    
    const result = await runAnalyticsScript({ action: 'get_summary' });
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting analytics summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics summary',
      details: error.message
    });
  }
};

// Get filtered districts based on selected states
const getFilteredDistricts = async (req, res) => {
  try {
    console.log('🗺️ Getting filtered districts...');
    
    const states = req.query.states ? req.query.states.split(',') : [];
    const result = await runAnalyticsScript({ 
      action: 'get_filtered_districts',
      states: states
    });
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting filtered districts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filtered districts',
      details: error.message
    });
  }
};

// Get filtered crops based on selected states and districts
const getFilteredCrops = async (req, res) => {
  try {
    console.log('🌾 Getting filtered crops...');
    
    const states = req.query.states ? req.query.states.split(',') : [];
    const districts = req.query.districts ? req.query.districts.split(',') : [];
    
    const result = await runAnalyticsScript({ 
      action: 'get_filtered_crops',
      states: states,
      districts: districts
    });
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting filtered crops:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filtered crops',
      details: error.message
    });
  }
};

// Get filtered seasons based on selected crops
const getFilteredSeasons = async (req, res) => {
  try {
    console.log('📅 Getting filtered seasons...');
    
    const crops = req.query.crops ? req.query.crops.split(',') : [];
    
    const result = await runAnalyticsScript({ 
      action: 'get_filtered_seasons',
      crops: crops
    });
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting filtered seasons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filtered seasons',
      details: error.message
    });
  }
};

module.exports = {
  getAnalyticsData,
  getFilterOptions,
  getAnalyticsSummary,
  getFilteredDistricts,
  getFilteredCrops,
  getFilteredSeasons
};
