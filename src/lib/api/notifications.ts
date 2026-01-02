/**
 * Notifications API Service
 * Handles notification and messaging endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  NotificationTrigger,
  CreateTriggerRequest,
  UpdateTriggerRequest,
  SendNotificationRequest,
  SendBatchRequest,
  BatchNotificationResponse,
  NotificationHistory,
  GetNotificationHistoryParams,
} from '@/types/api';

export const notificationsApi = {
  /**
   * POST /api/notifications/triggers
   * Create notification trigger
   */
  createTrigger: async (data: CreateTriggerRequest): Promise<ApiResponse<NotificationTrigger>> => {
    return api.post('/notifications/triggers', data);
  },

  /**
   * GET /api/notifications/triggers/event/:eventId
   * List event triggers
   */
  listTriggers: async (
    eventId: string,
    params?: { triggerType?: string; deliveryMethod?: string }
  ): Promise<ApiResponse<NotificationTrigger[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.triggerType) queryParams.append('triggerType', params.triggerType);
    if (params?.deliveryMethod) queryParams.append('deliveryMethod', params.deliveryMethod);

    const query = queryParams.toString();
    return api.get(`/notifications/triggers/event/${eventId}${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/notifications/triggers/:triggerId
   * Get trigger by ID
   */
  getTrigger: async (triggerId: string): Promise<ApiResponse<NotificationTrigger>> => {
    return api.get(`/notifications/triggers/${triggerId}`);
  },

  /**
   * PUT /api/notifications/triggers/:triggerId
   * Update trigger
   */
  updateTrigger: async (triggerId: string, data: UpdateTriggerRequest): Promise<ApiResponse<NotificationTrigger>> => {
    return api.put(`/notifications/triggers/${triggerId}`, data);
  },

  /**
   * POST /api/notifications/send
   * Send single notification
   */
  send: async (data: SendNotificationRequest): Promise<ApiResponse<NotificationHistory>> => {
    return api.post('/notifications/send', data);
  },

  /**
   * POST /api/notifications/send-batch
   * Send batch notifications
   */
  sendBatch: async (data: SendBatchRequest): Promise<ApiResponse<BatchNotificationResponse>> => {
    return api.post('/notifications/send-batch', data);
  },

  /**
   * GET /api/notifications/history
   * Get notification history
   */
  getHistory: async (params?: GetNotificationHistoryParams): Promise<ApiResponse<PaginatedResponse<NotificationHistory>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.recipientId) queryParams.append('recipientId', params.recipientId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.triggerType) queryParams.append('triggerType', params.triggerType);

    const query = queryParams.toString();
    return api.get(`/notifications/history${query ? `?${query}` : ''}`);
  },

  /**
   * PUT /api/notifications/:notificationId/delivered
   * Mark notification as delivered
   */
  markDelivered: async (notificationId: string): Promise<ApiResponse<NotificationHistory>> => {
    return api.put(`/notifications/${notificationId}/delivered`);
  },

  /**
   * POST /api/notifications/trigger-registration/:registrationId
   * Trigger registration notifications
   */
  triggerRegistration: async (registrationId: string): Promise<ApiResponse<any>> => {
    return api.post(`/notifications/trigger-registration/${registrationId}`);
  },

  /**
   * POST /api/notifications/trigger-center-assignment/:registrationId
   * Trigger center assignment notifications
   */
  triggerCenterAssignment: async (registrationId: string): Promise<ApiResponse<any>> => {
    return api.post(`/notifications/trigger-center-assignment/${registrationId}`);
  },

  /**
   * POST /api/notifications/trigger-group-assignment/:registrationId
   * Trigger group assignment notifications
   */
  triggerGroupAssignment: async (registrationId: string): Promise<ApiResponse<any>> => {
    return api.post(`/notifications/trigger-group-assignment/${registrationId}`);
  },

  /**
   * POST /api/notifications/trigger-event-reminder/:eventId
   * Trigger event reminder notifications
   */
  triggerEventReminder: async (eventId: string): Promise<ApiResponse<{
    eventId: string;
    totalSent: number;
    totalFailed: number;
  }>> => {
    return api.post(`/notifications/trigger-event-reminder/${eventId}`);
  },
};
