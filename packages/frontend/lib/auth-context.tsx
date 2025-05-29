// Authentication context for managing user login state
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userApi } from './api-client';
import { toast } from 'sonner';
import { 
  getAuthToken, 
  setAuthToken, 
  getUserFromStorage, 
  setUserInStorage, 
  clearAuthData,
  getAuthHeaders 
} from './auth-utils';

// Import the URL directly
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:4002';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check for existing session on mount and validate token with backend
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = getAuthToken();
        const storedUser = getUserFromStorage();
        
        if (storedToken && storedUser) {
          // Set from localStorage first for immediate UI update
          setToken(storedToken);
          try {
            setUser(storedUser);
            
            // Validate token with backend
            const response = await fetch(`${USER_SERVICE_URL}/user/profile`, {
              method: 'GET',
              headers: getAuthHeaders()
            });
            
            if (!response.ok) {
              // Token invalid - clear session
              throw new Error('Invalid token');
            }
            
            // Optional: Update user data from backend
            const userData = await response.json();
            if (userData.success) {
              setUser(userData.user);
            }
          } catch (e) {
            console.error('Auth validation failed:', e);
            // Clear invalid session
            clearAuthData();
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await userApi.login({ email, password });
      
      if (response.success && response.data && response.data.token) {
        // Store token
        const token = response.data.token;
        setToken(token);
        
        // Create standardized user object
        const userData = {
          ...response.data.user,
          // Ensure we have the correct field names from backend 
        };
        
        setUser(userData);
        
        // Store in localStorage using auth utilities
        setAuthToken(token);
        setUserInStorage(userData);
        
        toast.success('Login successful');
        return true;
      } else {
        toast.error('Login failed');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await userApi.signup(userData);
      
      if (response.success) {
        toast.success('Account created successfully! Please log in.');
        return true;
      } else {
        toast.error('Sign up failed');
        return false;
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Sign up failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthData(); // Uses auth utilities to clear all auth data
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
