'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { getToken, setToken, removeToken } from '@/utils/auth';
import type { User, LoginRequest, RegisterRequest, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getToken();
      
      if (storedToken) {
        setTokenState(storedToken);
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          // Token is invalid, clear it
          removeToken();
          setTokenState(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
    
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user after login:', error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  const register = async (data: RegisterRequest) => {
    const response = await authAPI.register(data);
    // After successful registration, automatically login
    const loginResponse = await authAPI.login(data);
    await login(loginResponse.data.access_token);
  };

  // Role-based helper functions
  const isOwner = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    if (role === 'ADMIN') return user.role === 'ADMIN';
    if (role === 'OWNER') return user.role === 'OWNER' || user.role === 'ADMIN';
    return true; // USER role
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isOwner,
    isAdmin,
    hasRole,
    login,
    logout,
    register,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
