// Test both Financial Advisor and Farming Assistant
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

async function testFinancialAdvisor() {
  console.log('💰 Testing Financial Advisor (Dhan Sarthi)...\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/financial-advice/chat`, {
      message: "Tell me about government schemes for farmers",
      conversationHistory: []
    });
    
    console.log('✅ Financial Advisor Response:');
    console.log('📏 Response Length:', response.data.response.length);
    console.log('💬 Response:');
    console.log(response.data.response);
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Financial Advisor Error:', error.response?.data || error.message);
  }
}

async function testFarmingAssistant() {
  console.log('🌱 Testing Farming Assistant...\n');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai/chat`, {
      message: "What's the best time to plant tomatoes?",
      language: 'en',
      context: 'farming_assistant',
      conversationHistory: []
    });
    
    console.log('✅ Farming Assistant Response:');
    console.log('📏 Response Length:', response.data.response.length);
    console.log('💬 Response:');
    console.log(response.data.response);
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Farming Assistant Error:', error.response?.data || error.message);
  }
}

async function testEndpoints() {
  console.log('🧪 Testing Both Chatbots...\n');
  
  // Test if endpoints are accessible
  try {
    console.log('🔍 Testing Financial Advisor endpoint...');
    const financialTest = await axios.get(`${BASE_URL}/api/financial-advice/test`);
    console.log('✅ Financial Advisor endpoint working:', financialTest.data.message);
  } catch (error) {
    console.error('❌ Financial Advisor endpoint error:', error.response?.data || error.message);
  }
  
  try {
    console.log('🔍 Testing Farming Assistant endpoint...');
    const farmingTest = await axios.get(`${BASE_URL}/api/ai/test`);
    console.log('✅ Farming Assistant endpoint working:', farmingTest.data.message);
  } catch (error) {
    console.error('❌ Farming Assistant endpoint error:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Test actual chat functionality
  await testFinancialAdvisor();
  await testFarmingAssistant();
}

// Run the tests
testEndpoints().then(() => {
  console.log('\n✅ Both Chatbot Tests Complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test Failed:', error);
  process.exit(1);
});
