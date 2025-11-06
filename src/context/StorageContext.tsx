import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

interface StorageContextType {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

// Global storage instance for non-React contexts (like api.ts)
let globalStorage: Record<string, string> = {};

export const getGlobalStorage = () => ({
  getItem: (key: string): string | null => globalStorage[key] || null,
  setItem: (key: string, value: string) => {
    globalStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete globalStorage[key];
  },
  clear: () => {
    globalStorage = {};
  },
});

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage on mount
  // Using lazy initialization to avoid issues during SSR or initial load
  const [storage, setStorage] = useState<Record<string, string>>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const initialStorage: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            if (value !== null) {
              initialStorage[key] = value;
            }
          }
        }
        globalStorage = initialStorage;
        return initialStorage;
      }
    } catch (error) {
      console.warn('Error initializing storage from localStorage:', error);
    }
    return {};
  });

  // Sync React state with global storage
  useEffect(() => {
    globalStorage = storage;
  }, [storage]);
  
  // Sync to localStorage when storage changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Object.keys(storage).forEach(key => {
        localStorage.setItem(key, storage[key]);
      });
    }
  }, [storage]);

  const getItem = useCallback((key: string): string | null => {
    return storage[key] || null;
  }, [storage]);

  const setItem = useCallback((key: string, value: string) => {
    setStorage((prev) => {
      const newStorage = { ...prev, [key]: value };
      globalStorage = newStorage;
      return newStorage;
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setStorage((prev) => {
      const newStorage = { ...prev };
      delete newStorage[key];
      globalStorage = newStorage;
      return newStorage;
    });
  }, []);

  const clear = useCallback(() => {
    setStorage({});
    globalStorage = {};
  }, []);

  const value = useMemo(() => ({
    getItem,
    setItem,
    removeItem,
    clear,
  }), [getItem, setItem, removeItem, clear]);

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};

