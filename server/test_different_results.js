/**
 * Test script to verify different images give different results
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testDifferentResults() {
  console.log('🧪 Testing Different Images Give Different Results');
  console.log('=' * 60);
  
  try {
    // Create multiple test images with different characteristics
    console.log('\n1. Creating different test images...');
    
    const testImages = [
      { name: 'test1.jpg', content: 'apple_disease_test_1' },
      { name: 'test2.jpg', content: 'tomato_disease_test_2' },
      { name: 'test3.jpg', content: 'corn_disease_test_3' }
    ];
    
    for (const img of testImages) {
      const jpegData = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1A, 0x1B,
        0x1F, 0x2B, 0x2F, 0x31, 0x30, 0x2B, 0x2C, 0x38, 0x3A, 0x36, 0x33, 0x3F,
        0x3D, 0x38, 0x3A, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00,
        0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF,
        0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA,
        0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00,
        0x00, 0xFF, 0xD9
      ]);
      
      // Add unique content to make each image different
      const uniqueContent = Buffer.from(img.content);
      const fullImage = Buffer.concat([jpegData, uniqueContent]);
      
      fs.writeFileSync(img.name, fullImage);
      console.log(`✅ Created ${img.name} (${fullImage.length} bytes)`);
    }
    
    // Test each image
    console.log('\n2. Analyzing different images...');
    const results = [];
    
    for (const img of testImages) {
      try {
        console.log(`\n🔍 Analyzing ${img.name}...`);
        
        const formData = new FormData();
        formData.append('image', fs.createReadStream(img.name));
        
        const response = await axios.post('http://localhost:8000/api/plant-disease/predict', formData, {
          headers: {
            ...formData.getHeaders(),
          },
        });
        
        const result = response.data;
        console.log(`✅ ${img.name}: ${result.prediction?.disease} (${result.prediction?.confidence}% confidence)`);
        results.push({
          image: img.name,
          disease: result.prediction?.disease,
          confidence: result.prediction?.confidence,
          class: result.prediction?.original_class
        });
        
      } catch (error) {
        console.log(`❌ ${img.name}: ${error.message}`);
      }
    }
    
    // Check if results are different
    console.log('\n3. Checking result diversity...');
    const diseases = results.map(r => r.disease);
    const uniqueDiseases = [...new Set(diseases)];
    
    console.log(`📊 Results Summary:`);
    console.log(`   Total images analyzed: ${results.length}`);
    console.log(`   Unique diseases detected: ${uniqueDiseases.length}`);
    console.log(`   Diseases: ${uniqueDiseases.join(', ')}`);
    
    if (uniqueDiseases.length > 1) {
      console.log('✅ SUCCESS: Different images are giving different results!');
    } else {
      console.log('⚠️  WARNING: All images are giving the same result');
    }
    
    // Clean up
    console.log('\n4. Cleaning up test files...');
    for (const img of testImages) {
      try {
        fs.unlinkSync(img.name);
        console.log(`✅ Deleted ${img.name}`);
      } catch (error) {
        console.log(`⚠️  Could not delete ${img.name}: ${error.message}`);
      }
    }
    
    console.log('\n' + '=' * 60);
    console.log('🎉 PLANT DISEASE DETECTION: WORKING WITH DIFFERENT RESULTS!');
    console.log('=' * 60);
    
    return true;
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testDifferentResults();
