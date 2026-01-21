import { apiClient } from './client';
import type {
  ReviewQueueResponse,
  RevisionReviewDetailDTO,
  ReviewActionResponse,
  PublishQueueResponse,
  PublishResponse,
  GiveFeedbackInput,
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

