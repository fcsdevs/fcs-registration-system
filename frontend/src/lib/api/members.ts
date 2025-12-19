/**
 * Members API Service
 * Handles member management endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Member,
  CreateMemberRequest,
  UpdateMemberRequest,
  AddGuardianRequest,
  MemberAttendanceSummary,
  ListMembersParams,
} from '@/types/api';

export const membersApi = {
  /**
   * POST /api/members
   * Create a new member
   */
  create: async (data: CreateMemberRequest): Promise<ApiResponse<Member>> => {
    return api.post('/members', data);
  },

  /**
   * GET /api/members
   * List all members with pagination and filters
   */
  list: async (params?: ListMembersParams): Promise<ApiResponse<PaginatedResponse<Member>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.state) queryParams.append('state', params.state);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return api.get(`/members${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/members/search
   * Search members by query
   */
  search: async (query: string, limit?: number): Promise<ApiResponse<Member[]>> => {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    return api.get(`/members/search?${params.toString()}`);
  },

  /**
   * GET /api/members/:id
   * Get member by ID
   */
  getById: async (id: string): Promise<ApiResponse<Member>> => {
    return api.get(`/members/${id}`);
  },

  /**
   * GET /api/members/code/:code
   * Get member by FCS code
   */
  getByCode: async (code: string): Promise<ApiResponse<Member>> => {
    return api.get(`/members/code/${code}`);
  },

  /**
   * PUT /api/members/:id
   * Update member
   */
  update: async (id: string, data: UpdateMemberRequest): Promise<ApiResponse<Member>> => {
    return api.put(`/members/${id}`, data);
  },

  /**
   * GET /api/members/:id/attendance-summary
   * Get member attendance summary
   */
  getAttendanceSummary: async (id: string): Promise<ApiResponse<MemberAttendanceSummary>> => {
    return api.get(`/members/${id}/attendance-summary`);
  },

  /**
   * POST /api/members/:id/guardians
   * Add guardian to member
   */
  addGuardian: async (id: string, data: AddGuardianRequest): Promise<ApiResponse<any>> => {
    return api.post(`/members/${id}/guardians`, data);
  },

  /**
   * DELETE /api/members/:id/guardians/:guardianId
   * Remove guardian from member
   */
  removeGuardian: async (id: string, guardianId: string): Promise<ApiResponse<any>> => {
    return api.delete(`/members/${id}/guardians/${guardianId}`);
  },

  /**
   * DELETE /api/members/:id
   * Deactivate member
   */
  deactivate: async (id: string): Promise<ApiResponse<Member>> => {
    return api.delete(`/members/${id}`);
  },
};
