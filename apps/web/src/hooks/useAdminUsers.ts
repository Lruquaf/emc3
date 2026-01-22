import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { adminUsersApi } from '../api/admin.api';

interface AdminUserListParams {
  query?: string;
  role?: 'ADMIN' | 'REVIEWER';
  isBanned?: boolean;
  page?: number;
  limit?: number;
}

export function useAdminUsers(params: AdminUserListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminUsersApi.list(params),
  });
}

export function useAdminUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => (userId ? adminUsersApi.getDetail(userId) : null),
    enabled: !!userId,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminUsersApi.ban(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminUsersApi.unban(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
      action,
    }: {
      userId: string;
      role: 'ADMIN' | 'REVIEWER';
      action: 'grant' | 'revoke';
    }) => adminUsersApi.updateRole(userId, role, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
