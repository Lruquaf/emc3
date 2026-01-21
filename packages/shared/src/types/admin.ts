import type { RevisionStatus, CategoryDTO, AuthorDTO } from './article.js';

// ═══════════════════════════════════════════════════════════
// Review Queue DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Review queue item (summary)
 */
export interface ReviewQueueItemDTO {
  id: string;                    // revision id
  articleId: string;
  articleSlug: string;
  title: string;
  summary: string;
  author: AuthorDTO;
  categories: CategoryDTO[];
  status: RevisionStatus;
  submittedAt: string;           // when status changed to IN_REVIEW
  previousFeedbackCount: number; // how many times feedback was given
  isUpdate: boolean;             // is this an update to existing article?
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
  action: 'FEEDBACK' | 'APPROVE';
  feedbackText: string | null;
  createdAt: string;
}

/**
 * Full revision detail for review
 */
export interface RevisionReviewDetailDTO {
  id: string;
  articleId: string;
  articleSlug: string;
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
  isNewArticle: boolean;         // no published revision yet
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
  id: string;                    // revision id
  articleId: string;
  articleSlug: string;
  title: string;
  summary: string;
  author: AuthorDTO;
  categories: CategoryDTO[];
  approvedAt: string;            // when approved
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
  articleSlug: string;
  revisionId: string;
  isFirstPublish: boolean;
  firstPublishedAt: string;
  lastPublishedAt: string;
}

