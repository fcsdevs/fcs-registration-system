/**
 * Groups API Service
 * Handles event group management endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  EventGroup,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupMember,
  AssignMemberRequest,
  BulkAssignRequest,
  BulkAssignResponse,
  GroupStatistics,
  ListGroupsParams,
} from '@/types/api';

export const groupsApi = {
  /**
   * POST /api/groups
   * Create a new group
   */
  create: async (data: CreateGroupRequest): Promise<ApiResponse<EventGroup>> => {
    return api.post('/groups', data);
  },

  /**
   * GET /api/groups/event/:eventId
   * List event groups
   */
  listByEvent: async (eventId: string, params?: ListGroupsParams): Promise<ApiResponse<PaginatedResponse<EventGroup>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return api.get(`/groups/event/${eventId}${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/groups/:groupId
   * Get group by ID
   */
  getById: async (groupId: string): Promise<ApiResponse<EventGroup>> => {
    return api.get(`/groups/${groupId}`);
  },

  /**
   * PUT /api/groups/:groupId
   * Update group
   */
  update: async (groupId: string, data: UpdateGroupRequest): Promise<ApiResponse<EventGroup>> => {
    return api.put(`/groups/${groupId}`, data);
  },

  /**
   * GET /api/groups/:groupId/members
   * Get group members
   */
  getMembers: async (groupId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<GroupMember>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return api.get(`/groups/${groupId}/members${query ? `?${query}` : ''}`);
  },

  /**
   * POST /api/groups/:groupId/assign
   * Assign member to group
   */
  assignMember: async (groupId: string, data: AssignMemberRequest): Promise<ApiResponse<any>> => {
    return api.post(`/groups/${groupId}/assign`, data);
  },

  /**
   * DELETE /api/groups/:groupId/members/:memberId
   * Remove member from group
   */
  removeMember: async (groupId: string, memberId: string): Promise<ApiResponse<any>> => {
    return api.delete(`/groups/${groupId}/members/${memberId}`);
  },

  /**
   * POST /api/groups/bulk-assign
   * Bulk assign members to groups
   */
  bulkAssign: async (data: BulkAssignRequest): Promise<ApiResponse<BulkAssignResponse>> => {
    return api.post('/groups/bulk-assign', data);
  },

  /**
   * GET /api/groups/:groupId/statistics
   * Get group statistics
   */
  getStatistics: async (groupId: string): Promise<ApiResponse<GroupStatistics>> => {
    return api.get(`/groups/${groupId}/statistics`);
  },

  /**
   * DELETE /api/groups/:groupId
   * Deactivate group
   */
  deactivate: async (groupId: string): Promise<ApiResponse<EventGroup>> => {
    return api.delete(`/groups/${groupId}`);
  },
};
