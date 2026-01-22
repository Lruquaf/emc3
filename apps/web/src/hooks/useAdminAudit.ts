import { useInfiniteQuery } from '@tanstack/react-query';

import { adminAuditApi } from '../api/admin.api';

interface AuditLogListParams {
  action?: string;
  targetType?: string;
  targetId?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useAdminAuditLogs(params: AuditLogListParams = {}) {
  return useInfiniteQuery({
    queryKey: ['admin', 'audit', params],
    queryFn: ({ pageParam }) =>
      adminAuditApi.getLogs({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor ?? undefined : undefined,
  });
}
