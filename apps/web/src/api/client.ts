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

    let response = await fetch(url, config);

    // Handle 401 - try to refresh token
    if (response.status === 401 && !path.includes('/auth/')) {
      try {
        await this.refreshToken();
        response = await fetch(url, config);
      } catch {
        // Refresh failed, throw original error
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

    const data = await response.json();

    if (!response.ok) {
      throw data as ApiError;
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

