/**
 * Article status
 */
export type ArticleStatus = 'PUBLISHED' | 'REMOVED';

/**
 * Revision status
 */
export type RevisionStatus =
  | 'REV_DRAFT'
  | 'REV_IN_REVIEW'
  | 'REV_CHANGES_REQUESTED'
  | 'REV_APPROVED'
  | 'REV_WITHDRAWN'
  | 'REV_PUBLISHED';

/**
 * Category DTO
 */
export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
}

/**
 * Author DTO
 */
export interface AuthorDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isBanned: boolean;
}

/**
 * Article counts
 */
export interface ArticleCountsDTO {
  likes: number;
  saves: number;
  views: number;
}

/**
 * Article content DTO
 */
export interface ArticleContentDTO {
  revisionId: string;
  contentMarkdown: string;
  bibliography: string | null;
}

/**
 * Viewer interaction
 */
export interface ViewerInteractionDTO {
  hasLiked: boolean;
  hasSaved: boolean;
}

/**
 * Article public DTO (for feeds)
 */
export interface ArticlePublicDTO {
  id: string;
  slug: string;
  author: AuthorDTO;
  title: string;
  summary: string;
  categories: CategoryDTO[];
  counts: ArticleCountsDTO;
  firstPublishedAt: string | null;
  lastPublishedAt: string | null;
  isUpdated: boolean;
  hasPendingUpdate: boolean;
}

/**
 * Article read DTO (full page)
 */
export interface ArticleReadDTO {
  article: ArticlePublicDTO;
  content: ArticleContentDTO;
  viewerInteraction?: ViewerInteractionDTO;
}

