import { useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getOpinions,
  createOpinion,
  updateOpinion,
  likeOpinion,
  unlikeOpinion,
  createReply,
  updateReply,
} from '../api/opinions.api';
import { useAuth } from '../contexts/AuthContext';
import type {
  OpinionListParams,
  OpinionLikeToggleResponse,
  OpinionDTO,
  OpinionReplyDTO,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// useOpinions - List opinions with infinite scroll
// ═══════════════════════════════════════════════════════════

interface UseOpinionsOptions {
  articleId: string;
  sort?: 'helpful' | 'new';
  limit?: number;
  enabled?: boolean;
}

export function useOpinions({
  articleId,
  sort = 'helpful',
  limit = 10,
  enabled = true,
}: UseOpinionsOptions) {
  return useInfiniteQuery({
    queryKey: ['opinions', articleId, { sort, limit }],
    queryFn: async ({ pageParam }) => {
      const params: OpinionListParams = {
        sort,
        limit,
        cursor: pageParam,
      };
      return getOpinions(articleId, params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });
}

// ═══════════════════════════════════════════════════════════
// useCreateOpinion
// ═══════════════════════════════════════════════════════════

export function useCreateOpinion(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bodyMarkdown: string) =>
      createOpinion(articleId, { bodyMarkdown }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['opinions', articleId],
      });
    },
  });
}

// ═══════════════════════════════════════════════════════════
// useUpdateOpinion
// ═══════════════════════════════════════════════════════════

export function useUpdateOpinion(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opinionId,
      bodyMarkdown,
    }: {
      opinionId: string;
      bodyMarkdown: string;
    }) => updateOpinion(opinionId, { bodyMarkdown }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['opinions', articleId],
      });
    },
  });
}

// ═══════════════════════════════════════════════════════════
// useOpinionLike - Like/unlike with optimistic updates
// ═══════════════════════════════════════════════════════════

interface UseOpinionLikeOptions {
  opinionId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function useOpinionLike({
  opinionId,
  initialLiked,
  initialCount,
}: UseOpinionLikeOptions) {
  const { user, isAuthenticated } = useAuth();

  const [optimisticLiked, setOptimisticLiked] = useState(initialLiked);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);

  const likeMutation = useMutation({
    mutationFn: () => likeOpinion(opinionId),
    onMutate: () => {
      setOptimisticLiked(true);
      setOptimisticCount((c) => c + 1);
    },
    onSuccess: (data: OpinionLikeToggleResponse) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.likeCount);
    },
    onError: () => {
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeOpinion(opinionId),
    onMutate: () => {
      setOptimisticLiked(false);
      setOptimisticCount((c) => Math.max(0, c - 1));
    },
    onSuccess: (data: OpinionLikeToggleResponse) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.likeCount);
    },
    onError: () => {
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
    },
  });

  const toggle = useCallback(() => {
    if (!isAuthenticated) {
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

// ═══════════════════════════════════════════════════════════
// useCreateReply
// ═══════════════════════════════════════════════════════════

export function useCreateReply(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opinionId,
      bodyMarkdown,
    }: {
      opinionId: string;
      bodyMarkdown: string;
    }) => createReply(opinionId, { bodyMarkdown }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['opinions', articleId],
      });
    },
  });
}

// ═══════════════════════════════════════════════════════════
// useUpdateReply
// ═══════════════════════════════════════════════════════════

export function useUpdateReply(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      opinionId,
      bodyMarkdown,
    }: {
      opinionId: string;
      bodyMarkdown: string;
    }) => updateReply(opinionId, { bodyMarkdown }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['opinions', articleId],
      });
    },
  });
}

