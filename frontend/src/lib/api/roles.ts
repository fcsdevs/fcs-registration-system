/**
 * Roles API Service
 * Handles role and permission management endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleAssignment,
  AssignRoleRequest,
  UserPermissions,
  PermissionCheck,
  PermissionGroups,
  ListRolesParams,
} from '@/types/api';

export const rolesApi = {
  /**
   * POST /api/roles
   * Create a new role
   */
  create: async (data: CreateRoleRequest): Promise<ApiResponse<Role>> => {
    return api.post('/roles', data);
  },

  /**
   * GET /api/roles
   * List all roles with pagination and filters
   */
  list: async (params?: ListRolesParams): Promise<ApiResponse<PaginatedResponse<Role>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return api.get(`/roles${query ? `?${query}` : ''}`);
  },

  /**
   * POST /api/roles/init
   * Initialize predefined roles
   */
  initPredefined: async (): Promise<ApiResponse<Role[]>> => {
    return api.post('/roles/init');
  },

  /**
   * GET /api/roles/permissions/groups
   * Get permission groups
   */
  getPermissionGroups: async (): Promise<ApiResponse<PermissionGroups>> => {
    return api.get('/roles/permissions/groups');
  },

  /**
   * GET /api/roles/:roleId
   * Get role by ID
   */
  getById: async (roleId: string): Promise<ApiResponse<Role>> => {
    return api.get(`/roles/${roleId}`);
  },

  /**
   * PUT /api/roles/:roleId
   * Update role
   */
  update: async (roleId: string, data: UpdateRoleRequest): Promise<ApiResponse<Role>> => {
    return api.put(`/roles/${roleId}`, data);
  },

  /**
   * DELETE /api/roles/:roleId
   * Deactivate role
   */
  deactivate: async (roleId: string): Promise<ApiResponse<Role>> => {
    return api.delete(`/roles/${roleId}`);
  },

  /**
   * GET /api/roles/:roleId/users
   * Get role users
   */
  getRoleUsers: async (roleId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<RoleAssignment>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return api.get(`/roles/${roleId}/users${query ? `?${query}` : ''}`);
  },

  /**
   * POST /api/roles/:roleId/users/:userId
   * Assign role to user
   */
  assignRole: async (roleId: string, userId: string, data?: AssignRoleRequest): Promise<ApiResponse<RoleAssignment>> => {
    return api.post(`/roles/${roleId}/users/${userId}`, data);
  },

  /**
   * DELETE /api/roles/:roleId/users/:userId
   * Remove role from user
   */
  removeRole: async (roleId: string, userId: string): Promise<ApiResponse<any>> => {
    return api.delete(`/roles/${roleId}/users/${userId}`);
  },

  /**
   * GET /api/roles/users/:userId
   * Get user roles
   */
  getUserRoles: async (userId: string): Promise<ApiResponse<{ user: any; roles: RoleAssignment[] }>> => {
    return api.get(`/roles/users/${userId}`);
  },

  /**
   * GET /api/roles/users/:userId/permissions
   * Get user permissions
   */
  getUserPermissions: async (userId: string): Promise<ApiResponse<UserPermissions>> => {
    return api.get(`/roles/users/${userId}/permissions`);
  },

  /**
   * POST /api/roles/users/:userId/permissions/:permission/check
   * Check if user has permission
   */
  checkPermission: async (userId: string, permission: string): Promise<ApiResponse<PermissionCheck>> => {
    return api.post(`/roles/users/${userId}/permissions/${permission}/check`);
  },
};
