// ═══════════════════════════════════════════════════════════
// OPINION DTOs - FAZ 6
// ═══════════════════════════════════════════════════════════

/**
 * Author summary for opinions
 */
export interface OpinionAuthorDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * Author reply DTO
 */
export interface OpinionReplyDTO {
  replier: OpinionAuthorDTO;
  bodyMarkdown: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean; // viewer perspective (10 min window)
}

/**
 * Full opinion DTO
 */
export interface OpinionDTO {
  id: string;
  articleId: string;
  author: OpinionAuthorDTO;
  bodyMarkdown: string;
  likeCount: number;
  viewerHasLiked: boolean;
  canEdit: boolean; // viewer perspective (10 min window & is author)
  canReply: boolean; // viewer is article author & no reply yet
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reply: OpinionReplyDTO | null;
}

/**
 * Opinion sort options
 */
export type OpinionSortOption = 'helpful' | 'new';

/**
 * Opinion list response
 */
export interface OpinionListResponse {
  items: OpinionDTO[];
  meta: {
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
  viewerOpinion?: OpinionDTO; // Viewer's own opinion if exists
}

/**
 * Opinion list query params
 */
export interface OpinionListParams {
  sort?: OpinionSortOption;
  limit?: number;
  cursor?: string;
}

/**
 * Create opinion request
 */
export interface CreateOpinionRequest {
  bodyMarkdown: string;
}

/**
 * Create opinion response
 */
export interface CreateOpinionResponse {
  opinion: OpinionDTO;
}

/**
 * Update opinion request
 */
export interface UpdateOpinionRequest {
  bodyMarkdown: string;
}

/**
 * Opinion like toggle response
 */
export interface OpinionLikeToggleResponse {
  liked: boolean;
  likeCount: number;
}

/**
 * Create reply request
 */
export interface CreateReplyRequest {
  bodyMarkdown: string;
}

/**
 * Update reply request
 */
export interface UpdateReplyRequest {
  bodyMarkdown: string;
}

/**
 * Opinion stats (for article)
 */
export interface OpinionStats {
  totalCount: number;
  viewerHasOpinion: boolean;
}

/**
 * Remove opinion request (with reason)
 */
export interface RemoveOpinionRequest {
  reason?: string;
}

