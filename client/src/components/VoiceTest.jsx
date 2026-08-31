import React, { useState, useEffect } from 'react';

const VoiceTest = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    console.log('VoiceTest: Checking browser support...');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('VoiceTest: Speech recognition is supported');
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        console.log('VoiceTest: Recognition started');
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        console.log('VoiceTest: Transcript:', interimTranscript);
        setTranscript(interimTranscript);
        
        if (finalTranscript) {
          console.log('VoiceTest: Final transcript:', finalTranscript);
          if (finalTranscript.toLowerCase().includes('agriconnect')) {
            alert('AgriConnect detected! Voice navigator would activate.');
          }
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('VoiceTest: Recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        console.log('VoiceTest: Recognition ended');
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.log('VoiceTest: Speech recognition not supported');
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <h3 className="font-semibold text-gray-800 mb-3">Voice Test</h3>
      
      <div className="space-y-3">
        <div className="text-sm">
          <strong>Support:</strong> {isSupported ? '✅ Supported' : '❌ Not Supported'}
        </div>
        
        <div className="text-sm">
          <strong>Status:</strong> {isListening ? '🎤 Listening' : '⏸️ Not Listening'}
        </div>
        
        {transcript && (
          <div className="bg-gray-50 rounded p-2">
            <strong>Transcript:</strong> {transcript}
          </div>
        )}
        
        <div className="flex space-x-2">
          <button
            onClick={startListening}
            disabled={!isSupported || isListening}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Start
          </button>
          <button
            onClick={stopListening}
            disabled={!isSupported || !isListening}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Stop
          </button>
        </div>
        
        <div className="text-xs text-gray-600">
          Try saying: "AgriConnect" to test activation
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;
