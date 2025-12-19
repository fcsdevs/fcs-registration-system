/**
 * Authentication Context
 * Manages user authentication state and JWT tokens
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { api } from "@/lib/api/client";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<{ email: string } | void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const currentUser = await api.get<User>("/auth/me");
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post<any>("/auth/login", {
        email,
        password,
      });

      // Backend returns { data: { token, session, ... }, message }
      const authData = response.data || response;
      
      localStorage.setItem("accessToken", authData.token);
      localStorage.setItem("refreshToken", authData.session?.id || authData.token);
      
      // Map backend response to User type
      setUser({
        id: authData.id,
        email: authData.email || '',
        firstName: authData.member?.firstName || '',
        lastName: authData.member?.lastName || '',
        phone: authData.phoneNumber,
        roles: [],
        unitId: '',
        memberCode: authData.member?.fcsCode || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      // Re-throw with the actual error message from backend
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    try {
      // Check if phone exists
      if (!data.phone) {
        throw new Error('Phone number is required');
      }

      // Transform phone number to international format (234...)
      let phoneNumber = data.phone.replace(/\s/g, ''); // Remove spaces
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '234' + phoneNumber.substring(1); // Replace leading 0 with 234
      } else if (!phoneNumber.startsWith('234') && !phoneNumber.startsWith('+234')) {
        phoneNumber = '234' + phoneNumber; // Add 234 prefix
      }
      phoneNumber = phoneNumber.replace(/^\+/, ''); // Remove + if present

      // Map frontend form fields to backend API fields
      const payload = {
        phoneNumber,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      await api.post<any>("/auth/register", payload);

      // Return the email for prefilling login form
      return { email: data.email };
    } catch (error: any) {
      // Re-throw with the actual error message from backend
      throw new Error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const response = await api.post<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/refresh", {
        refreshToken,
      });

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
