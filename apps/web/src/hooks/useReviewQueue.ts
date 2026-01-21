import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { adminReviewApi } from '@/api/admin.api';
import type { GiveFeedbackInput } from '@emc3/shared';

/**
 * Hook for review queue data
 */
export function useReviewQueue(options?: {
  status?: string;
  authorId?: string;
  categoryId?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['reviewQueue', options],
    queryFn: () => adminReviewApi.getReviewQueue(options),
  });
}

/**
 * Hook for revision detail
 */
export function useRevisionDetail(id: string) {
  return useQuery({
    queryKey: ['revisionDetail', id],
    queryFn: () => adminReviewApi.getRevisionDetail(id),
    enabled: !!id,
  });
}

/**
 * Hook for giving feedback
 */
export function useGiveFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GiveFeedbackInput }) =>
      adminReviewApi.giveFeedback(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['revisionDetail', id] });
    },
  });
}

/**
 * Hook for approving revision
 */
export function useApproveRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminReviewApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      queryClient.invalidateQueries({ queryKey: ['revisionDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['publishQueue'] });
    },
  });
}

