import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { revisionsApi } from '../api/revisions.api';
import type { UpdateRevisionInput } from '@emc3/shared';

/**
 * Hook for fetching revision by ID
 */
export function useRevision(id: string) {
  return useQuery({
    queryKey: ['revision', id],
    queryFn: () => revisionsApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook for updating revision
 */
export function useUpdateRevision(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRevisionInput) => revisionsApi.update(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(['revision', id], data);
      queryClient.invalidateQueries({ queryKey: ['myRevisions'] });
    },
  });
}

/**
 * Hook for deleting draft revision
 */
export function useDeleteRevision() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revisionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRevisions'] });
      navigate('/me/drafts');
    },
  });
}

/**
 * Hook for submitting revision to review
 */
export function useSubmitRevision(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => revisionsApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision', id] });
      queryClient.invalidateQueries({ queryKey: ['myRevisions'] });
    },
  });
}

/**
 * Hook for withdrawing revision from review
 */
export function useWithdrawRevision(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => revisionsApi.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revision', id] });
      queryClient.invalidateQueries({ queryKey: ['myRevisions'] });
    },
  });
}

