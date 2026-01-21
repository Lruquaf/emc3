import { useInfiniteQuery } from '@tanstack/react-query';

import { myRevisionsApi } from '../api/revisions.api';

/**
 * Hook for fetching user's revisions/drafts with infinite scroll
 */
export function useMyRevisions(statusFilter?: string) {
  return useInfiniteQuery({
    queryKey: ['myRevisions', statusFilter],
    queryFn: ({ pageParam }) =>
      myRevisionsApi.list({
        status: statusFilter || undefined,
        limit: 20,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
  });
}

