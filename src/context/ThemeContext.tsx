import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStorage } from './StorageContext';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storage = useStorage();
  
  // Initialize theme from storage with lazy initialization
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = storage.getItem('darkMode');
    return stored === 'true';
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Update DOM when theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Only save to storage after initialization to avoid loops
    if (isInitialized) {
      storage.setItem('darkMode', isDarkMode.toString());
    } else {
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode]); // Only depend on isDarkMode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
