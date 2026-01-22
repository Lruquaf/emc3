import { apiClient } from './client';
import type {
  ReviewQueueResponse,
  RevisionReviewDetailDTO,
  ReviewActionResponse,
  PublishQueueResponse,
  PublishResponse,
  GiveFeedbackInput,
  AdminUserListResponse,
  AdminUserDTO,
  AdminArticleListResponse,
  BanUserResponse,
  UpdateRoleResponse,
  AuditLogListResponse,
  AppealListResponse,
  AppealDTO,
  AppealMessageDTO,
  AdminDashboardStats,
  RoleName,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Review API
// ═══════════════════════════════════════════════════════════

export const adminReviewApi = {
  /**
   * Get review queue
   */
  getReviewQueue: async (params?: {
    status?: string;
    authorId?: string;
    categoryId?: string;
    sort?: string;
    limit?: number;
    cursor?: string;
  }): Promise<ReviewQueueResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.authorId) searchParams.set('authorId', params.authorId);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    
    const queryString = searchParams.toString();
    const path = `/admin/reviews${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ReviewQueueResponse>(path);
  },

  /**
   * Get revision detail for review
   */
  getRevisionDetail: async (id: string): Promise<RevisionReviewDetailDTO> => {
    return apiClient.get<RevisionReviewDetailDTO>(`/admin/revisions/${id}`);
  },

  /**
   * Give feedback (changes requested)
   */
  giveFeedback: async (
    id: string,
    input: GiveFeedbackInput
  ): Promise<ReviewActionResponse> => {
    return apiClient.post<ReviewActionResponse>(`/admin/revisions/${id}/feedback`, input);
  },

  /**
   * Approve revision
   */
  approve: async (id: string): Promise<ReviewActionResponse> => {
    return apiClient.post<ReviewActionResponse>(`/admin/revisions/${id}/approve`);
  },
};

// ═══════════════════════════════════════════════════════════
// Publish API
// ═══════════════════════════════════════════════════════════

export const adminPublishApi = {
  /**
   * Get publish queue
   */
  getPublishQueue: async (params?: {
    sort?: string;
    limit?: number;
    cursor?: string;
  }): Promise<PublishQueueResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    
    const queryString = searchParams.toString();
    const path = `/admin/publish-queue${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<PublishQueueResponse>(path);
  },

  /**
   * Publish revision
   */
  publish: async (id: string): Promise<PublishResponse> => {
    return apiClient.post<PublishResponse>(`/admin/revisions/${id}/publish`);
  },
};

// ═══════════════════════════════════════════════════════════
// Dashboard API
// ═══════════════════════════════════════════════════════════

export const adminDashboardApi = {
  /**
   * Get dashboard stats
   */
  getStats: async (): Promise<AdminDashboardStats> => {
    return apiClient.get<AdminDashboardStats>('/admin/dashboard/stats');
  },
};

// ═══════════════════════════════════════════════════════════
// User Moderation API
// ═══════════════════════════════════════════════════════════

export const adminUsersApi = {
  /**
   * List users
   */
  list: async (params?: {
    query?: string;
    role?: RoleName;
    isBanned?: boolean;
    page?: number;
    limit?: number;
  }): Promise<AdminUserListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.isBanned !== undefined) searchParams.set('isBanned', String(params.isBanned));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const queryString = searchParams.toString();
    const path = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AdminUserListResponse>(path);
  },

  /**
   * Get user detail
   */
  getDetail: async (id: string): Promise<AdminUserDTO> => {
    return apiClient.get<AdminUserDTO>(`/admin/users/${id}`);
  },

  /**
   * Ban user
   */
  ban: async (id: string, reason: string): Promise<BanUserResponse> => {
    return apiClient.post<BanUserResponse>(`/admin/users/${id}/ban`, { reason });
  },

  /**
   * Unban user
   */
  unban: async (id: string): Promise<BanUserResponse> => {
    return apiClient.post<BanUserResponse>(`/admin/users/${id}/unban`);
  },

  /**
   * Update user role
   */
  updateRole: async (
    id: string,
    role: RoleName,
    action: 'grant' | 'revoke'
  ): Promise<UpdateRoleResponse> => {
    return apiClient.post<UpdateRoleResponse>(`/admin/users/${id}/role`, { role, action });
  },
};

// ═══════════════════════════════════════════════════════════
// Article Moderation API
// ═══════════════════════════════════════════════════════════

export const adminArticlesApi = {
  /**
   * List articles
   */
  list: async (params?: {
    query?: string;
    status?: 'PUBLISHED' | 'REMOVED';
    authorId?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminArticleListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.authorId) searchParams.set('authorId', params.authorId);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const queryString = searchParams.toString();
    const path = `/admin/articles${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AdminArticleListResponse>(path);
  },

  /**
   * Remove article
   */
  remove: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/admin/articles/${id}/remove`, { reason });
  },

  /**
   * Restore article
   */
  restore: async (id: string): Promise<void> => {
    await apiClient.post(`/admin/articles/${id}/restore`);
  },
};

// ═══════════════════════════════════════════════════════════
// Audit Log API
// ═══════════════════════════════════════════════════════════

export const adminAuditApi = {
  /**
   * Get audit logs
   */
  getLogs: async (params?: {
    action?: string;
    targetType?: string;
    targetId?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    cursor?: string;
  }): Promise<AuditLogListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.action) searchParams.set('action', params.action);
    if (params?.targetType) searchParams.set('targetType', params.targetType);
    if (params?.targetId) searchParams.set('targetId', params.targetId);
    if (params?.actorId) searchParams.set('actorId', params.actorId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    
    const queryString = searchParams.toString();
    const path = `/admin/audit${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AuditLogListResponse>(path);
  },
};

// ═══════════════════════════════════════════════════════════
// Appeals API (Admin)
// ═══════════════════════════════════════════════════════════

export const adminAppealsApi = {
  /**
   * List appeals
   */
  list: async (params?: {
    status?: 'OPEN' | 'CLOSED';
    page?: number;
    limit?: number;
  }): Promise<AppealListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    
    const queryString = searchParams.toString();
    const path = `/admin/appeals${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AppealListResponse>(path);
  },

  /**
   * Get appeal detail
   */
  getDetail: async (id: string): Promise<AppealDTO> => {
    return apiClient.get<AppealDTO>(`/admin/appeals/${id}`);
  },

  /**
   * Send message
   */
  sendMessage: async (id: string, message: string): Promise<AppealMessageDTO> => {
    return apiClient.post<AppealMessageDTO>(`/admin/appeals/${id}/message`, { message });
  },

  /**
   * Close appeal
   */
  close: async (
    id: string,
    resolution?: 'upheld' | 'overturned',
    message?: string
  ): Promise<void> => {
    await apiClient.post(`/admin/appeals/${id}/close`, { resolution, message });
  },
};
