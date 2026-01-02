/**
 * API Module - Centralized exports
 * Complete integration with FCS Registration Backend
 */

// Export API client
export { api, apiClient } from './client';

// Export all API services
export { authApi } from './auth';
export { membersApi } from './members';
export { eventsApi } from './events';
export { centersApi } from './centers';
export { registrationsApi } from './registrations';
export { attendanceApi } from './attendance';
export { groupsApi } from './groups';
export { unitsApi } from './units';
export { rolesApi } from './roles';
export { reportsApi } from './reports';
export { auditApi } from './audit';
export { notificationsApi } from './notifications';

// Export all types
export type * from '@/types/api';

// Import for unified API object
import { authApi } from './auth';
import { membersApi } from './members';
import { eventsApi } from './events';
import { centersApi } from './centers';
import { registrationsApi } from './registrations';
import { attendanceApi } from './attendance';
import { groupsApi } from './groups';
import { unitsApi } from './units';
import { rolesApi } from './roles';
import { reportsApi } from './reports';
import { auditApi } from './audit';
import { notificationsApi } from './notifications';

/**
 * Unified API object for convenient access
 */
export const fcsApi = {
  auth: authApi,
  members: membersApi,
  events: eventsApi,
  centers: centersApi,
  registrations: registrationsApi,
  attendance: attendanceApi,
  groups: groupsApi,
  units: unitsApi,
  roles: rolesApi,
  reports: reportsApi,
  audit: auditApi,
  notifications: notificationsApi,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://fcs-registration-backend.onrender.com/api',
  timeout: 30000,
  retries: 3,
} as const;

/**
 * API Error Codes
 */
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
