import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

import { saveArticle, unsaveArticle, getSavedArticles } from '../api/social.api';
import { useAuth } from '../contexts/AuthContext';
import type { SaveToggleResponse, SavedArticlesResponse } from '@emc3/shared';

interface UseSaveOptions {
  articleId: string;
  initialSaved: boolean;
  initialCount: number;
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
  initialCount,
}: UseSaveOptions): UseSaveReturn {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Optimistic state
  const [optimisticSaved, setOptimisticSaved] = useState(initialSaved);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);

  // Track when a mutation just completed to prevent useEffect from overriding state
  const lastMutationTimeRef = useRef<number | null>(null);
  // Keep refs to latest initial values for error rollback
  const initialSavedRef = useRef(initialSaved);
  const initialCountRef = useRef(initialCount);
  // Track the articleId to detect when we switch to a different article
  const articleIdRef = useRef(articleId);
  // Track previous initial values to detect external changes (page refresh, data refetch)
  const prevInitialSavedRef = useRef(initialSaved);
  const prevInitialCountRef = useRef(initialCount);

  // Update refs when initial values change
  useEffect(() => {
    initialSavedRef.current = initialSaved;
    initialCountRef.current = initialCount;
  }, [initialSaved, initialCount]);

  const saveMutation = useMutation({
    mutationFn: () => saveArticle(articleId),
    onMutate: () => {
      // Optimistic update
      setOptimisticSaved(true);
      setOptimisticCount((c) => c + 1);
    },
    onSuccess: (data: SaveToggleResponse) => {
      setOptimisticSaved(data.saved);
      setOptimisticCount(data.saveCount);
      // Mark mutation completion time
      lastMutationTimeRef.current = Date.now();
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onError: () => {
      // Rollback to latest initial values
      setOptimisticSaved(initialSavedRef.current);
      setOptimisticCount(initialCountRef.current);
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
      // Mark mutation completion time
      lastMutationTimeRef.current = Date.now();
      queryClient.invalidateQueries({ queryKey: ['article'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['saved'] });
    },
    onError: () => {
      setOptimisticSaved(initialSaved);
      setOptimisticCount(initialCount);
    },
  });

  // Detect article change (navigation to different article)
  useEffect(() => {
    if (articleIdRef.current !== articleId) {
      // Article changed, reset state and mutation time
      articleIdRef.current = articleId;
      lastMutationTimeRef.current = null;
      setOptimisticSaved(initialSaved);
      setOptimisticCount(initialCount);
    }
  }, [articleId, initialSaved, initialCount]);

  // Sync state with initial values when they change
  useEffect(() => {
    const isPending = saveMutation.isPending || unsaveMutation.isPending;
    const timeSinceLastMutation = lastMutationTimeRef.current
      ? Date.now() - lastMutationTimeRef.current
      : Infinity;

    // Don't sync if mutation is currently pending
    if (isPending) {
      return;
    }

    // Check if initial values changed externally (page refresh, data refetch)
    const initialValuesChanged = 
      prevInitialSavedRef.current !== initialSaved || 
      prevInitialCountRef.current !== initialCount;

    // If initial values changed and it's been more than 2 seconds since last mutation,
    // this is likely a page refresh or external data update - sync immediately
    if (initialValuesChanged && timeSinceLastMutation > 2000) {
      prevInitialSavedRef.current = initialSaved;
      prevInitialCountRef.current = initialCount;
      lastMutationTimeRef.current = null;
      setOptimisticSaved(initialSaved);
      setOptimisticCount(initialCount);
      return;
    }

    // If mutation just completed (within 1 second), wait for query refetch
    if (timeSinceLastMutation < 1000) {
      // Check if the new initial values match what we expect after mutation
      const expectedSaved = optimisticSaved;
      
      if (initialSaved === expectedSaved && initialCount === optimisticCount) {
        // Query refetch completed and values match, sync is safe
        prevInitialSavedRef.current = initialSaved;
        prevInitialCountRef.current = initialCount;
        setOptimisticSaved(initialSaved);
        setOptimisticCount(initialCount);
      }
      return;
    }

    // If initial values don't match optimistic state, sync them
    if (optimisticSaved !== initialSaved || optimisticCount !== initialCount) {
      prevInitialSavedRef.current = initialSaved;
      prevInitialCountRef.current = initialCount;
      setOptimisticSaved(initialSaved);
      setOptimisticCount(initialCount);
    }
  }, [
    initialSaved,
    initialCount,
    optimisticSaved,
    optimisticCount,
    saveMutation.isPending,
    unsaveMutation.isPending,
  ]);

  const toggle = useCallback(() => {
    if (!isAuthenticated) {
      // Could show a toast or redirect to login
      console.warn('Login required to save');
      return;
    }

    if (!user?.emailVerified) {
      console.warn('Email verification required to save');
      return;
    }

    if (optimisticSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  }, [isAuthenticated, user?.emailVerified, optimisticSaved, saveMutation, unsaveMutation]);

  return {
    saved: optimisticSaved,
    saveCount: optimisticCount,
    toggle,
    isLoading: saveMutation.isPending || unsaveMutation.isPending,
  };
}

/**
 * Hook for fetching saved articles with infinite scroll
 */
export function useSavedArticles({ limit = 20 }: { limit?: number }) {
  return useInfiniteQuery({
    queryKey: ['saved', limit],
    queryFn: async ({ pageParam }): Promise<SavedArticlesResponse> => {
      return getSavedArticles(limit, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: SavedArticlesResponse) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 1000 * 60, // 1 minute
  });
}
