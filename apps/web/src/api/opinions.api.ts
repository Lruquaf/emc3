import { apiClient } from './client';
import type {
  OpinionListResponse,
  OpinionListParams,
  CreateOpinionRequest,
  CreateOpinionResponse,
  UpdateOpinionRequest,
  OpinionDTO,
  OpinionLikeToggleResponse,
  CreateReplyRequest,
  UpdateReplyRequest,
  OpinionReplyDTO,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Opinion API
// ═══════════════════════════════════════════════════════════

export const opinionsApi = {
  /**
   * Get opinions for an article
   */
  getOpinions: async (
    articleId: string,
    params?: OpinionListParams
  ): Promise<OpinionListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);

    const queryString = searchParams.toString();
    const path = `/articles/${articleId}/opinions${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<OpinionListResponse>(path);
  },

  /**
   * Create opinion
   */
  createOpinion: async (
    articleId: string,
    input: CreateOpinionRequest
  ): Promise<CreateOpinionResponse> => {
    return apiClient.post<CreateOpinionResponse>(`/articles/${articleId}/opinions`, input);
  },

  /**
   * Update opinion
   */
  updateOpinion: async (
    opinionId: string,
    input: UpdateOpinionRequest
  ): Promise<OpinionDTO> => {
    return apiClient.put<OpinionDTO>(`/opinions/${opinionId}`, input);
  },

  /**
   * Delete opinion
   */
  deleteOpinion: async (opinionId: string): Promise<void> => {
    await apiClient.delete(`/opinions/${opinionId}`);
  },

  /**
   * Like opinion
   */
  likeOpinion: async (opinionId: string): Promise<OpinionLikeToggleResponse> => {
    return apiClient.post<OpinionLikeToggleResponse>(`/opinions/${opinionId}/like`);
  },

  /**
   * Unlike opinion
   */
  unlikeOpinion: async (opinionId: string): Promise<OpinionLikeToggleResponse> => {
    return apiClient.delete<OpinionLikeToggleResponse>(`/opinions/${opinionId}/like`);
  },

  /**
   * Create reply
   */
  createReply: async (opinionId: string, input: CreateReplyRequest): Promise<OpinionReplyDTO> => {
    return apiClient.post<OpinionReplyDTO>(`/opinions/${opinionId}/reply`, input);
  },

  /**
   * Update reply
   */
  updateReply: async (
    opinionId: string,
    input: UpdateReplyRequest
  ): Promise<OpinionReplyDTO> => {
    return apiClient.put<OpinionReplyDTO>(`/opinions/${opinionId}/reply`, input);
  },
};
