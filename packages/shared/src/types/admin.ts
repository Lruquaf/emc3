import type { RevisionStatus, AuthorDTO } from "./article.js";
import type { CategoryDTO } from "./category.js";
import type { RoleName } from "./user.js";

// ═══════════════════════════════════════════════════════════
// User Moderation DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Ban user request
 */
export interface BanUserRequest {
  reason: string;
}

/**
 * Ban/Unban response
 */
export interface BanUserResponse {
  userId: string;
  isBanned: boolean;
  reason: string | null;
  bannedAt: string | null;
  bannedBy: string | null;
}

/**
 * Role management request
 */
export interface UpdateRoleRequest {
  role: RoleName;
  action: "grant" | "revoke";
}

/**
 * Role management response
 */
export interface UpdateRoleResponse {
  userId: string;
  roles: RoleName[];
}

/**
 * Admin user list item
 */
export interface AdminUserDTO {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  roles: RoleName[];
  isBanned: boolean;
  banReason: string | null;
  bannedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  stats: {
    articleCount: number;
    opinionCount: number;
  };
  createdAt: string;
}

/**
 * Admin user list response
 */
export interface AdminUserListResponse {
  items: AdminUserDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Admin user list params
 */
export interface AdminUserListParams {
  query?: string;
  role?: RoleName;
  isBanned?: boolean;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════
// Article Moderation DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Article moderation request
 */
export interface RemoveArticleRequest {
  reason: string;
}

/**
 * Admin article list item
 */
export interface AdminArticleDTO {
  id: string;
  status: "PUBLISHED" | "REMOVED";
  author: {
    id: string;
    username: string;
    displayName: string | null;
    isBanned: boolean;
    isDeleted: boolean;
  };
  title: string;
  summary: string;
  publishedAt: string | null;
  counts: {
    likes: number;
    saves: number;
    views: number;
    opinions: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Admin article list response
 */
export interface AdminArticleListResponse {
  items: AdminArticleDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Admin article list params
 */
export interface AdminArticleListParams {
  query?: string;
  status?: "PUBLISHED" | "REMOVED";
  authorId?: string;
  page?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════
// Dashboard Stats
// ═══════════════════════════════════════════════════════════

/**
 * Dashboard stats
 */
export interface AdminDashboardStats {
  users: {
    total: number;
    newThisWeek: number;
    banned: number;
  };
  articles: {
    total: number;
    published: number;
    removed: number;
  };
  reviews: {
    pending: number;
    approvedThisWeek: number;
  };
  appeals: {
    open: number;
  };
}

// ═══════════════════════════════════════════════════════════
// Review Queue DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Review queue item (summary)
 */
export interface ReviewQueueItemDTO {
  id: string; // revision id
  articleId: string;
  title: string;
  summary: string;
  author: AuthorDTO;
  categories: CategoryDTO[];
  status: RevisionStatus;
  submittedAt: string; // when status changed to IN_REVIEW
  previousFeedbackCount: number; // how many times feedback was given
  isUpdate: boolean; // is this an update to existing article?
}

/**
 * Review queue response
 */
export interface ReviewQueueResponse {
  items: ReviewQueueItemDTO[];
  meta: {
    totalCount: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// Review Detail DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Review feedback history item
 */
export interface ReviewFeedbackHistoryDTO {
  id: string;
  reviewerId: string;
  reviewerUsername: string;
  action: "FEEDBACK" | "APPROVE";
  feedbackText: string | null;
  createdAt: string;
}

/**
 * Full revision detail for review
 */
export interface RevisionReviewDetailDTO {
  id: string;
  articleId: string;
  status: RevisionStatus;

  // Content
  title: string;
  summary: string;
  contentMarkdown: string;
  bibliography: string | null;
  categories: CategoryDTO[];

  // Author info
  author: AuthorDTO;

  // Article info (for context)
  isNewArticle: boolean; // no published revision yet
  currentPublishedTitle: string | null;

  // Review history
  feedbackHistory: ReviewFeedbackHistoryDTO[];

  // Timestamps
  createdAt: string;
  submittedAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════
// Publish Queue DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Publish queue item
 */
export interface PublishQueueItemDTO {
  id: string; // revision id
  articleId: string;
  articleSlug: string | null; // Article slug was removed, kept for compatibility
  title: string;
  summary: string;
  author: AuthorDTO;
  categories: CategoryDTO[];
  approvedAt: string; // when approved
  approvedBy: {
    id: string;
    username: string;
  };
  isNewArticle: boolean;
  isUpdate: boolean;
}

/**
 * Publish queue response
 */
export interface PublishQueueResponse {
  items: PublishQueueItemDTO[];
  meta: {
    totalCount: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
}

// ═══════════════════════════════════════════════════════════
// Action DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Feedback input
 */
export interface GiveFeedbackInput {
  feedbackText: string;
}

/**
 * Action response (feedback, approve, publish)
 */
export interface ReviewActionResponse {
  revisionId: string;
  newStatus: RevisionStatus;
  message: string;
}

/**
 * Publish response
 */
export interface PublishResponse {
  articleId: string;
  revisionId: string;
  isFirstPublish: boolean;
  firstPublishedAt: string;
  lastPublishedAt: string;
}
