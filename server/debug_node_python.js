/**
 * Debug script to test Node.js Python integration
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function debugNodePython() {
  console.log('🔍 Debugging Node.js Python Integration');
  console.log('=' * 50);
  
  try {
    // Create a test image
    console.log('1. Creating test image...');
    const testImagePath = 'debug_node_test.jpg';
    
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
      0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF,
      0xD9
    ]);
    
    fs.writeFileSync(testImagePath, jpegData);
    console.log(`✅ Created test image: ${testImagePath}`);
    
    // Test the exact same code as in the controller
    console.log('\n2. Testing Node.js Python execution...');
    
    const pythonPath = path.resolve(__dirname, '../cnn_model/app.py');
    console.log('📁 Python script path:', pythonPath);
    console.log('📁 File exists:', fs.existsSync(pythonPath));
    
    const pythonProcess = spawn('python', [
      pythonPath,
      '--image', testImagePath
    ], {
      shell: true
    });
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
      console.log('📤 Python stdout:', data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
      console.log('❌ Python stderr:', data.toString());
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`\n🐍 Python process exited with code: ${code}`);
      console.log('📤 Final stdout:', result);
      console.log('❌ Final stderr:', error);
      
      if (code === 0) {
        try {
          const prediction = JSON.parse(result);
          console.log('✅ Parsed prediction:', prediction);
        } catch (parseError) {
          console.log('❌ Failed to parse output:', parseError.message);
        }
      } else {
        console.log('❌ Python process failed');
      }
      
      // Clean up
      try {
        fs.unlinkSync(testImagePath);
        console.log('✅ Cleaned up test image');
      } catch (cleanupError) {
        console.log('⚠️  Could not clean up test image:', cleanupError.message);
      }
    });
    
  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugNodePython();
