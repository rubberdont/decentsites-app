'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { getToken, setToken, removeToken } from '@/utils/auth';
import { showError, showSuccess } from '@/utils/toast';
import type { User, LoginRequest, RegisterRequest, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (data: LoginRequest) => Promise<void>;
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
      try {
        const storedToken = getToken();
        
        if (storedToken) {
          setTokenState(storedToken);
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data);
          } catch (error) {
            console.error('Error validating stored token:', error);
            // Only clear token if it's invalid (401), not on network errors
            if ((error as any).response?.status === 401) {
              removeToken();
              setTokenState(null);
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authAPI.login(data);
      const newToken = response.data.access_token;
      setToken(newToken);
      setTokenState(newToken);
      
      try {
        const userResponse = await authAPI.getCurrentUser();
        setUser(userResponse.data);
        showSuccess('Login successful!');
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
        throw error;
      }
    } catch (error: unknown) {
      console.error('Login error:', error);

      if ((error as any).response?.status === 401) {
        // Unauthorized: invalid credentials
        showError('Invalid credentials. Please check your username and password.');
      } else if (!(error as any).response) {
        // Network error
        showError('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        showError('Login failed. Please try again.');
      }

      throw error; // Re-throw for calling components
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  const register = async (data: RegisterRequest) => {
    try {
      await authAPI.register(data);
      // After successful registration, automatically login
      await login(data);
      showSuccess('Registration successful!');
    } catch (error: unknown) {
      console.error('Registration error:', error);

      if ((error as any).response?.status === 422) {
        // Validation errors
        const validationErrors = (error as any).response.data.detail;
        if (Array.isArray(validationErrors)) {
          const messages = validationErrors.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('; ');
          showError(`Validation errors: ${messages}`);
        } else {
          showError('Validation failed. Please check your input.');
        }
      } else if ((error as any).response?.status === 409) {
        // Conflict: username/email already exists
        showError('Username or email already exists. Please choose different credentials.');
      } else if (!(error as any).response) {
        // Network error
        showError('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        showError('Registration failed. Please try again.');
      }

      throw error; // Re-throw for calling components
    }
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
