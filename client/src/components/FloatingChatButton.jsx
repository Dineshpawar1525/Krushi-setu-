import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AIFarmingAssistant from './AIFarmingAssistant';

const FloatingChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
          aria-label="Open AI Farming Assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            AI
          </div>
        </button>
      )}

      {/* AI Farming Assistant */}
      <AIFarmingAssistant 
        isOpen={isChatOpen} 
        onToggle={toggleChat} 
      />
    </>
  );
};

export default FloatingChatButton;
