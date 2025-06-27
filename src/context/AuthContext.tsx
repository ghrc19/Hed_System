import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextProps {
  currentUser: User | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 400));
    setCurrentUser({ uid: 'mock-uid', email });
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 200));
    setCurrentUser(null);
    setLoading(false);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};