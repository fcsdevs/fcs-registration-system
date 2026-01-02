/**
 * Authentication Context
 * Manages user authentication state and JWT tokens
 */

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<{ email: string } | void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (emailOrCode: string) => Promise<void>;
  resetPassword: (emailOrCode: string, otp: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const response = await api.get<any>("/auth/me");
          const authData = response.data || response;

          const userData: User = {
            id: authData.id,
            email: authData.email || '',
            firstName: authData.member?.firstName || '',
            lastName: authData.member?.lastName || '',
            phone: authData.phoneNumber,
            gender: authData.member?.gender,
            roles: authData.roles || [],
            unitId: authData.unit?.id || authData.unitId || '',
            unitName: authData.unit?.name || '',
            level: authData.unit?.level || authData.level,
            memberCode: authData.member?.fcsCode || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setUser(userData);
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
      const userData: User = {
        id: authData.id,
        email: authData.email || '',
        firstName: authData.member?.firstName || '',
        lastName: authData.member?.lastName || '',
        phone: authData.phoneNumber,
        gender: authData.member?.gender,
        roles: authData.roles || [],
        unitId: authData.unit?.id || authData.unitId || '',
        unitName: authData.unit?.name || '',
        level: authData.unit?.level || authData.level,
        memberCode: authData.member?.fcsCode || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(userData);

      // Redirect based on role
      const isAdmin = userData.roles.some((r: string) => r.toLowerCase().includes('admin') || r.toLowerCase() === 'leader');

      if (isAdmin) {
        router.push('/home');
      } else {
        router.push('/dashboard');
      }
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

  const forgotPassword = async (emailOrCode: string) => {
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { identifier: emailOrCode });
    } catch (error: any) {
      throw new Error(error.message || "Failed to send reset instructions");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (emailOrCode: string, otp: string, password: string) => {
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        identifier: emailOrCode,
        otp,
        password
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
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
        forgotPassword,
        resetPassword,
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
