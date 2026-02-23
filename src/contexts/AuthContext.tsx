'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SafeUser, LoginCredentials, RegisterData } from '@/types/models';

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Verify token is still valid via API
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: storedToken }),
          });

          if (response.ok) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setUser(data.user);
    setToken(data.token);

    // Persist to localStorage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  };

  const register = async (data: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    setUser(result.user);
    setToken(result.token);

    // Persist to localStorage
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
