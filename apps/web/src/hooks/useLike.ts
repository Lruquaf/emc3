import { useState, useCallback } from 'react';
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
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => {
      // Rollback
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
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
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onError: () => {
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
    },
  });

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

