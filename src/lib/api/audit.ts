/**
 * Audit API Service
 * Handles audit logging and compliance endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  AuditLog,
  ComplianceReport,
  DataChangeHistory,
  GetAuditLogsParams,
  CleanupLogsRequest,
  ExportParams,
} from '@/types/api';

export const auditApi = {
  /**
   * GET /api/audit/entity/:entityType/:entityId
   * Get entity audit trail
   */
  getEntityAuditTrail: async (
    entityType: string,
    entityId: string,
    params?: GetAuditLogsParams
  ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.action) queryParams.append('action', params.action);

    const query = queryParams.toString();
    return api.get(`/audit/entity/${entityType}/${entityId}${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/audit/user/:userId
   * Get user audit trail
   */
  getUserAuditTrail: async (
    userId: string,
    params?: GetAuditLogsParams
  ): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.action) queryParams.append('action', params.action);

    const query = queryParams.toString();
    return api.get(`/audit/user/${userId}${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/audit/logs
   * List audit logs with filters
   */
  getLogs: async (params?: GetAuditLogsParams): Promise<ApiResponse<PaginatedResponse<AuditLog>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.action) queryParams.append('action', params.action);

    const query = queryParams.toString();
    return api.get(`/audit/logs${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/audit/compliance/report
   * Get compliance report
   */
  getComplianceReport: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ComplianceReport>> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return api.get(`/audit/compliance/report${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/audit/history/:entityType/:entityId
   * Get data change history
   */
  getDataChangeHistory: async (
    entityType: string,
    entityId: string,
    field?: string
  ): Promise<ApiResponse<DataChangeHistory>> => {
    const params = field ? `?field=${field}` : '';
    return api.get(`/audit/history/${entityType}/${entityId}${params}`);
  },

  /**
   * GET /api/audit/export
   * Export audit logs
   */
  exportLogs: async (params?: ExportParams & GetAuditLogsParams): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.format) queryParams.append('format', params.format);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.entityType) queryParams.append('entityType', params.entityType);
    if (params?.userId) queryParams.append('userId', params.userId);

    const query = queryParams.toString();
    return api.get(`/audit/export${query ? `?${query}` : ''}`);
  },

  /**
   * POST /api/audit/retention/cleanup
   * Cleanup old logs
   */
  cleanupOldLogs: async (data: CleanupLogsRequest): Promise<ApiResponse<{
    deleted: number;
    retentionDays: number;
    cutoffDate: string;
  }>> => {
    return api.post('/audit/retention/cleanup', data);
  },
};
