import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { adminPublishApi } from '@/api/admin.api';

/**
 * Hook for publish queue data
 */
export function usePublishQueue(options?: { sort?: string }) {
  return useQuery({
    queryKey: ['publishQueue', options],
    queryFn: () => adminPublishApi.getPublishQueue(options),
  });
}

/**
 * Hook for publishing revision
 */
export function usePublishRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminPublishApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishQueue'] });
      queryClient.invalidateQueries({ queryKey: ['reviewQueue'] });
      // Invalidate any article queries that might be affected
      queryClient.invalidateQueries({ queryKey: ['article'] });
    },
  });
}

