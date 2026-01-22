import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { adminArticlesApi } from '../api/admin.api';

interface AdminArticleListParams {
  query?: string;
  status?: 'PUBLISHED' | 'REMOVED';
  authorId?: string;
  page?: number;
  limit?: number;
}

export function useAdminArticles(params: AdminArticleListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'articles', params],
    queryFn: () => adminArticlesApi.list(params),
  });
}

export function useRemoveArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ articleId, reason }: { articleId: string; reason: string }) =>
      adminArticlesApi.remove(articleId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}

export function useRestoreArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => adminArticlesApi.restore(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
    },
  });
}
