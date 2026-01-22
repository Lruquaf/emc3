import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { adminCategoryApi } from '@/api/categories.api';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@emc3/shared';

/**
 * Hook for admin categories list
 */
export function useAdminCategories() {
  return useQuery({
    queryKey: ['adminCategories'],
    queryFn: adminCategoryApi.getAll,
  });
}

/**
 * Hook for creating category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => adminCategoryApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
    },
  });
}

/**
 * Hook for updating category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      adminCategoryApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
    },
  });
}

/**
 * Hook for reparenting category
 */
export function useReparentCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newParentId }: { id: string; newParentId: string | null }) =>
      adminCategoryApi.reparent(id, { newParentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
    },
  });
}

/**
 * Hook for deleting category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminCategoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryTree'] });
    },
  });
}

