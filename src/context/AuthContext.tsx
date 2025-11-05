import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useStorage } from './StorageContext';

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  height?: number;
  weight?: number;
  gender?: string;
  lifestyle?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, age: number, email: string, password: string, gender?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const storage = useStorage();

  useEffect(() => {
    const storedUser = storage.getItem('user');
    const token = storage.getItem('token');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token by fetching profile
        authAPI.getProfile().catch(() => {
          // Token invalid, clear storage
          storage.removeItem('user');
          storage.removeItem('token');
          setUser(null);
        });
      } catch (error) {
        storage.removeItem('user');
        storage.removeItem('token');
      }
    }
  }, [storage]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.user && response.token) {
        setUser(response.user);
        storage.setItem('user', JSON.stringify(response.user));
        storage.setItem('token', response.token);
        return { success: true };
      }
      return { 
        success: false, 
        error: response.message || 'Login failed. Please check your credentials.' 
      };
    } catch (error: any) {
      // Extract error message from different error types
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
        console.error('Network error - no response received:', error.request);
      } else {
        // Error in setting up the request
        errorMessage = error.message || 'An unexpected error occurred.';
        console.error('Login error:', error.message);
      }
      
      // Log full error for debugging (persistent)
      console.error('Login failed:', {
        message: errorMessage,
        error: error,
        timestamp: new Date().toISOString()
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, age: number, email: string, password: string, gender?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await authAPI.register(name, email, password, age, gender);
      if (response.success && response.user && response.token) {
        setUser(response.user);
        storage.setItem('user', JSON.stringify(response.user));
        storage.setItem('token', response.token);
        return { success: true };
      }
      return { success: false, message: response.message || 'Registration failed' };
    } catch (error: any) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    storage.removeItem('user');
    storage.removeItem('token');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      try {
        const response = await authAPI.updateProfile(updates);
        if (response.success && response.user) {
          setUser(response.user);
          storage.setItem('user', JSON.stringify(response.user));
        }
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
