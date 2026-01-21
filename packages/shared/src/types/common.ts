/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    nextCursor?: string;
    hasMore?: boolean;
    total?: number;
  };
}

/**
 * API Error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

/**
 * Sort params
 */
export type SortOrder = 'asc' | 'desc';

