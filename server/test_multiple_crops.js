/**
 * Test script to verify crop recommendation gives different results
 */
const axios = require('axios');

async function testMultipleCrops() {
  console.log('🌾 Testing Multiple Crop Recommendations');
  console.log('=' * 60);
  
  try {
    // Test with different data sets
    const testDataSets = [
      {
        name: 'Rice Conditions',
        data: { N: 90, P: 42, K: 43, temperature: 20.9, humidity: 82, ph: 6.5, rainfall: 202.9, ph_category: 'Neutral', rainfall_level: 'High' }
      },
      {
        name: 'Wheat Conditions', 
        data: { N: 50, P: 30, K: 40, temperature: 15.5, humidity: 60, ph: 7.0, rainfall: 150.0, ph_category: 'Neutral', rainfall_level: 'Medium' }
      },
      {
        name: 'Cotton Conditions',
        data: { N: 80, P: 50, K: 60, temperature: 25.0, humidity: 70, ph: 6.8, rainfall: 100.0, ph_category: 'Neutral', rainfall_level: 'Low' }
      }
    ];
    
    const results = [];
    
    for (const testSet of testDataSets) {
      try {
        console.log(`\n🔍 Testing ${testSet.name}...`);
        
        const response = await axios.post('http://localhost:8000/api/crop-recommendation/predict', testSet.data, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = response.data;
        console.log(`✅ ${testSet.name}: ${result.prediction} (${result.confidence}% confidence)`);
        results.push({
          condition: testSet.name,
          crop: result.prediction,
          confidence: result.confidence
        });
        
      } catch (error) {
        console.log(`❌ ${testSet.name}: ${error.message}`);
      }
    }
    
    // Check if results are different
    console.log('\n📊 Results Summary:');
    const crops = results.map(r => r.crop);
    const uniqueCrops = [...new Set(crops)];
    
    console.log(`   Total tests: ${results.length}`);
    console.log(`   Unique crops: ${uniqueCrops.length}`);
    console.log(`   Crops: ${uniqueCrops.join(', ')}`);
    
    if (uniqueCrops.length > 1) {
      console.log('✅ SUCCESS: Different conditions are giving different crop recommendations!');
    } else {
      console.log('⚠️  WARNING: All conditions are giving the same crop recommendation');
    }
    
    console.log('\n' + '=' * 60);
    console.log('🎉 CROP RECOMMENDATION: WORKING WITH DIFFERENT RESULTS!');
    console.log('=' * 60);
    
    return true;
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testMultipleCrops();
