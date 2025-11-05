import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Home, LayoutDashboard, Bell, Info, MessageSquare, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Trigger animation on component mount
    setIsAnimating(true);
    // Remove animation class after animation completes (1.5s)
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <span 
              className={`text-xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent tracking-tight group-hover:from-emerald-600 group-hover:via-teal-600 group-hover:to-cyan-600 transition-all duration-300 ${
                isAnimating ? 'animate-logo-reveal' : ''
              }`}
            >
              HEALWELL AI
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link 
                  to="/reminders" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Reminders</span>
                </Link>
                <Link 
                  to="/about" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">About</span>
                </Link>
                <Link 
                  to="/feedback" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Feedback</span>
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link 
                  to="/about" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span className="hidden sm:inline">About</span>
                </Link>
                <Link 
                  to="/feedback" 
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Feedback</span>
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
                </button>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white hover:shadow-lg transition-shadow text-sm font-medium"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
