
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotAPI } from '../services/api';
import { Bot, User, Send, X, Minimize2, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type Language = 'en' | 'hi';

const translations = {
  en: {
    greeting: (name?: string) => name 
      ? `Hello ${name}! 👋 Welcome to HEALWELL AI. I'm your AI Health Assistant and I'm here to help you with:
      
• Health-related questions and general wellness advice
• Dietary recommendations and nutrition tips
• Exercise and yoga suggestions
• Stress management and sleep improvement
• Symptom guidance (with appropriate medical disclaimers)

What would you like to ask me today?`
      : `Hello! 👋 Welcome to HEALWELL AI. I'm your AI Health Assistant and I'm here to help you with health-related questions, yoga recommendations, dietary advice, and more. 

Please note: You need to be logged in to use the chatbot. How can I assist you today?`,
    quickQuestions: [
      "How to relieve headache?",
      "Yoga for back pain",
      "Foods rich in Vitamin D",
      "Tips to boost immunity"
    ],
    placeholder: "Ask about health, diet, yoga...",
    quickQuestionsLabel: "Quick questions:",
    listening: "Listening...",
    voiceNotSupported: "Voice input is not supported in your browser",
    speechError: "Speech recognition error. Please try again.",
    couldNotStart: "Could not start voice input",
    loginRequired: "Please login to use the chatbot",
    connectionError: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
    failedResponse: "Failed to get AI response. Please try again."
  },
  hi: {
    greeting: (name?: string) => name
      ? `नमस्ते ${name}! 👋 HEALWELL AI में आपका स्वागत है। मैं आपका AI स्वास्थ्य सहायक हूं और मैं यहां आपकी सहायता के लिए हूं:
      
• स्वास्थ्य संबंधी प्रश्न और सामान्य कल्याण सलाह
• आहार सिफारिशें और पोषण युक्तियां
• व्यायाम और योग सुझाव
• तनाव प्रबंधन और नींद में सुधार
• लक्षण मार्गदर्शन (उपयुक्त चिकित्सकीय अस्वीकरण के साथ)

आज आप मुझसे क्या पूछना चाहेंगे?`
      : `नमस्ते! 👋 HEALWELL AI में आपका स्वागत है। मैं आपका AI स्वास्थ्य सहायक हूं और मैं स्वास्थ्य संबंधी प्रश्नों, योग सिफारिशों, आहार सलाह और बहुत कुछ के लिए यहां हूं।

कृपया ध्यान दें: चैटबॉट का उपयोग करने के लिए आपको लॉगिन करना होगा। मैं आज आपकी कैसे सहायता कर सकता हूं?`,
    quickQuestions: [
      "सिरदर्द से राहत कैसे पाएं?",
      "पीठ दर्द के लिए योग",
      "विटामिन डी से भरपूर खाद्य पदार्थ",
      "रोग प्रतिरोधक क्षमता बढ़ाने के टिप्स"
    ],
    placeholder: "स्वास्थ्य, आहार, योग के बारे में पूछें...",
    quickQuestionsLabel: "त्वरित प्रश्न:",
    listening: "सुन रहे हैं...",
    voiceNotSupported: "आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है",
    speechError: "भाषण मान्यता त्रुटि। कृपया पुनः प्रयास करें।",
    couldNotStart: "वॉइस इनपुट शुरू नहीं कर सका",
    loginRequired: "कृपया चैटबॉट का उपयोग करने के लिए लॉगिन करें",
    connectionError: "क्षमा करें, अभी मैं कनेक्ट होने में परेशानी हो रही है। कृपया कुछ समय बाद पुनः प्रयास करें।",
    failedResponse: "AI प्रतिक्रिया प्राप्त करने में विफल। कृपया पुनः प्रयास करें।"
  }
};

export default function FloatingChatbot() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize greeting message
  const getGreetingMessage = (lang: Language) => {
    const t = translations[lang];
    return t.greeting(user?.name);
  };

  const t = translations[language];

  // Initialize messages when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: getGreetingMessage(language),
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, user, language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update speech recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'hi-IN';
    }
  }, [language]);

  // Update greeting when language changes
  useEffect(() => {
    if (messages.length === 1 && isOpen) {
      setMessages([{
        id: '1',
        text: getGreetingMessage(language),
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize speech synthesis and recognition (only once on mount)
  useEffect(() => {
    // Check browser support
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      toast.info('Speech synthesis not supported in your browser');
    }

    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'hi-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(translations[language].speechError);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported in your browser');
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Function to handle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error(t.voiceNotSupported);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info(t.listening);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error(t.couldNotStart);
      }
    }
  };

  // Function to speak bot responses
  const speakText = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    utterance.lang = language === 'en' ? 'en-US' : 'hi-IN';

    // Speak
    synthRef.current.speak(utterance);
  };

  const toggleVoiceOutput = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (synthRef.current && !isVoiceEnabled) {
      synthRef.current.cancel();
    }
  };

  const handleToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!user) {
      toast.error(t.loginRequired);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatbotAPI.chat(messageText, user.id, language);
      
      if (response.success && response.message) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botResponse]);
        
        // Speak the bot response
        setTimeout(() => {
          speakText(response.message);
        }, 500);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error: any) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t.connectionError,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(t.failedResponse);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = t.quickQuestions;

  return (
    <>
      {/* Floating Chat Button */}
      <div
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[99999]"
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 99999,
          pointerEvents: "auto",
        }}
      >
        {!isOpen && (
          <div className="relative flex flex-col items-end gap-2">
            <div className="relative mb-1 hidden md:block">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap animate-fade-in-up">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">HEALWELL AI</span>
              </div>
              <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
            </div>

            <button
              onClick={handleToggle}
              className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border-2 shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer overflow-visible"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
                borderColor: '#22d3ee',
                boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(6, 182, 212, 0.3)',
              }}
              aria-label="Chat with AI Health Assistant"
            >
              <Bot 
                className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform relative z-50" 
                style={{ 
                  color: '#ffffff',
                  strokeWidth: 2.5,
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
                }}
                fill="none"
              />
              <span 
                className="absolute inset-0 rounded-full opacity-20 animate-ping pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #22d3ee 100%)',
                  zIndex: 1,
                }}
              />
            </button>
          </div>
        )}

        {/* Chat Window Overlay */}
        {isOpen && (
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 ${
              isMinimized 
                ? 'w-80 h-16' 
                : 'w-[500px] h-[600px]'
            }`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'slideUpFade 0.3s ease-out',
              maxWidth: '500px',
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-between cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">HEALWELL AI Assistant</div>
                  {!isMinimized && (
                    <div className="text-xs text-white/80 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Always here to help</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isMinimized && (
                  <div className="flex gap-1 mr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage('en');
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        language === 'en'
                          ? 'bg-white/30 font-semibold'
                          : 'hover:bg-white/20'
                      }`}
                    >
                      🇬🇧
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguage('hi');
                      }}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        language === 'hi'
                          ? 'bg-white/30 font-semibold'
                          : 'hover:bg-white/20'
                      }`}
                    >
                      🇮🇳
                    </button>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 animate-fade-in-up ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'bot'
                          ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        {message.sender === 'bot' ? (
                          <Bot className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.sender === 'bot'
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                        <p className={`text-xs mt-2 ${
                          message.sender === 'bot' ? 'text-gray-500 dark:text-gray-400' : 'text-white/70'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="px-4 pb-3 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">{t.quickQuestionsLabel}</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(question)}
                          className="px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={t.placeholder}
                      className="flex-1 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                    
                    <button
                      onClick={toggleVoiceInput}
                      disabled={isListening}
                      className={`p-3 rounded-lg transition-all ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } disabled:cursor-not-allowed`}
                      title="Voice input"
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="p-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Voice Output Toggle - below input */}
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={toggleVoiceOutput}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all ${
                        isVoiceEnabled
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                      title={isVoiceEnabled ? 'Disable voice output' : 'Enable voice output'}
                    >
                      {isVoiceEnabled ? (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>{language === 'en' ? 'Voice ON' : 'आवाज़ चालू'}</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>{language === 'en' ? 'Voice OFF' : 'आवाज़ बंद'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

