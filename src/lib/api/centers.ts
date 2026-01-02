/**
 * Centers API Service
 * Handles event center management endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  EventCenter,
  CreateCenterRequest,
  UpdateCenterRequest,
  CenterStatistics,
  ListCentersParams,
  ListActiveCentersParams,
} from '@/types/api';

export const centersApi = {
  /**
   * POST /api/centers
   * Create a new center
   */
  create: async (data: CreateCenterRequest): Promise<ApiResponse<EventCenter>> => {
    return api.post('/centers', data);
  },

  /**
   * GET /api/centers/active
   * List active centers for registration
   */
  listActive: async (params: ListActiveCentersParams): Promise<ApiResponse<EventCenter[]>> => {
    const queryParams = new URLSearchParams({ eventId: params.eventId });
    if (params.state) queryParams.append('state', params.state);
    return api.get(`/centers/active?${queryParams.toString()}`);
  },

  /**
   * GET /api/centers
   * List all centers with pagination and filters
   */
  list: async (params?: ListCentersParams): Promise<ApiResponse<PaginatedResponse<EventCenter>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return api.get(`/centers${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/centers/:id
   * Get center by ID
   */
  getById: async (id: string): Promise<ApiResponse<EventCenter>> => {
    return api.get(`/centers/${id}`);
  },

  /**
   * PUT /api/centers/:id
   * Update center
   */
  update: async (id: string, data: UpdateCenterRequest): Promise<ApiResponse<EventCenter>> => {
    return api.put(`/centers/${id}`, data);
  },

  /**
   * POST /api/centers/:id/admins
   * Add center admin
   */
  addAdmin: async (id: string, userId: string): Promise<ApiResponse<any>> => {
    return api.post(`/centers/${id}/admins`, { userId });
  },

  /**
   * DELETE /api/centers/:id/admins/:userId
   * Remove center admin
   */
  removeAdmin: async (id: string, userId: string): Promise<ApiResponse<any>> => {
    return api.delete(`/centers/${id}/admins/${userId}`);
  },

  /**
   * GET /api/centers/:id/statistics
   * Get center statistics
   */
  getStatistics: async (id: string): Promise<ApiResponse<CenterStatistics>> => {
    return api.get(`/centers/${id}/statistics`);
  },

  /**
   * DELETE /api/centers/:id
   * Deactivate center
   */
  deactivate: async (id: string): Promise<ApiResponse<EventCenter>> => {
    return api.delete(`/centers/${id}`);
  },
};
