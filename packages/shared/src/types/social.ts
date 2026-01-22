// ═══════════════════════════════════════════════════════════
// SOCIAL DTOs
// ═══════════════════════════════════════════════════════════

/**
 * Like toggle response
 */
export interface LikeToggleResponse {
  liked: boolean;
  likeCount: number;
}

/**
 * Save toggle response
 */
export interface SaveToggleResponse {
  saved: boolean;
  saveCount: number;
}

/**
 * Follow toggle response
 */
export interface FollowToggleResponse {
  following: boolean;
  followerCount: number;
}

/**
 * Article interaction state (for viewer)
 */
export interface ViewerInteraction {
  hasLiked: boolean;
  hasSaved: boolean;
}

/**
 * Article counts
 */
export interface ArticleCounts {
  likes: number;
  saves: number;
  views: number;
}

/**
 * User profile with social stats
 */
export interface UserProfileDTO {
  id: string;
  username: string;
  profile: {
    displayName: string | null;
    about: string | null;
    avatarUrl: string | null;
    socialLinks: Record<string, string>;
  };
  stats: {
    articleCount: number;
    followerCount: number;
    followingCount: number;
  };
  isFollowing: boolean; // viewer perspective
  isBanned: boolean;
  createdAt: string;
}

/**
 * User summary (for lists)
 */
export interface UserSummaryDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  about: string | null;
  isFollowing: boolean;
  isBanned: boolean;
}

/**
 * Author summary (for feed items)
 */
export interface AuthorSummaryDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isBanned: boolean;
}

/**
 * Category summary (for feed items)
 */
export interface CategorySummaryDTO {
  id: string;
  name: string;
  slug: string;
}

/**
 * Feed item (extended article)
 */
export interface FeedItemDTO {
  id: string;
  slug: string;
  author: AuthorSummaryDTO;
  title: string;
  summary: string;
  categories: CategorySummaryDTO[];
  counts: ArticleCounts;
  viewerInteraction?: ViewerInteraction;
  firstPublishedAt: string;
  lastPublishedAt: string;
  isUpdated: boolean; // first != last
}

/**
 * Feed response with pagination
 */
export interface FeedResponse {
  items: FeedItemDTO[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

/**
 * Feed query params
 */
export type FeedSortOption = 'new' | 'popular';

export interface GlobalFeedParams {
  query?: string;
  category?: string; // slug or id
  sort?: FeedSortOption;
  limit?: number;
  cursor?: string;
}

export interface FollowingFeedParams {
  limit?: number;
  cursor?: string;
}

/**
 * Saved articles list
 */
export interface SavedArticleDTO {
  article: FeedItemDTO;
  savedAt: string;
}

export interface SavedArticlesResponse {
  items: SavedArticleDTO[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

/**
 * User followers/following list
 */
export interface FollowListResponse {
  items: UserSummaryDTO[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

/**
 * User search response
 */
export interface UserSearchResponse {
  items: UserSummaryDTO[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}

