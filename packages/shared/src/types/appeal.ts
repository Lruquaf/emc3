// ═══════════════════════════════════════════════════════════
// APPEAL DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Appeal status
 */
export type AppealStatus = 'OPEN' | 'CLOSED';

/**
 * Appeal message DTO
 */
export interface AppealMessageDTO {
  id: string;
  sender: {
    id: string;
    username: string;
    displayName: string | null;
    isAdmin: boolean;
  } | null;
  body: string;
  createdAt: string;
}

/**
 * Appeal DTO (full detail)
 */
export interface AppealDTO {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    email: string;
    banReason: string | null;
    bannedAt: string | null;
  };
  status: AppealStatus;
  messages: AppealMessageDTO[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Appeal summary (for list)
 */
export interface AppealSummaryDTO {
  id: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
  };
  status: AppealStatus;
  lastMessage: string | null;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Appeal list response
 */
export interface AppealListResponse {
  items: AppealSummaryDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Appeal list params
 */
export interface AppealListParams {
  status?: AppealStatus;
  page?: number;
  limit?: number;
}

/**
 * Create appeal request
 */
export interface CreateAppealRequest {
  message: string;
}

/**
 * Send message request
 */
export interface AppealMessageRequest {
  message: string;
}

/**
 * Close appeal request
 */
export interface CloseAppealRequest {
  resolution?: 'upheld' | 'overturned';
  message?: string;
}

/**
 * Appeal resolution
 */
export type AppealResolution = 'upheld' | 'overturned' | null;

/**
 * User's own appeal view
 */
export interface MyAppealDTO {
  id: string;
  status: AppealStatus;
  resolution: AppealResolution;
  messages: AppealMessageDTO[];
  banReason: string | null;
  bannedAt: string | null;
  createdAt: string;
}
