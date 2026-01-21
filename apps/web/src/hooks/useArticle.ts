import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { articlesApi } from '../api/articles.api';
import type { CreateArticleInput } from '@emc3/shared';

/**
 * Hook for fetching article by slug
 */
export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: () => articlesApi.getBySlug(slug),
    enabled: !!slug,
  });
}

/**
 * Hook for creating new article
 */
export function useCreateArticle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateArticleInput) => articlesApi.create(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myRevisions'] });
      navigate(`/revision/${data.revisionId}/edit`);
    },
  });
}

/**
 * Hook for creating new revision (edit existing article)
 */
export function useCreateRevision() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) => articlesApi.createRevision(articleId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myRevisions'] });
      navigate(`/revision/${data.revisionId}/edit`);
    },
  });
}

/**
 * Hook for fetching revision history
 */
export function useRevisionHistory(articleId: string) {
  return useQuery({
    queryKey: ['revisionHistory', articleId],
    queryFn: () => articlesApi.getRevisionHistory(articleId),
    enabled: !!articleId,
  });
}

