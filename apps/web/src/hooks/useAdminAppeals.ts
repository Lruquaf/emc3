import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { adminAppealsApi } from '../api/admin.api';

interface AppealListParams {
  status?: 'OPEN' | 'CLOSED';
  page?: number;
  limit?: number;
}

export function useAdminAppeals(params: AppealListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'appeals', params],
    queryFn: () => adminAppealsApi.list(params),
  });
}

export function useAdminAppealDetail(appealId: string | null) {
  return useQuery({
    queryKey: ['admin', 'appeals', appealId],
    queryFn: () => (appealId ? adminAppealsApi.getDetail(appealId) : null),
    enabled: !!appealId,
  });
}

export function useSendAppealMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appealId, message }: { appealId: string; message: string }) =>
      adminAppealsApi.sendMessage(appealId, message),
    onSuccess: (_, { appealId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appeals', appealId] });
    },
  });
}

export function useCloseAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appealId,
      resolution,
      message,
    }: {
      appealId: string;
      resolution?: 'upheld' | 'overturned';
      message?: string;
    }) => adminAppealsApi.close(appealId, resolution, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] });
    },
  });
}
