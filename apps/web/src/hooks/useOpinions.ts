import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { opinionsApi } from '../api/opinions.api';
import type {
  OpinionListParams,
  CreateOpinionRequest,
  UpdateOpinionRequest,
  CreateReplyRequest,
  UpdateReplyRequest,
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
  const toggleMutation = useToggleOpinionLike();
  const queryClient = useQueryClient();

  // Get current state from query cache
  const queryData = queryClient.getQueriesData({ queryKey: ['opinions'] });
  let liked = initialLiked;
  let likeCount = initialCount;

  // Try to find current state from cache
  for (const [, data] of queryData) {
    if (data && typeof data === 'object' && 'items' in data) {
      const opinion = (data as { items: Array<{ id: string; viewerHasLiked: boolean; likeCount: number }> }).items.find(
        (op) => op.id === opinionId
      );
      if (opinion) {
        liked = opinion.viewerHasLiked;
        likeCount = opinion.likeCount;
        break;
      }
    }
  }

  return {
    liked,
    likeCount,
    toggle: () => {
      toggleMutation.mutate({ opinionId, isLiked: liked });
    },
    isLoading: toggleMutation.isPending,
  };
}
