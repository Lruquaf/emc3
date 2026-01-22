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

/**
 * Hook for fetching global feed with infinite scrolling
 */
export function useGlobalFeed(params: GlobalFeedParams = {}) {
  const { query, category, sort = 'new', limit = 20 } = params;

  return useInfiniteQuery({
    queryKey: ['feed', 'global', { query, category, sort, limit }],
    queryFn: async ({ pageParam }): Promise<FeedResponse> => {
      return getGlobalFeed({
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

