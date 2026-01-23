import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getGlobalFeed, getFollowingFeed, searchUsers, getUserProfile } from '../api/social.api';
import type {
  FeedResponse,
  GlobalFeedParams,
  FollowingFeedParams,
  UserSearchResponse,
  UserProfileDTO,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// useGlobalFeed Hook
// ═══════════════════════════════════════════════════════════

interface UseGlobalFeedOptions extends GlobalFeedParams {
  enabled?: boolean;
}

/**
 * Hook for fetching global feed with infinite scrolling.
 * Pass authorUsername to filter by user (e.g. profile article list).
 */
export function useGlobalFeed(params: UseGlobalFeedOptions = {}) {
  const { enabled = true, ...rest } = params;
  const { query, category, sort = 'new', limit = 20, authorUsername } = rest;

  return useInfiniteQuery({
    queryKey: ['feed', 'global', { query, category, sort, limit, authorUsername }],
    queryFn: async ({ pageParam }): Promise<FeedResponse> => {
      return getGlobalFeed({
        ...rest,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });
}

// ═══════════════════════════════════════════════════════════
// useFollowingFeed Hook
// ═══════════════════════════════════════════════════════════

/**
 * Hook for fetching following feed with infinite scrolling
 */
export function useFollowingFeed(params: FollowingFeedParams = {}) {
  const { limit = 20 } = params;

  return useInfiniteQuery({
    queryKey: ['feed', 'following', { limit }],
    queryFn: async ({ pageParam }): Promise<FeedResponse> => {
      return getFollowingFeed({
        ...params,
        cursor: pageParam,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 1000 * 60, // 1 minute
  });
}

// ═══════════════════════════════════════════════════════════
// useUserSearch Hook
// ═══════════════════════════════════════════════════════════

interface UseUserSearchOptions {
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook for searching users with infinite scrolling
 */
export function useUserSearch(
  query: string,
  { limit = 20, enabled = true }: UseUserSearchOptions = {}
) {
  return useInfiniteQuery({
    queryKey: ['users', 'search', query, limit],
    queryFn: async ({ pageParam }): Promise<UserSearchResponse> => {
      return searchUsers(query, limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    enabled: enabled && query.length > 0,
  });
}

// ═══════════════════════════════════════════════════════════
// useUserProfile Hook
// ═══════════════════════════════════════════════════════════

/**
 * Hook for fetching user profile by username
 */
export function useUserProfile(username: string) {
  return useQuery<UserProfileDTO>({
    queryKey: ['profile', username],
    queryFn: () => getUserProfile(username),
    enabled: !!username,
  });
}

