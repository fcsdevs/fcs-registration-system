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
  signup: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (emailOrCode: string) => Promise<void>;
  resetPassword: (emailOrCode: string, otp: string, password: string) => Promise<void>;
  sendOTP: (emailOrPhone: string, purpose?: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  searchRecoveryAccounts: (params: { fcsCode?: string; fullName?: string }) => Promise<any[]>;
  verifyRecoveryDob: (memberId: string, dob: string) => Promise<string>;
  resetPasswordByToken: (token: string, password: string) => Promise<void>;
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
            otherNames: authData.member?.otherNames || '',
            preferredName: authData.member?.preferredName || '',
            phone: authData.phoneNumber,
            whatsappNumber: authData.member?.whatsappNumber || '',
            gender: authData.member?.gender,
            maritalStatus: authData.member?.maritalStatus,
            dateOfBirth: authData.member?.dateOfBirth,
            occupation: authData.member?.occupation || '',
            department: authData.member?.department || '',
            placeOfWork: authData.member?.placeOfWork || '',
            institutionName: authData.member?.institutionName || '',
            institutionType: authData.member?.institutionType,
            level: authData.member?.level || '',
            course: authData.member?.course || '',
            graduationYear: authData.member?.graduationYear,
            yearJoined: authData.member?.yearJoined,
            membershipCategory: authData.member?.membershipCategory,
            state: authData.member?.state || '',
            zone: authData.member?.zone || '',
            branch: authData.member?.branch || '',
            branchId: authData.member?.branchId || '',
            preferredContactMethod: authData.member?.preferredContactMethod,
            emergencyContactName: authData.member?.emergencyContactName || '',
            emergencyContactPhone: authData.member?.emergencyContactPhone || '',
            ageBracket: authData.member?.ageBracket || '',
            guardianName: authData.member?.guardianName || '',
            guardianPhone: authData.member?.guardianPhone || '',
            guardianEmail: authData.member?.guardianEmail || '',
            guardianRelationship: authData.member?.guardianRelationship || '',
            profilePhotoUrl: authData.member?.profilePhotoUrl || '',
            roles: authData.roles || [],
            unitId: authData.unit?.id || authData.unitId || '',
            unitName: authData.unit?.name || '',
            memberCode: authData.member?.fcsCode || '',
            centers: authData.centers || [],
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
        identifier: email,
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
        otherNames: authData.member?.otherNames || '',
        preferredName: authData.member?.preferredName || '',
        phone: authData.phoneNumber,
        whatsappNumber: authData.member?.whatsappNumber || '',
        gender: authData.member?.gender,
        maritalStatus: authData.member?.maritalStatus,
        dateOfBirth: authData.member?.dateOfBirth,
        occupation: authData.member?.occupation || '',
        department: authData.member?.department || '',
        placeOfWork: authData.member?.placeOfWork || '',
        institutionName: authData.member?.institutionName || '',
        institutionType: authData.member?.institutionType,
        level: authData.member?.level || '',
        course: authData.member?.course || '',
        graduationYear: authData.member?.graduationYear,
        yearJoined: authData.member?.yearJoined,
        membershipCategory: authData.member?.membershipCategory,
        state: authData.member?.state || '',
        zone: authData.member?.zone || '',
        branch: authData.member?.branch || '',
        branchId: authData.member?.branchId || '',
        preferredContactMethod: authData.member?.preferredContactMethod,
        emergencyContactName: authData.member?.emergencyContactName || '',
        emergencyContactPhone: authData.member?.emergencyContactPhone || '',
        ageBracket: authData.member?.ageBracket || '',
        guardianName: authData.member?.guardianName || '',
        guardianPhone: authData.member?.guardianPhone || '',
        guardianEmail: authData.member?.guardianEmail || '',
        guardianRelationship: authData.member?.guardianRelationship || '',
        profilePhotoUrl: authData.member?.profilePhotoUrl || '',
        roles: authData.roles || [],
        unitId: authData.unit?.id || authData.unitId || '',
        unitName: authData.unit?.name || '',
        memberCode: authData.member?.fcsCode || '',
        centers: authData.centers || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(userData);

      // Redirect based on role
      // Include registrars as they need admin-level access to see all events
      const isAdmin = userData.roles.some((r: string) => r.toLowerCase().includes('admin') || r.toLowerCase() === 'leader');

      if (isAdmin) {
        router.replace('/home');
      } else {
        router.replace('/dashboard');
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
      // Transform phone number to international format (234...) if provided
      let phoneNumber = null;
      if (data.phone) {
        phoneNumber = data.phone.replace(/\s/g, ''); // Remove spaces
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '234' + phoneNumber.substring(1); // Replace leading 0 with 234
        } else if (!phoneNumber.startsWith('234') && !phoneNumber.startsWith('+234')) {
          phoneNumber = '234' + phoneNumber; // Add 234 prefix
        }
        phoneNumber = phoneNumber.replace(/^\+/, ''); // Remove + if present
      }

      // Map frontend form fields to backend API fields
      const payload = {
        phoneNumber,
        email: data.email || null,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        otherNames: data.otherNames,
        preferredName: data.preferredName,
        whatsappNumber: data.whatsappNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation,
        department: data.department,
        placeOfWork: data.placeOfWork,
        institutionName: data.institutionName,
        institutionType: data.institutionType,
        level: data.level,
        course: data.course,
        graduationYear: data.graduationYear,
        membershipCategory: data.membershipCategory,
        yearJoined: data.yearJoined,
        state: data.state,
        zone: data.zone,
        branch: data.branch,
        branchId: data.branchId,
        preferredContactMethod: data.preferredContactMethod,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        ageBracket: data.ageBracket,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
        guardianRelationship: data.guardianRelationship,
        privacyPolicyAccepted: data.privacyPolicyAccepted,
        termsAccepted: data.termsAccepted,
      };

      const response = await api.post<any>("/auth/register", payload);
      const authData = response.data || response;

      // Store tokens
      if (authData.token) {
        localStorage.setItem("accessToken", authData.token);
        // If session id is available use it, otherwise fallback to token
        localStorage.setItem("refreshToken", authData.session?.id || authData.token);

        // Construct user data (new users might not have roles/units yet)
        const userData: User = {
          id: authData.id,
          email: authData.email || '',
          firstName: authData.member?.firstName || '',
          lastName: authData.member?.lastName || '',
          otherNames: authData.member?.otherNames || '',
          preferredName: authData.member?.preferredName || '',
          phone: authData.phoneNumber,
          whatsappNumber: authData.member?.whatsappNumber || '',
          gender: authData.member?.gender,
          maritalStatus: authData.member?.maritalStatus,
          dateOfBirth: authData.member?.dateOfBirth,
          occupation: authData.member?.occupation || '',
          placeOfWork: authData.member?.placeOfWork || '',
          institutionName: authData.member?.institutionName || '',
          institutionType: authData.member?.institutionType,
          level: authData.member?.level || '',
          course: authData.member?.course || '',
          graduationYear: authData.member?.graduationYear,
          yearJoined: authData.member?.yearJoined,
          membershipCategory: authData.member?.membershipCategory,
          state: authData.member?.state || '',
          zone: authData.member?.zone || '',
          branch: authData.member?.branch || '',
          branchId: authData.member?.branchId || '',
          preferredContactMethod: authData.member?.preferredContactMethod,
          emergencyContactName: authData.member?.emergencyContactName || '',
          emergencyContactPhone: authData.member?.emergencyContactPhone || '',
          ageBracket: authData.member?.ageBracket || '',
          guardianName: authData.member?.guardianName || '',
          guardianPhone: authData.member?.guardianPhone || '',
          guardianEmail: authData.member?.guardianEmail || '',
          guardianRelationship: authData.member?.guardianRelationship || '',
          profilePhotoUrl: authData.member?.profilePhotoUrl || '',
          roles: authData.roles || [],
          unitId: authData.unit?.id || authData.unitId || '',
          unitName: authData.unit?.name || '',
          memberCode: authData.member?.fcsCode || '',
          centers: authData.centers || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(userData);
      }

      // Return the whole response data for frontend to handle FCS code display & OTP redirection
      return authData;
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

  const forgotPassword = async (identifier: string) => {
    setIsLoading(true);
    try {
      // Identifier can be Email, Phone, or FCS Code
      // FCS Code usually starts with something like FCS- or 2026-
      // For now, let's pass it as the generic "identifier" to the backend
      // But we use the /forgot-password endpoint which resolves it to an OTP
      await api.post("/auth/forgot-password", { identifier });
    } catch (error: any) {
      throw new Error(error.message || "Failed to send reset instructions");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (identifier: string, otp: string, password: string) => {
    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const isPhone = /^(\+?234|0)\d{10}$/.test(identifier.replace(/\s/g, ''));

      const payload = {
        ...(isEmail ? { email: identifier } : isPhone ? { phoneNumber: identifier } : { identifier }),
        code: otp,
        newPassword: password,
        confirmPassword: password
      };

      await api.post("/auth/reset-password", payload);
    } catch (error: any) {
      throw new Error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (emailOrPhone: string, purpose: string = 'REGISTRATION') => {
    setIsLoading(true);
    try {
      const isEmail = emailOrPhone.includes('@');
      const payload = isEmail
        ? { email: emailOrPhone, purpose }
        : { phoneNumber: emailOrPhone, purpose };

      await api.post("/auth/send-otp", payload);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword: newPassword
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const searchRecoveryAccounts = async (params: { fcsCode?: string; fullName?: string }): Promise<any[]> => {
    setIsLoading(true);
    try {
      const response = await api.post<any>("/auth/recovery/search", params);
      return response.data || response;
    } catch (error: any) {
      throw new Error(error.message || "Failed to find accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyRecoveryDob = async (memberId: string, dob: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await api.post<any>("/auth/recovery/verify-dob", { memberId, dob });
      const data = response.data || response;
      return data.token;
    } catch (error: any) {
      throw new Error(error.message || "Failed to verify identity");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordByToken = async (token: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await api.post("/auth/recovery/reset-password", {
        token,
        newPassword: password
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
        sendOTP,
        changePassword,
        searchRecoveryAccounts,
        verifyRecoveryDob,
        resetPasswordByToken,
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
