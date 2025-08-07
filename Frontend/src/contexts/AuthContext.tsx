import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, AuthResponse, AuthContextType, CreateUserData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authService.login(email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const register = async (userData: CreateUserData): Promise<AuthResponse> => {
    const response = await authService.register(userData);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const googleLogin = () => {
    authService.googleLogin();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    const response = await authService.verifyEmail(token);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  const resendVerificationEmail = async (email: string) => {
    return await authService.resendVerificationEmail(email);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    googleLogin,
    logout,
    checkAuth,
    verifyEmail,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
