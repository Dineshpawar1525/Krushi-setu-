/**
 * Simple test for plant disease detection
 */
const axios = require('axios');

async function testPlantDiseaseAPI() {
  console.log('🧪 Testing Plant Disease Detection API...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:8000/api/plant-disease/health');
    console.log('✅ Health endpoint working:', healthResponse.data);
    
    // Test diseases endpoint
    console.log('2. Testing diseases endpoint...');
    const diseasesResponse = await axios.get('http://localhost:8000/api/plant-disease/diseases');
    console.log('✅ Diseases endpoint working:', diseasesResponse.data.diseases?.length || 0, 'diseases found');
    
    console.log('\n🎉 Plant Disease Detection API is working correctly!');
    console.log('📋 Available endpoints:');
    console.log('   - GET /api/plant-disease/health');
    console.log('   - GET /api/plant-disease/diseases');
    console.log('   - POST /api/plant-disease/predict');
    
    return true;
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    return false;
  }
}

// Run the test
testPlantDiseaseAPI();
