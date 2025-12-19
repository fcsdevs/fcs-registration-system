/**
 * Reports API Service
 * Handles reporting and analytics endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  DashboardData,
  EventAnalytics,
  CenterStatistics,
  MemberAttendanceReport,
  StateAnalytics,
  ExportParams,
} from '@/types/api';

export const reportsApi = {
  /**
   * GET /api/reports/dashboard
   * Get dashboard summary with key metrics
   */
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    return api.get('/reports/dashboard');
  },

  /**
   * GET /api/reports/events/:eventId/analytics
   * Get event analytics
   */
  getEventAnalytics: async (
    eventId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ApiResponse<EventAnalytics>> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return api.get(`/reports/events/${eventId}/analytics${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/reports/events/:eventId/export
   * Export event report
   */
  exportEventReport: async (eventId: string, params?: ExportParams): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.format) queryParams.append('format', params.format);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return api.get(`/reports/events/${eventId}/export${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/reports/centers/:centerId/analytics
   * Get center analytics
   */
  getCenterAnalytics: async (
    centerId: string,
    params?: { startDate?: string; endDate?: string }
  ): Promise<ApiResponse<CenterStatistics>> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return api.get(`/reports/centers/${centerId}/analytics${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/reports/members/:memberId/attendance
   * Get member attendance report
   */
  getMemberAttendanceReport: async (
    memberId: string,
    params?: { eventId?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<MemberAttendanceReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return api.get(`/reports/members/${memberId}/attendance${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/reports/states/analytics
   * Get state-wise analytics
   */
  getStateAnalytics: async (params?: {
    eventId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<StateAnalytics>> => {
    const queryParams = new URLSearchParams();
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return api.get(`/reports/states/analytics${query ? `?${query}` : ''}`);
  },
};
