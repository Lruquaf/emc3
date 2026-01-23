import { apiClient } from './client';
import type {
  LikeToggleResponse,
  SaveToggleResponse,
  FollowToggleResponse,
  SavedArticlesResponse,
  FollowListResponse,
  FeedResponse,
  UserSearchResponse,
  GlobalFeedParams,
  FollowingFeedParams,
  UserProfileDTO,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Like API
// ═══════════════════════════════════════════════════════════

export async function likeArticle(articleId: string): Promise<LikeToggleResponse> {
  return apiClient.post(`/articles/${articleId}/like`);
}

export async function unlikeArticle(articleId: string): Promise<LikeToggleResponse> {
  return apiClient.delete(`/articles/${articleId}/like`);
}

// ═══════════════════════════════════════════════════════════
// Save API
// ═══════════════════════════════════════════════════════════

export async function saveArticle(articleId: string): Promise<SaveToggleResponse> {
  return apiClient.post(`/articles/${articleId}/save`);
}

export async function unsaveArticle(articleId: string): Promise<SaveToggleResponse> {
  return apiClient.delete(`/articles/${articleId}/save`);
}

export async function getSavedArticles(
  limit = 20,
  cursor?: string
): Promise<SavedArticlesResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append('cursor', cursor);
  return apiClient.get(`/me/saved?${params}`);
}

// ═══════════════════════════════════════════════════════════
// Follow API
// ═══════════════════════════════════════════════════════════

export async function followUser(userId: string): Promise<FollowToggleResponse> {
  return apiClient.post(`/users/${userId}/follow`);
}

export async function unfollowUser(userId: string): Promise<FollowToggleResponse> {
  return apiClient.delete(`/users/${userId}/follow`);
}

export async function getFollowers(
  username: string,
  limit = 20,
  cursor?: string
): Promise<FollowListResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append('cursor', cursor);
  return apiClient.get(`/users/${username}/followers?${params}`);
}

export async function getFollowing(
  username: string,
  limit = 20,
  cursor?: string
): Promise<FollowListResponse> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (cursor) params.append('cursor', cursor);
  return apiClient.get(`/users/${username}/following?${params}`);
}

// ═══════════════════════════════════════════════════════════
// Feed API
// ═══════════════════════════════════════════════════════════

export async function getGlobalFeed(
  params: GlobalFeedParams = {}
): Promise<FeedResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.query) searchParams.append('query', params.query);
  if (params.category) searchParams.append('category', params.category);
  if (params.sort) searchParams.append('sort', params.sort ?? 'new');
  searchParams.append('limit', (params.limit ?? 20).toString());
  if (params.cursor) searchParams.append('cursor', params.cursor);
  if (params.authorUsername) searchParams.append('authorUsername', params.authorUsername);
  
  return apiClient.get(`/feed/global?${searchParams}`);
}

export async function getFollowingFeed(
  params: FollowingFeedParams = {}
): Promise<FeedResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append('limit', (params.limit ?? 20).toString());
  if (params.cursor) searchParams.append('cursor', params.cursor);
  
  return apiClient.get(`/feed/following?${searchParams}`);
}

// ═══════════════════════════════════════════════════════════
// User Search API
// ═══════════════════════════════════════════════════════════

export async function searchUsers(
  query: string,
  limit = 20,
  cursor?: string
): Promise<UserSearchResponse> {
  const params = new URLSearchParams({
    query,
    limit: limit.toString(),
  });
  if (cursor) params.append('cursor', cursor);
  return apiClient.get(`/search/users?${params}`);
}

// ═══════════════════════════════════════════════════════════
// User Profile API
// ═══════════════════════════════════════════════════════════

export async function getUserProfile(username: string): Promise<UserProfileDTO> {
  return apiClient.get(`/users/${username}`);
}

