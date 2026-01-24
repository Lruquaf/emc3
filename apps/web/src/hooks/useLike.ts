import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeArticle, unlikeArticle } from '../api/social.api';
import { useAuth } from '../contexts/AuthContext';
import type { LikeToggleResponse } from '@emc3/shared';

interface UseLikeOptions {
  articleId: string;
  initialLiked: boolean;
  initialCount: number;
}

interface UseLikeReturn {
  liked: boolean;
  likeCount: number;
  toggle: () => void;
  isLoading: boolean;
}

/**
 * Hook for managing article like state with optimistic updates
 */
export function useLike({
  articleId,
  initialLiked,
  initialCount,
}: UseLikeOptions): UseLikeReturn {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Optimistic state
  const [optimisticLiked, setOptimisticLiked] = useState(initialLiked);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);

  // Track when a mutation just completed to prevent useEffect from overriding state
  const lastMutationTimeRef = useRef<number | null>(null);
  // Keep refs to latest initial values for error rollback
  const initialLikedRef = useRef(initialLiked);
  const initialCountRef = useRef(initialCount);
  // Track the articleId to detect when we switch to a different article
  const articleIdRef = useRef(articleId);
  // Track previous initial values to detect external changes (page refresh, data refetch)
  const prevInitialLikedRef = useRef(initialLiked);
  const prevInitialCountRef = useRef(initialCount);

  // Update refs when initial values change
  useEffect(() => {
    initialLikedRef.current = initialLiked;
    initialCountRef.current = initialCount;
  }, [initialLiked, initialCount]);

  const likeMutation = useMutation({
    mutationFn: () => likeArticle(articleId),
    onMutate: () => {
      // Optimistic update
      setOptimisticLiked(true);
      setOptimisticCount((c) => c + 1);
    },
    onSuccess: (data: LikeToggleResponse) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.likeCount);
      // Mark mutation completion time
      lastMutationTimeRef.current = Date.now();
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => {
      // Rollback to latest initial values
      setOptimisticLiked(initialLikedRef.current);
      setOptimisticCount(initialCountRef.current);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeArticle(articleId),
    onMutate: () => {
      setOptimisticLiked(false);
      setOptimisticCount((c) => Math.max(0, c - 1));
    },
    onSuccess: (data: LikeToggleResponse) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.likeCount);
      // Mark mutation completion time
      lastMutationTimeRef.current = Date.now();
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => {
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
    },
  });

  // Detect article change (navigation to different article)
  useEffect(() => {
    if (articleIdRef.current !== articleId) {
      // Article changed, reset state and mutation time
      articleIdRef.current = articleId;
      lastMutationTimeRef.current = null;
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
    }
  }, [articleId, initialLiked, initialCount]);

  // Sync state with initial values when they change
  useEffect(() => {
    const isPending = likeMutation.isPending || unlikeMutation.isPending;
    const timeSinceLastMutation = lastMutationTimeRef.current
      ? Date.now() - lastMutationTimeRef.current
      : Infinity;

    // Don't sync if mutation is currently pending
    if (isPending) {
      return;
    }

    // Check if initial values changed externally (page refresh, data refetch)
    const initialValuesChanged = 
      prevInitialLikedRef.current !== initialLiked || 
      prevInitialCountRef.current !== initialCount;

    // If initial values changed and it's been more than 2 seconds since last mutation,
    // this is likely a page refresh or external data update - sync immediately
    if (initialValuesChanged && timeSinceLastMutation > 2000) {
      prevInitialLikedRef.current = initialLiked;
      prevInitialCountRef.current = initialCount;
      lastMutationTimeRef.current = null;
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
      return;
    }

    // If mutation just completed (within 1 second), wait for query refetch
    if (timeSinceLastMutation < 1000) {
      // Check if the new initial values match what we expect after mutation
      const expectedLiked = optimisticLiked;
      
      if (initialLiked === expectedLiked && initialCount === optimisticCount) {
        // Query refetch completed and values match, sync is safe
        prevInitialLikedRef.current = initialLiked;
        prevInitialCountRef.current = initialCount;
        setOptimisticLiked(initialLiked);
        setOptimisticCount(initialCount);
      }
      return;
    }

    // If initial values don't match optimistic state, sync them
    if (optimisticLiked !== initialLiked || optimisticCount !== initialCount) {
      prevInitialLikedRef.current = initialLiked;
      prevInitialCountRef.current = initialCount;
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
    }
  }, [
    initialLiked,
    initialCount,
    optimisticLiked,
    optimisticCount,
    likeMutation.isPending,
    unlikeMutation.isPending,
  ]);

  const toggle = useCallback(() => {
    if (!isAuthenticated) {
      // Could show a toast or redirect to login
      console.warn('Login required to like');
      return;
    }

    if (!user?.emailVerified) {
      console.warn('Email verification required to like');
      return;
    }

    if (optimisticLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  }, [isAuthenticated, user?.emailVerified, optimisticLiked, likeMutation, unlikeMutation]);

  return {
    liked: optimisticLiked,
    likeCount: optimisticCount,
    toggle,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  };
}
