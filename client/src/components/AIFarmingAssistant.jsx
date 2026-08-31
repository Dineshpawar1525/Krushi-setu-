import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  Globe, 
  Clock,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  User,
  Loader2,
  Sparkles
} from 'lucide-react';
import api from '../Authorisation/axiosConfig';

const AIFarmingAssistant = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: "Hello! I'm your AI Farming Assistant. I can help you with crop management, disease diagnosis, weather advice, government schemes, and sustainable farming practices. What would you like to know today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' }
  ];

  const quickQuestions = [
    "Government schemes",
    "Planting advice", 
    "Disease treatment",
    "Soil health tips"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      console.log('Sending message to AI:', inputMessage);
      
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const response = await api.post('/ai/chat', {
        message: inputMessage,
        language: selectedLanguage,
        conversationHistory: conversationHistory
      });

      console.log('AI Response received:', response.data);
      
      const botResponse = {
        id: Date.now() + 1,
        role: 'bot',
        content: response.data.response || response.data.message || 'I received your message but couldn\'t generate a response.',
        timestamp: response.data.timestamp || new Date().toISOString()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      let errorMessage = 'I apologize, but I\'m having trouble connecting to my AI services right now. Please try again in a moment.';
      
      if (error.response?.status === 500) {
        errorMessage = error.response.data?.response || 'The AI service is temporarily unavailable. Please try again later.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please provide a valid question. Try asking about farming, crops, or agriculture.';
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Please check your internet connection and try again.';
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        role: 'bot',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'bot',
        content: "Hello! I'm your AI Farming Assistant. I can help you with crop management, disease diagnosis, weather advice, government schemes, and sustainable farming practices. What would you like to know today?",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-green-200 transition-all duration-300 w-96 h-[600px] flex flex-col overflow-hidden relative group backdrop-blur-sm">
        {/* Enhanced animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 opacity-60 group-hover:opacity-80 transition-all duration-700"></div>
        
        {/* Animated geometric shapes background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating circles */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full animate-pulse opacity-70 blur-sm"></div>
          <div className="absolute top-12 right-8 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-50"></div>
          <div className="absolute bottom-20 left-12 w-2.5 h-2.5 bg-green-200 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-1/3 right-4 w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 left-6 w-1 h-1 bg-emerald-300 rounded-full animate-ping opacity-30" style={{animationDelay: '2s'}}></div>
          
          {/* Animated lines */}
          <div className="absolute top-1/4 left-0 w-16 h-0.5 bg-gradient-to-r from-transparent via-green-200 to-transparent animate-pulse opacity-30"></div>
          <div className="absolute bottom-1/4 right-0 w-12 h-0.5 bg-gradient-to-l from-transparent via-emerald-200 to-transparent animate-pulse opacity-30" style={{animationDelay: '1.5s'}}></div>
          
          {/* Glowing orbs */}
          <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-green-300 rounded-full animate-pulse opacity-20 blur-md"></div>
          <div className="absolute bottom-1/2 right-1/4 w-3 h-3 bg-emerald-300 rounded-full animate-pulse opacity-25 blur-md" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>

        {/* Enhanced Chat Header */}
        <div className="p-4 border-b bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white relative z-10 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 transition-all duration-500 shadow-lg rounded-t-2xl">
          {/* Header background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse rounded-t-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-t-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl">
                <Bot className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-lg font-bold flex items-center drop-shadow-sm">
                  AI Farming Assistant
                  <Sparkles className="w-4 h-4 ml-2 text-yellow-300 animate-pulse drop-shadow-sm" />
                </h1>
                <p className="text-green-100 text-sm font-medium drop-shadow-sm flex items-center">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                  Online now
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gradient-to-b from-gray-50 to-white relative z-10 h-80">
          <style>
            {`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .animate-fade-in {
                animation: fadeIn 0.5s ease-in-out;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .message-hover {
                transition: all 0.3s ease;
              }
              .message-hover:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
              }
              .typing-dots {
                display: inline-block;
              }
              .typing-dots::after {
                content: '';
                animation: typing 1.5s infinite;
              }
              @keyframes typing {
                0%, 20% { content: ''; }
                40% { content: '.'; }
                60% { content: '..'; }
                80%, 100% { content: '...'; }
              }
            `}
          </style>
          
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-3 animate-fade-in message-hover ${
              message.role === 'user' ? 'justify-end' : ''
            }`}>
              {message.role === 'bot' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[85%] p-4 rounded-lg shadow-lg border transition-all duration-300 backdrop-blur-sm ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white rounded-tr-none hover:from-green-600 hover:via-emerald-600 hover:to-green-700 hover:shadow-xl hover:scale-[1.02]' 
                  : 'bg-white/90 border-green-100 rounded-tl-none hover:border-green-200 hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm'
              }`}>
                <p className={`text-base font-medium ${
                  message.role === 'user' ? 'text-white' : 'text-gray-800'
                }`}>
                  {message.content}
                </p>
                <p className={`text-sm mt-2 ${
                  message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
              
              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Enhanced Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                  <p className="text-base text-gray-600">
                    AI Farming Assistant is typing<span className="typing-dots"></span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions - Above Input */}
        {messages.length <= 1 && (
          <div className="border-t border-green-200 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 relative z-10 backdrop-blur-sm">
            <p className="text-sm font-medium text-gray-700 mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickQuestion(suggestion)}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-white/90 border border-green-300 rounded-full hover:bg-green-50 hover:border-green-400 hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm shadow-md"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - At Very Bottom */}
        <div className="border-t border-green-200 p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 relative z-10 backdrop-blur-sm rounded-b-2xl">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
            <div className="flex-1 relative group">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your crops..."
                disabled={isLoading}
                className="w-full p-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 disabled:opacity-50 transition-all duration-300 group-hover:border-green-400 bg-white/90 backdrop-blur-sm shadow-md"
              />
              {/* Input focus effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-focus-within:opacity-15 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            <button
              onClick={clearChat}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFarmingAssistant;
