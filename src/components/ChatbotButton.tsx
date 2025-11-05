import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ChatbotButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render on the chatbot page itself
  if (location.pathname === "/chatbot") {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  return (
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
      <div className="relative flex flex-col items-end gap-2">
        <div className="relative mb-1 hidden md:block">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 shadow-lg whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-900 dark:text-white">HEALWELL</span>
          </div>
          <div className="absolute top-full right-4 -mt-1 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45"></div>
        </div>

        <Link
          to="/chatbot"
          onClick={handleClick}
          className="group relative flex items-center justify-center w-160 h-160 md:w-14 md:h-14 rounded-full border-2 shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer overflow-visible"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
            borderColor: '#22d3ee',
            boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(6, 182, 212, 0.3)',
          }}
          aria-label="Chat with AI Health Assistant"
        >
          <Bot 
            className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform relative z-50" 
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
        </Link>
      </div>
    </div>
  );
}
