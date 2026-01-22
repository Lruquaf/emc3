import { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { saveArticle, unsaveArticle, getSavedArticles } from '../api/social.api';
import { useAuth } from '../contexts/AuthContext';
import type { SaveToggleResponse, SavedArticlesResponse } from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// useSave Hook - Toggle save state
// ═══════════════════════════════════════════════════════════

interface UseSaveOptions {
  articleId: string;
  initialSaved: boolean;
  initialCount?: number;
}

interface UseSaveReturn {
  saved: boolean;
  saveCount: number;
  toggle: () => void;
  isLoading: boolean;
}

/**
 * Hook for managing article save state with optimistic updates
 */
export function useSave({
  articleId,
  initialSaved,
  initialCount = 0,
}: UseSaveOptions): UseSaveReturn {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [optimisticSaved, setOptimisticSaved] = useState(initialSaved);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);

  const saveMutation = useMutation({
    mutationFn: () => saveArticle(articleId),
    onMutate: () => {
      setOptimisticSaved(true);
      setOptimisticCount((c) => c + 1);
    },
    onSuccess: (data: SaveToggleResponse) => {
      setOptimisticSaved(data.saved);
      setOptimisticCount(data.saveCount);
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onError: () => {
      setOptimisticSaved(initialSaved);
      setOptimisticCount(initialCount);
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => unsaveArticle(articleId),
    onMutate: () => {
      setOptimisticSaved(false);
      setOptimisticCount((c) => Math.max(0, c - 1));
    },
    onSuccess: (data: SaveToggleResponse) => {
      setOptimisticSaved(data.saved);
      setOptimisticCount(data.saveCount);
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onError: () => {
      setOptimisticSaved(initialSaved);
      setOptimisticCount(initialCount);
    },
  });

  const toggle = useCallback(() => {
    if (!isAuthenticated) {
      console.warn('Login required to save');
      return;
    }

    if (optimisticSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  }, [isAuthenticated, optimisticSaved, saveMutation, unsaveMutation]);

  return {
    saved: optimisticSaved,
    saveCount: optimisticCount,
    toggle,
    isLoading: saveMutation.isPending || unsaveMutation.isPending,
  };
}

// ═══════════════════════════════════════════════════════════
// useSavedArticles Hook - List saved articles
// ═══════════════════════════════════════════════════════════

interface UseSavedArticlesOptions {
  limit?: number;
}

/**
 * Hook for fetching user's saved articles with infinite scrolling
 */
export function useSavedArticles({ limit = 20 }: UseSavedArticlesOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['saved', limit],
    queryFn: async ({ pageParam }): Promise<SavedArticlesResponse> => {
      return getSavedArticles(limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
  });
}

