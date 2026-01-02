/**
 * Units API Service
 * Handles organizational unit management endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Unit,
  CreateUnitRequest,
  UpdateUnitRequest,
  UnitHierarchy,
  UnitStatistics,
  ListUnitsParams,
  Member,
} from '@/types/api';

export const unitsApi = {
  /**
   * POST /api/units
   * Create a new unit
   */
  create: async (data: CreateUnitRequest): Promise<ApiResponse<Unit>> => {
    return api.post('/units', data);
  },

  /**
   * GET /api/units
   * List all units with pagination and filters
   */
  list: async (params?: ListUnitsParams): Promise<ApiResponse<PaginatedResponse<Unit>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.parentUnitId) queryParams.append('parentUnitId', params.parentUnitId);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return api.get(`/units${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/units/hierarchy
   * Get unit hierarchy
   */
  getHierarchy: async (rootUnitId?: string): Promise<ApiResponse<UnitHierarchy>> => {
    const params = rootUnitId ? `?rootUnitId=${rootUnitId}` : '';
    return api.get(`/units/hierarchy${params}`);
  },

  /**
   * GET /api/units/:unitId
   * Get unit by ID
   */
  getById: async (unitId: string): Promise<ApiResponse<Unit>> => {
    return api.get(`/units/${unitId}`);
  },

  /**
   * PUT /api/units/:unitId
   * Update unit
   */
  update: async (unitId: string, data: UpdateUnitRequest): Promise<ApiResponse<Unit>> => {
    return api.put(`/units/${unitId}`, data);
  },

  /**
   * GET /api/units/:unitId/children
   * Get child units
   */
  getChildren: async (unitId: string, recursive?: boolean): Promise<ApiResponse<Unit[]>> => {
    const params = recursive !== undefined ? `?recursive=${recursive}` : '';
    return api.get(`/units/${unitId}/children${params}`);
  },

  /**
   * GET /api/units/:unitId/members
   * Get unit members
   */
  getMembers: async (
    unitId: string,
    params?: { page?: number; limit?: number; search?: string; state?: string }
  ): Promise<ApiResponse<PaginatedResponse<Member>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.state) queryParams.append('state', params.state);

    const query = queryParams.toString();
    return api.get(`/units/${unitId}/members${query ? `?${query}` : ''}`);
  },

  /**
   * POST /api/units/:unitId/members/:memberId
   * Add member to unit
   */
  addMember: async (unitId: string, memberId: string): Promise<ApiResponse<any>> => {
    return api.post(`/units/${unitId}/members/${memberId}`);
  },

  /**
   * DELETE /api/units/:unitId/members/:memberId
   * Remove member from unit
   */
  removeMember: async (unitId: string, memberId: string): Promise<ApiResponse<any>> => {
    return api.delete(`/units/${unitId}/members/${memberId}`);
  },

  /**
   * GET /api/units/:unitId/statistics
   * Get unit statistics
   */
  getStatistics: async (unitId: string): Promise<ApiResponse<UnitStatistics>> => {
    return api.get(`/units/${unitId}/statistics`);
  },

  /**
   * DELETE /api/units/:unitId
   * Deactivate unit
   */
  deactivate: async (unitId: string): Promise<ApiResponse<Unit>> => {
    return api.delete(`/units/${unitId}`);
  },
};
