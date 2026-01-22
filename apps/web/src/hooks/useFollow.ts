import { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { followUser, unfollowUser, getFollowers, getFollowing } from '../api/social.api';
import { useAuth } from '../contexts/AuthContext';
import type { FollowToggleResponse, FollowListResponse } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// useFollow Hook - Toggle follow state
// ═══════════════════════════════════════════════════════════

interface UseFollowOptions {
  userId: string;
  initialFollowing: boolean;
  initialFollowerCount?: number;
}

interface UseFollowReturn {
  following: boolean;
  followerCount: number;
  toggle: () => void;
  isLoading: boolean;
}

/**
 * Hook for managing follow state with optimistic updates
 */
export function useFollow({
  userId,
  initialFollowing,
  initialFollowerCount = 0,
}: UseFollowOptions): UseFollowReturn {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [optimisticFollowing, setOptimisticFollowing] = useState(initialFollowing);
  const [optimisticCount, setOptimisticCount] = useState(initialFollowerCount);

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: () => {
      setOptimisticFollowing(true);
      setOptimisticCount((c) => c + 1);
    },
    onSuccess: (data: FollowToggleResponse) => {
      setOptimisticFollowing(data.following);
      setOptimisticCount(data.followerCount);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
    onError: () => {
      setOptimisticFollowing(initialFollowing);
      setOptimisticCount(initialFollowerCount);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onMutate: () => {
      setOptimisticFollowing(false);
      setOptimisticCount((c) => Math.max(0, c - 1));
    },
    onSuccess: (data: FollowToggleResponse) => {
      setOptimisticFollowing(data.following);
      setOptimisticCount(data.followerCount);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
    onError: () => {
      setOptimisticFollowing(initialFollowing);
      setOptimisticCount(initialFollowerCount);
    },
  });

  const toggle = useCallback(() => {
    if (!isAuthenticated) {
      console.warn('Login required to follow');
      return;
    }

    if (!user?.emailVerified) {
      console.warn('Email verification required to follow');
      return;
    }

    // Don't allow following self
    if (user?.id === userId) {
      console.warn('Cannot follow yourself');
      return;
    }

    if (optimisticFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [
    isAuthenticated,
    user?.emailVerified,
    user?.id,
    userId,
    optimisticFollowing,
    followMutation,
    unfollowMutation,
  ]);

  return {
    following: optimisticFollowing,
    followerCount: optimisticCount,
    toggle,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
}

// ═══════════════════════════════════════════════════════════
// useFollowers Hook - List followers
// ═══════════════════════════════════════════════════════════

interface UseFollowersOptions {
  limit?: number;
}

/**
 * Hook for fetching user's followers with infinite scrolling
 */
export function useFollowers(
  username: string,
  { limit = 20 }: UseFollowersOptions = {}
) {
  return useInfiniteQuery({
    queryKey: ['followers', username, limit],
    queryFn: async ({ pageParam }): Promise<FollowListResponse> => {
      return getFollowers(username, limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    enabled: !!username,
  });
}

// ═══════════════════════════════════════════════════════════
// useFollowing Hook - List following
// ═══════════════════════════════════════════════════════════

/**
 * Hook for fetching users that a user is following with infinite scrolling
 */
export function useFollowing(
  username: string,
  { limit = 20 }: UseFollowersOptions = {}
) {
  return useInfiniteQuery({
    queryKey: ['following', username, limit],
    queryFn: async ({ pageParam }): Promise<FollowListResponse> => {
      return getFollowing(username, limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    enabled: !!username,
  });
}

