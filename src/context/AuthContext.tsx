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
  login: (email: string, password: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.user && response.token) {
        setUser(response.user);
        storage.setItem('user', JSON.stringify(response.user));
        storage.setItem('token', response.token);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
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
