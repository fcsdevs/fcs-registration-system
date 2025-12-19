/**
 * API Client Configuration
 * Handles all communication with the backend API
 */

import { ApiResponse, PaginatedResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api";

export interface ApiClientConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = API_BASE_URL;
    this.config = {
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      headers: config.headers || {},
    };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };

    // Add JWT token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout
        );

        const response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response body for both success and error cases
        const contentType = response.headers.get("content-type");
        let responseData: any;
        
        if (contentType?.includes("application/json")) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }

        if (!response.ok) {
          // Handle unauthorized - clear tokens and redirect
          if (response.status === 401) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/auth/login";
            }
          }

          // Extract error message from backend response
          const errorMessage = 
            responseData?.error?.message || 
            responseData?.message || 
            `HTTP ${response.status}: ${response.statusText}`;
          
          const error: any = new Error(errorMessage);
          error.status = response.status;
          error.code = responseData?.error?.code || 'UNKNOWN_ERROR';
          error.response = responseData;
          
          throw error;
        }

        return responseData;
      } catch (error: any) {
        lastError = error as Error;

        // Don't retry on 4xx errors (client errors) or aborted requests
        const status = error?.status || 0;
        if (status >= 400 && status < 500) {
          break;
        }
        
        if (error.name === 'AbortError') {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < this.config.retries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError || new Error("Request failed");
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();

// Export convenience functions
export const api = {
  get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
  post: <T>(endpoint: string, data?: any) => apiClient.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: any) => apiClient.put<T>(endpoint, data),
  patch: <T>(endpoint: string, data?: any) =>
    apiClient.patch<T>(endpoint, data),
  delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
};
