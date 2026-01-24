import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { opinionsApi } from '../api/opinions.api';
import { useAuth } from '../contexts/AuthContext';
import type {
  OpinionListParams,
  CreateOpinionRequest,
  UpdateOpinionRequest,
  CreateReplyRequest,
  UpdateReplyRequest,
  OpinionLikeToggleResponse,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Opinion Hooks
// ═══════════════════════════════════════════════════════════

/**
 * Get opinions for an article
 */
export function useOpinions(articleId: string, params?: OpinionListParams) {
  return useQuery({
    queryKey: ['opinions', articleId, params],
    queryFn: () => opinionsApi.getOpinions(articleId, params),
  });
}

/**
 * Create opinion mutation
 */
export function useCreateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, input }: { articleId: string; input: CreateOpinionRequest }) =>
      opinionsApi.createOpinion(articleId, input),
    onSuccess: (_, variables) => {
      // Invalidate opinions list
      queryClient.invalidateQueries({ queryKey: ['opinions', variables.articleId] });
    },
  });
}

/**
 * Update opinion mutation
 */
export function useUpdateOpinion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId, input }: { opinionId: string; input: UpdateOpinionRequest }) =>
      opinionsApi.updateOpinion(opinionId, input),
    onSuccess: (data) => {
      // Invalidate opinions list for the article
      queryClient.invalidateQueries({ queryKey: ['opinions', data.articleId] });
    },
  });
}

/**
 * Like/unlike opinion mutation
 */
export function useToggleOpinionLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId, isLiked }: { opinionId: string; isLiked: boolean }) =>
      isLiked ? opinionsApi.unlikeOpinion(opinionId) : opinionsApi.likeOpinion(opinionId),
    onSuccess: (_, variables) => {
      // Invalidate all opinion queries to update like counts
      queryClient.invalidateQueries({ queryKey: ['opinions'] });
    },
  });
}

/**
 * Create reply mutation
 */
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId, input }: { opinionId: string; input: CreateReplyRequest }) =>
      opinionsApi.createReply(opinionId, input),
    onSuccess: () => {
      // Invalidate all opinion queries
      queryClient.invalidateQueries({ queryKey: ['opinions'] });
    },
  });
}

/**
 * Update reply mutation
 */
export function useUpdateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ opinionId, input }: { opinionId: string; input: UpdateReplyRequest }) =>
      opinionsApi.updateReply(opinionId, input),
    onSuccess: () => {
      // Invalidate all opinion queries
      queryClient.invalidateQueries({ queryKey: ['opinions'] });
    },
  });
}

/**
 * Opinion like hook (for OpinionLikeButton)
 * Uses optimistic updates like useLike hook
 */
export function useOpinionLike({
  opinionId,
  initialLiked,
  initialCount,
}: {
  opinionId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Optimistic state
  const [optimisticLiked, setOptimisticLiked] = useState(initialLiked);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);

  // Track when a mutation just completed to prevent useEffect from overriding state
  const lastMutationTimeRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  // Keep refs to latest initial values for error rollback
  const initialLikedRef = useRef(initialLiked);
  const initialCountRef = useRef(initialCount);

  // Update refs when initial values change
  useEffect(() => {
    initialLikedRef.current = initialLiked;
    initialCountRef.current = initialCount;
  }, [initialLiked, initialCount]);

  const likeMutation = useMutation({
    mutationFn: () => opinionsApi.likeOpinion(opinionId),
    onMutate: () => {
      // Optimistic update
      setOptimisticLiked(true);
      setOptimisticCount((c) => c + 1);
    },
    onSuccess: (data: OpinionLikeToggleResponse) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.likeCount);
      // Mark mutation completion time
      lastMutationTimeRef.current = Date.now();
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['opinions'] });
    },
    onError: () => {
      // Rollback to latest initial values
      setOptimisticLiked(initialLikedRef.current);
      setOptimisticCount(initialCountRef.current);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => opinionsApi.unlikeOpinion(opinionId),
    onMutate: () => {
      setOptimisticLiked(false);
      setOptimisticCount((c) => Math.max(0, c - 1));
    },
    onSuccess: (data: OpinionLikeToggleResponse) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.likeCount);
      // Mark mutation completion time
      lastMutationTimeRef.current = Date.now();
      queryClient.invalidateQueries({ queryKey: ['opinions'] });
    },
    onError: () => {
      // Rollback to latest initial values
      setOptimisticLiked(initialLikedRef.current);
      setOptimisticCount(initialCountRef.current);
    },
  });

  // Initialize on mount
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
      return;
    }
  }, []);

  // Sync state with initial values when they change, but only if:
  // 1. No mutation is pending
  // 2. No mutation completed recently (within 1000ms) - this prevents override after query refetch
  //    But if values match what we expect after mutation, allow sync earlier
  useEffect(() => {
    const isPending = likeMutation.isPending || unlikeMutation.isPending;
    const timeSinceLastMutation = lastMutationTimeRef.current
      ? Date.now() - lastMutationTimeRef.current
      : Infinity;

    // Don't sync if mutation is currently pending
    if (isPending) {
      return;
    }

    // If mutation just completed, wait a bit for query refetch to complete
    // But if the new initial values match our optimistic state, sync immediately
    if (timeSinceLastMutation < 1000) {
      // Check if the new initial values match what we expect after mutation
      // If they do, it means query refetch completed and we should sync
      const expectedLiked = lastMutationTimeRef.current !== null 
        ? optimisticLiked 
        : initialLiked;
      
      if (initialLiked === expectedLiked && initialCount === optimisticCount) {
        // Query refetch completed and values match, sync is safe
        setOptimisticLiked(initialLiked);
        setOptimisticCount(initialCount);
      }
      return;
    }

    // Always sync when initial values change (this handles page refresh and initial load)
    setOptimisticLiked(initialLiked);
    setOptimisticCount(initialCount);
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
      console.warn('Login required to like opinion');
      return;
    }

    if (!user?.emailVerified) {
      console.warn('Email verification required to like opinion');
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
