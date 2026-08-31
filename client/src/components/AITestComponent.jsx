import React, { useState } from 'react';
import { Bot, Send, CheckCircle, XCircle } from 'lucide-react';
import api from '../Authorisation/axiosConfig';

const AITestComponent = () => {
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAI = async () => {
    if (!testMessage.trim()) return;
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await api.post('/ai/chat', {
        message: testMessage,
        language: 'en',
        context: 'farming_assistant'
      });
      
      setTestResult({
        success: true,
        response: response.data.response,
        timestamp: response.data.timestamp
      });
    } catch (error) {
      console.error('AI Test Error:', error);
      setTestResult({
        success: false,
        error: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickTests = [
    "What's the best time to plant tomatoes?",
    "How do I treat leaf spot disease?",
    "What are the signs of nutrient deficiency?",
    "How to improve soil fertility naturally?"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <Bot className="w-8 h-8 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">AI Farming Assistant Test</h2>
      </div>
      
      <div className="space-y-4">
        {/* Test Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Message:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Ask the AI farming assistant..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={testAI}
              disabled={!testMessage.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Testing...' : 'Test'}</span>
            </button>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Tests:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickTests.map((test, index) => (
              <button
                key={index}
                onClick={() => setTestMessage(test)}
                className="text-left text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 transition-colors"
              >
                {test}
              </button>
            ))}
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-3">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                {testResult.success ? 'Test Successful' : 'Test Failed'}
              </h3>
            </div>
            
            {testResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">
                  Response received at: {new Date(testResult.timestamp).toLocaleString()}
                </div>
                <div className="text-gray-800 whitespace-pre-wrap">
                  {testResult.response}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">
                  <strong>Error:</strong> {testResult.error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Testing AI response...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITestComponent;
