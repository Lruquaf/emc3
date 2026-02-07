// Ensure API URL ends with /api/v1 and doesn't have trailing slash issues
const rawApiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const API_URL = rawApiUrl.endsWith("/api/v1")
  ? rawApiUrl
  : rawApiUrl.endsWith("/api/v1/")
    ? rawApiUrl.slice(0, -1)
    : rawApiUrl.endsWith("/")
      ? `${rawApiUrl}api/v1`
      : `${rawApiUrl}/api/v1`;

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

// ═══════════════════════════════════════════════════════════
// API Client – Standart: yalnızca httpOnly cookie (credentials: include)
// ═══════════════════════════════════════════════════════════

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  async put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  async patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  private async request<T>(
    path: string,
    options: RequestOptions & { method: string },
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const { body, ...init } = options;

    const config: RequestInit = {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    };

    if (body !== undefined) {
      config.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error";
      throw {
        code: "NETWORK_ERROR",
        message: `Bağlantı hatası: ${errorMessage}. API sunucusunun çalıştığından emin olun.`,
        details: { url, error: errorMessage },
      } as ApiError;
    }

    const isAuthEndpointNoRefresh =
      path === "/auth/login" ||
      path === "/auth/register" ||
      path === "/auth/refresh";
    if (response.status === 401 && !isAuthEndpointNoRefresh) {
      try {
        await this.refreshToken();
        response = await fetch(url, config);
      } catch {
        // Refresh failed
      }
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: unknown;
    try {
      if (isJson) {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } else {
        const text = await response.text();
        if (!response.ok) {
          throw {
            code: "HTTP_ERROR",
            message: text || `HTTP ${response.status} ${response.statusText}`,
            details: {
              status: response.status,
              statusText: response.statusText,
            },
          } as ApiError;
        }
        data = text;
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }
      throw {
        code: "PARSE_ERROR",
        message: `Yanıt işlenirken hata oluştu: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText },
      } as ApiError;
    }

    if (!response.ok) {
      if (
        data &&
        typeof data === "object" &&
        "code" in data &&
        "message" in data
      ) {
        throw data as ApiError;
      }
      throw {
        code: "HTTP_ERROR",
        message:
          typeof data === "string"
            ? data
            : `HTTP ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          data,
        },
      } as ApiError;
    }

    return data as T;
  }

  private async refreshToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = fetch(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token refresh failed");
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }
}

export const apiClient = new ApiClient(API_URL);
export { API_URL };
