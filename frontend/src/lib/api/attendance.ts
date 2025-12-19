/**
 * Attendance API Service
 * Handles attendance tracking endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  AttendanceRecord,
  CheckInRequest,
  CheckOutRequest,
  BulkSyncRequest,
  BulkSyncResponse,
  CorrectAttendanceRequest,
  AttendanceCode,
  GenerateCodeRequest,
  ValidateCodeRequest,
  GetAttendanceParams,
} from '@/types/api';

export const attendanceApi = {
  /**
   * POST /api/attendance/check-in
   * Check in member
   */
  checkIn: async (data: CheckInRequest): Promise<ApiResponse<AttendanceRecord>> => {
    return api.post('/attendance/check-in', data);
  },

  /**
   * POST /api/attendance/check-out
   * Check out member
   */
  checkOut: async (data: CheckOutRequest): Promise<ApiResponse<AttendanceRecord>> => {
    return api.post('/attendance/check-out', data);
  },

  /**
   * POST /api/attendance/verify
   * Verify attendance record
   */
  verify: async (attendanceId: string): Promise<ApiResponse<AttendanceRecord>> => {
    return api.post('/attendance/verify', { attendanceId });
  },

  /**
   * POST /api/attendance/bulk-sync
   * Bulk sync attendance records (offline queue)
   */
  bulkSync: async (data: BulkSyncRequest): Promise<ApiResponse<BulkSyncResponse>> => {
    return api.post('/attendance/bulk-sync', data);
  },

  /**
   * GET /api/attendance/event/:eventId
   * Get event attendance records
   */
  getByEvent: async (eventId: string, params?: GetAttendanceParams): Promise<ApiResponse<PaginatedResponse<AttendanceRecord>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.centerId) queryParams.append('centerId', params.centerId);
    if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());

    const query = queryParams.toString();
    return api.get(`/attendance/event/${eventId}${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/attendance/event/:eventId/center/:centerId
   * Get center attendance records
   */
  getByCenter: async (
    eventId: string,
    centerId: string,
    params?: GetAttendanceParams
  ): Promise<ApiResponse<PaginatedResponse<AttendanceRecord>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.participationMode) queryParams.append('participationMode', params.participationMode);

    const query = queryParams.toString();
    return api.get(`/attendance/event/${eventId}/center/${centerId}${query ? `?${query}` : ''}`);
  },

  /**
   * POST /api/attendance/:recordId/correct
   * Correct attendance record
   */
  correct: async (recordId: string, data: CorrectAttendanceRequest): Promise<ApiResponse<AttendanceRecord>> => {
    return api.post(`/attendance/${recordId}/correct`, data);
  },

  /**
   * GET /api/attendance/member/:memberId
   * Get member attendance records
   */
  getByMember: async (memberId: string, params?: GetAttendanceParams): Promise<ApiResponse<PaginatedResponse<AttendanceRecord>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    const query = queryParams.toString();
    return api.get(`/attendance/member/${memberId}${query ? `?${query}` : ''}`);
  },

  /**
   * POST /api/attendance/code/generate
   * Generate attendance code (QR/SAC)
   */
  generateCode: async (data: GenerateCodeRequest): Promise<ApiResponse<AttendanceCode>> => {
    return api.post('/attendance/code/generate', data);
  },

  /**
   * POST /api/attendance/code/validate
   * Validate attendance code
   */
  validateCode: async (data: ValidateCodeRequest): Promise<ApiResponse<AttendanceCode>> => {
    return api.post('/attendance/code/validate', data);
  },
};
