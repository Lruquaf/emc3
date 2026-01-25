const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

// ═══════════════════════════════════════════════════════════
// API Client
// ═══════════════════════════════════════════════════════════

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ─────────────────────────────────────────────────────────
  // Request Methods
  // ─────────────────────────────────────────────────────────

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  // ─────────────────────────────────────────────────────────
  // Core Request
  // ─────────────────────────────────────────────────────────

  private async request<T>(
    path: string,
    options: RequestOptions & { method: string }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const { body, ...init } = options;

    const config: RequestInit = {
      ...init,
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (error) {
      // Network error (CORS, connection refused, etc.)
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      throw {
        code: 'NETWORK_ERROR',
        message: `Bağlantı hatası: ${errorMessage}. API sunucusunun çalıştığından emin olun.`,
        details: { url, error: errorMessage },
      } as ApiError;
    }

    // Handle 401 - try to refresh token
    if (response.status === 401 && !path.includes('/auth/')) {
      try {
        await this.refreshToken();
        try {
          response = await fetch(url, config);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Network error';
          throw {
            code: 'NETWORK_ERROR',
            message: `Bağlantı hatası: ${errorMessage}. API sunucusunun çalıştığından emin olun.`,
            details: { url, error: errorMessage },
          } as ApiError;
        }
      } catch {
        // Refresh failed, continue with original response
      }
    }

    return this.handleResponse<T>(response);
  }

  // ─────────────────────────────────────────────────────────
  // Response Handling
  // ─────────────────────────────────────────────────────────

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data: unknown;
    try {
      if (isJson) {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } else {
        const text = await response.text();
        // If not JSON and not ok, create error from text
        if (!response.ok) {
          throw {
            code: 'HTTP_ERROR',
            message: text || `HTTP ${response.status} ${response.statusText}`,
            details: { status: response.status, statusText: response.statusText },
          } as ApiError;
        }
        data = text;
      }
    } catch (error) {
      // JSON parse error or other error
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw {
        code: 'PARSE_ERROR',
        message: `Yanıt işlenirken hata oluştu: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText },
      } as ApiError;
    }

    if (!response.ok) {
      // If data is already an ApiError, throw it
      if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
        throw data as ApiError;
      }
      // Otherwise create a generic error
      throw {
        code: 'HTTP_ERROR',
        message: typeof data === 'string' ? data : `HTTP ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText, data },
      } as ApiError;
    }

    return data as T;
  }

  // ─────────────────────────────────────────────────────────
  // Token Refresh
  // ─────────────────────────────────────────────────────────

  private async refreshToken(): Promise<void> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Token refresh failed');
        }
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }
}

// ═══════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════

export const apiClient = new ApiClient(API_URL);

