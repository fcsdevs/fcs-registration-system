/**
 * Registrations API Service
 * Handles event registration endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Registration,
  CreateRegistrationRequest,
  UpdateRegistrationStatusRequest,
  AssignCenterRequest,
  AssignGroupRequest,
  ListRegistrationsParams,
} from '@/types/api';

export const registrationsApi = {
  /**
   * POST /api/registrations
   * Create a new registration
   */
  create: async (data: CreateRegistrationRequest): Promise<ApiResponse<Registration>> => {
    return api.post('/registrations', data);
  },

  /**
   * GET /api/registrations
   * List all registrations with pagination and filters
   */
  list: async (params?: ListRegistrationsParams): Promise<ApiResponse<PaginatedResponse<Registration>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.memberId) queryParams.append('memberId', params.memberId);
    if (params?.centerId) queryParams.append('centerId', params.centerId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return api.get(`/registrations${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/registrations/:id
   * Get registration by ID
   */
  getById: async (id: string): Promise<ApiResponse<Registration>> => {
    return api.get(`/registrations/${id}`);
  },

  /**
   * PUT /api/registrations/:id/status
   * Update registration status
   */
  updateStatus: async (id: string, data: UpdateRegistrationStatusRequest): Promise<ApiResponse<Registration>> => {
    return api.put(`/registrations/${id}/status`, data);
  },

  /**
   * POST /api/registrations/:id/assign-center
   * Assign center to registration
   */
  assignCenter: async (id: string, data: AssignCenterRequest): Promise<ApiResponse<Registration>> => {
    return api.post(`/registrations/${id}/assign-center`, data);
  },

  /**
   * POST /api/registrations/:id/assign-group
   * Assign group to registration
   */
  assignGroup: async (id: string, data: AssignGroupRequest): Promise<ApiResponse<Registration>> => {
    return api.post(`/registrations/${id}/assign-group`, data);
  },

  /**
   * DELETE /api/registrations/:id
   * Cancel registration
   */
  cancel: async (id: string): Promise<ApiResponse<any>> => {
    return api.delete(`/registrations/${id}`);
  },

  /**
   * GET /api/registrations/event/:eventId
   * Get event registrations
   */
  getByEvent: async (eventId: string, params?: ListRegistrationsParams): Promise<ApiResponse<PaginatedResponse<Registration>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.centerId) queryParams.append('centerId', params.centerId);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return api.get(`/registrations/event/${eventId}${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/registrations/member/:memberId
   * Get member registrations
   */
  getByMember: async (memberId: string, params?: ListRegistrationsParams): Promise<ApiResponse<PaginatedResponse<Registration>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return api.get(`/registrations/member/${memberId}${query ? `?${query}` : ''}`);
  },
  /**
   * GET /api/registrations/stats
   * Get registrar statistics
   */
  getStats: async (params: { eventId: string; centerId?: string }): Promise<ApiResponse<any>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('eventId', params.eventId);
    if (params.centerId) queryParams.append('centerId', params.centerId);

    const query = queryParams.toString();
    return api.get(`/registrations/stats?${query}`);
  },
};
