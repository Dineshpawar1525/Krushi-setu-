/**
 * Test script to verify crop recommendation API
 */
const axios = require('axios');

async function testCropRecommendation() {
  console.log('🌾 Testing Crop Recommendation API');
  console.log('=' * 50);
  
  try {
    // Test data
    const testData = {
      N: 90,
      P: 42,
      K: 43,
      temperature: 20.9,
      humidity: 82,
      ph: 6.5,
      rainfall: 202.9,
      ph_category: 'Neutral',
      rainfall_level: 'High'
    };
    
    console.log('📊 Test data:', testData);
    
    // Test the prediction endpoint
    console.log('\n🔍 Testing prediction endpoint...');
    
    const response = await axios.post('http://localhost:8000/api/crop-recommendation/predict', testData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Prediction successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    return true;
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.log('Error message:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
testCropRecommendation();
