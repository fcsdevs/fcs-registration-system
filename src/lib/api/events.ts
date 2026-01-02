/**
 * Events API Service
 * Handles event management endpoints
 */

import { api } from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  UpdateEventSettingsRequest,
  EventStatistics,
  ListEventsParams,
} from '@/types/api';

export const eventsApi = {
  /**
   * POST /api/events
   * Create a new event
   */
  create: async (data: CreateEventRequest): Promise<ApiResponse<Event>> => {
    return api.post('/events', data);
  },

  /**
   * GET /api/events
   * List all events with pagination and filters
   */
  list: async (params?: ListEventsParams): Promise<ApiResponse<PaginatedResponse<Event>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.unitId) queryParams.append('unitId', params.unitId);
    if (params?.participationMode) queryParams.append('participationMode', params.participationMode);
    if (params?.isPublished !== undefined) queryParams.append('isPublished', params.isPublished.toString());

    const query = queryParams.toString();
    return api.get(`/events${query ? `?${query}` : ''}`);
  },

  /**
   * GET /api/events/:id
   * Get event by ID
   */
  getById: async (id: string): Promise<ApiResponse<Event>> => {
    return api.get(`/events/${id}`);
  },

  /**
   * PUT /api/events/:id
   * Update event
   */
  update: async (id: string, data: UpdateEventRequest): Promise<ApiResponse<Event>> => {
    return api.put(`/events/${id}`, data);
  },

  /**
   * POST /api/events/:id/publish
   * Publish event
   */
  publish: async (id: string): Promise<ApiResponse<Event>> => {
    return api.post(`/events/${id}/publish`);
  },

  /**
   * GET /api/events/:id/statistics
   * Get event statistics
   */
  getStatistics: async (id: string): Promise<ApiResponse<EventStatistics>> => {
    return api.get(`/events/${id}/statistics`);
  },

  /**
   * PUT /api/events/:id/settings
   * Update event settings
   */
  updateSettings: async (id: string, data: UpdateEventSettingsRequest): Promise<ApiResponse<any>> => {
    return api.put(`/events/${id}/settings`, data);
  },
};
