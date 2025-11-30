'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';
import { getToken, setToken, removeToken } from '@/utils/auth';
import type { User, UserRole } from '@/types';

/**
 * Authentication context type definition
 */
interface AuthContextType {
  /** Current authenticated user or null if not authenticated */
  user: User | null;
  /** Whether authentication state is being determined */
  isLoading: boolean;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Login with username and password */
  login: (username: string, password: string) => Promise<void>;
  /** Logout and redirect to login page */
  logout: () => void;
  /** Refresh current user data from API */
  refreshUser: () => Promise<void>;
  /** Check if user has a specific role */
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Manages user authentication state and provides auth methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Fetch current user from API
   */
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      console.error('[Auth] Failed to fetch current user:', error);
      return null;
    }
  }, []);

  /**
   * Refresh user data from API
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, [fetchCurrentUser]);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const token = getToken();

      if (token) {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token is invalid, remove it
          removeToken();
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  /**
   * Login with username and password
   */
  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      setIsLoading(true);

      try {
        // Get token from API
        const tokenResponse = await authAPI.login({ username, password });
        setToken(tokenResponse.data.access_token);

        // Fetch user data
        const currentUser = await fetchCurrentUser();
        if (!currentUser) {
          throw new Error('Failed to fetch user after login');
        }

        setUser(currentUser);
      } catch (error) {
        // Clean up on error
        removeToken();
        setUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCurrentUser]
  );

  /**
   * Logout user and redirect to login page
   */
  const logout = useCallback((): void => {
    removeToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  /**
   * Check if user has a specific role or one of multiple roles
   */
  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
