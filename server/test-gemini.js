// Direct Gemini API Test
const gemini = require('./config/gemini');
const { getContextualPrompt, detectFarmingTopics, QUICK_RESPONSES, FARMING_SYSTEM_PROMPT } = require('./config/farmingPrompts');

async function testGeminiDirectly() {
  console.log('🧪 Testing Gemini API Directly...\n');
  
  const testQueries = [
    "government schemes",
    "best time to plant tomatoes", 
    "leaf spot disease treatment",
    "soil fertility improvement",
    "agricultural subsidies"
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Testing Query: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      // Detect topics
      const topics = detectFarmingTopics(query);
      console.log('🔍 Detected Topics:', topics);
      
      // Create prompt
      const prompt = getContextualPrompt(query, 'en', {
        topics: topics,
        season: 'spring',
        region: 'general'
      });
      
      console.log('📋 Prompt Length:', prompt.length);
      console.log('📋 Prompt Preview:', prompt.substring(0, 200) + '...');
      
      // Send to Gemini
      console.log('🚀 Sending to Gemini...');
      const startTime = Date.now();
      
      const response = await gemini(prompt);
      const endTime = Date.now();
      
      console.log('✅ Gemini Response:');
      console.log('⏱️  Response Time:', (endTime - startTime) + 'ms');
      console.log('📏 Response Length:', response.length);
      console.log('💬 Response:');
      console.log(response);
      console.log('\n' + '='.repeat(80));
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('🔧 Error Details:', error);
    }
  }
}

// Run the test
testGeminiDirectly().then(() => {
  console.log('\n✅ Gemini API Test Complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test Failed:', error);
  process.exit(1);
});
