import { useQuery } from '@tanstack/react-query';

import { categoryApi } from '@/api/categories.api';

/**
 * Hook for category tree data (cached)
 */
export function useCategoryTree() {
  return useQuery({
    queryKey: ['categoryTree'],
    queryFn: categoryApi.getTree,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
  });
}

/**
 * Hook for category by slug
 */
export function useCategoryBySlug(slug: string | null) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryApi.getBySlug(slug!),
    enabled: !!slug,
  });
}

/**
 * Hook for category descendants (for feed filtering)
 */
export function useCategoryDescendants(slug: string | null) {
  return useQuery({
    queryKey: ['categoryDescendants', slug],
    queryFn: () => categoryApi.getDescendants(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

