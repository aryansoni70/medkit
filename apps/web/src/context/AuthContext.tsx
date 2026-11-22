'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setStoredToken } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CUSTOMER' | 'PHARMACY' | 'ADMIN';
  pharmacies?: any[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session immediately from localStorage on client-side mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('medkit_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore JSON parse error
    }

    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('medkit_user', JSON.stringify(res.data));
      } else {
        // Only clear if no valid token
        const token = localStorage.getItem('medkit_token');
        if (!token) {
          setUser(null);
          localStorage.removeItem('medkit_user');
        }
      }
    } catch {
      const token = localStorage.getItem('medkit_token');
      if (!token) {
        setUser(null);
        localStorage.removeItem('medkit_user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await api.auth.login(credentials);
    if (res.success && res.data?.user) {
      if (res.data.token) {
        setStoredToken(res.data.token);
      }
      setUser(res.data.user);
      localStorage.setItem('medkit_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (userData: any): Promise<User> => {
    const res = await api.auth.register(userData);
    if (res.success && res.data?.user) {
      if (res.data.token) {
        setStoredToken(res.data.token);
      }
      setUser(res.data.user);
      localStorage.setItem('medkit_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore logout network errors
    } finally {
      setStoredToken(null);
      localStorage.removeItem('medkit_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
