import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// SOCIAL SCHEMAS
// ═══════════════════════════════════════════════════════════

/**
 * Like/Save toggle response
 */
export const LikeToggleResponseSchema = z.object({
  liked: z.boolean(),
  likeCount: z.number().int().min(0),
});

export const SaveToggleResponseSchema = z.object({
  saved: z.boolean(),
  saveCount: z.number().int().min(0),
});

/**
 * Follow toggle response
 */
export const FollowToggleResponseSchema = z.object({
  following: z.boolean(),
  followerCount: z.number().int().min(0),
});

/**
 * Feed query params
 */
export const GlobalFeedQuerySchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().optional(),
  sort: z.enum(['new', 'popular']).default('new'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export const FollowingFeedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

/**
 * Saved articles query
 */
export const SavedArticlesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

/**
 * User search query
 */
export const UserSearchQuerySchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

/**
 * Followers/Following list query
 */
export const FollowListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

/**
 * Article ID param
 */
export const ArticleIdParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * User ID param
 */
export const UserIdParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Username param
 */
export const UsernameParamSchema = z.object({
  username: z.string().min(1),
});

// Type exports from schemas
export type GlobalFeedQuery = z.infer<typeof GlobalFeedQuerySchema>;
export type FollowingFeedQuery = z.infer<typeof FollowingFeedQuerySchema>;
export type SavedArticlesQuery = z.infer<typeof SavedArticlesQuerySchema>;
export type UserSearchQuery = z.infer<typeof UserSearchQuerySchema>;
export type FollowListQuery = z.infer<typeof FollowListQuerySchema>;

