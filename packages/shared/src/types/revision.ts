import type { RevisionStatus } from './article.js';
import type { CategoryDTO } from './category.js';

/**
 * Review feedback info
 */
export interface ReviewFeedbackDTO {
  id: string;
  reviewerId: string;
  reviewerUsername: string;
  action: 'FEEDBACK' | 'APPROVE';
  feedbackText: string | null;
  createdAt: string;
}

/**
 * Revision DTO (for owner/admin/reviewer)
 */
export interface RevisionDTO {
  id: string;
  articleId: string;
  status: RevisionStatus;
  title: string;
  summary: string;
  contentMarkdown: string;
  bibliography: string | null;
  categories: CategoryDTO[];
  lastReviewFeedback: ReviewFeedbackDTO | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Revision list item (summary)
 */
export interface RevisionListItemDTO {
  id: string;
  articleId: string;
  title: string;
  status: RevisionStatus;
  hasUnreadFeedback: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Revision history item
 */
export interface RevisionHistoryItemDTO {
  id: string;
  status: RevisionStatus;
  title: string;
  isPublished: boolean;
  createdAt: string;
  publishedAt: string | null;
}

/**
 * Create article response
 */
export interface CreateArticleResponse {
  articleId: string;
  revisionId: string;
  status: RevisionStatus;
}

/**
 * Create revision response
 */
export interface CreateRevisionResponse {
  revisionId: string;
  status: RevisionStatus;
}

/**
 * Status change response
 */
export interface StatusChangeResponse {
  status: RevisionStatus;
}

/**
 * My revisions list response
 */
export interface MyRevisionsResponse {
  items: RevisionListItemDTO[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

