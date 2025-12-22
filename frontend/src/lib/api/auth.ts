/**
 * Auth API Service
 * Handles authentication and user management endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  SendOTPRequest,
  VerifyOTPRequest,
  CurrentUser,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types/api';

export const authApi = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<{ user: any; token: string }>> => {
    return api.post('/auth/register', data);
  },

  /**
   * POST /api/auth/check-existence
   * Check if user exists
   */
  checkExistence: async (data: { email?: string; phoneNumber?: string }): Promise<ApiResponse<{ exists: boolean; message: string; field?: string }>> => {
    return api.post('/auth/check-existence', data);
  },


  /**
   * POST /api/auth/login
   * Login user
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/login', data);
  },

  /**
   * POST /api/auth/send-otp
   * Send OTP to phone number
   */
  sendOTP: async (data: SendOTPRequest): Promise<ApiResponse<{ message: string; expiresIn: number }>> => {
    return api.post('/auth/send-otp', data);
  },

  /**
   * POST /api/auth/verify-otp
   * Verify OTP code
   */
  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse<{ verified: boolean; token?: string }>> => {
    return api.post('/auth/verify-otp', data);
  },

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return api.post('/auth/refresh');
  },

  /**
   * GET /api/auth/me
   * Get current user
   */
  getCurrentUser: async (): Promise<ApiResponse<CurrentUser>> => {
    return api.get('/auth/me');
  },

  /**
   * POST /api/auth/logout
   * Logout user
   */
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return api.post('/auth/logout');
  },

  /**
   * POST /api/auth/forgot-password
   * Request password reset OTP
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    return api.post('/auth/forgot-password', data);
  },

  /**
   * POST /api/auth/reset-password
   * Reset password with OTP
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> => {
    return api.post('/auth/reset-password', data);
  },
};
