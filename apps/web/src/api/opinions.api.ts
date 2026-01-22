import { apiClient } from './client';
import type {
  OpinionListResponse,
  OpinionListParams,
  CreateOpinionRequest,
  CreateOpinionResponse,
  UpdateOpinionRequest,
  OpinionDTO,
  OpinionLikeToggleResponse,
  OpinionReplyDTO,
  CreateReplyRequest,
  UpdateReplyRequest,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// OPINION API - FAZ 6
// ═══════════════════════════════════════════════════════════

/**
 * Get opinions for an article
 */
export async function getOpinions(
  articleId: string,
  params: OpinionListParams = {}
): Promise<OpinionListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.sort) searchParams.append('sort', params.sort);
  searchParams.append('limit', (params.limit ?? 20).toString());
  if (params.cursor) searchParams.append('cursor', params.cursor);
  
  return apiClient.get(`/articles/${articleId}/opinions?${searchParams}`);
}

/**
 * Create a new opinion
 */
export async function createOpinion(
  articleId: string,
  data: CreateOpinionRequest
): Promise<CreateOpinionResponse> {
  return apiClient.post(`/articles/${articleId}/opinions`, data);
}

/**
 * Update an opinion
 */
export async function updateOpinion(
  opinionId: string,
  data: UpdateOpinionRequest
): Promise<OpinionDTO> {
  return apiClient.put(`/opinions/${opinionId}`, data);
}

/**
 * Remove an opinion (mod/admin only)
 */
export async function removeOpinion(
  opinionId: string,
  reason?: string
): Promise<void> {
  return apiClient.delete(`/opinions/${opinionId}`, {
    body: reason ? { reason } : undefined,
  });
}

// ═══════════════════════════════════════════════════════════
// OPINION LIKES
// ═══════════════════════════════════════════════════════════

/**
 * Like an opinion
 */
export async function likeOpinion(
  opinionId: string
): Promise<OpinionLikeToggleResponse> {
  return apiClient.post(`/opinions/${opinionId}/like`);
}

/**
 * Unlike an opinion
 */
export async function unlikeOpinion(
  opinionId: string
): Promise<OpinionLikeToggleResponse> {
  return apiClient.delete(`/opinions/${opinionId}/like`);
}

// ═══════════════════════════════════════════════════════════
// AUTHOR REPLY
// ═══════════════════════════════════════════════════════════

/**
 * Create a reply to an opinion (article author only)
 */
export async function createReply(
  opinionId: string,
  data: CreateReplyRequest
): Promise<OpinionReplyDTO> {
  return apiClient.post(`/opinions/${opinionId}/reply`, data);
}

/**
 * Update a reply
 */
export async function updateReply(
  opinionId: string,
  data: UpdateReplyRequest
): Promise<OpinionReplyDTO> {
  return apiClient.put(`/opinions/${opinionId}/reply`, data);
}

