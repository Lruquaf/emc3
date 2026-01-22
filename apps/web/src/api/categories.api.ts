import { apiClient } from './client';
import type {
  CategoryTreeResponse,
  CategoryWithParentDTO,
  AdminCategoryDTO,
  CategoryMutationResponse,
  DeleteCategoryResponse,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReparentCategoryInput,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Public Category API
// ═══════════════════════════════════════════════════════════

export const categoryApi = {
  /**
   * Get category tree (public)
   */
  getTree: async (): Promise<CategoryTreeResponse> => {
    return apiClient.get('/categories/tree');
  },

  /**
   * Get category by slug
   */
  getBySlug: async (slug: string): Promise<CategoryWithParentDTO> => {
    return apiClient.get(`/categories/${slug}`);
  },

  /**
   * Get category descendants (for feed filtering)
   */
  getDescendants: async (slug: string): Promise<{ categoryIds: string[] }> => {
    return apiClient.get(`/categories/${slug}/descendants`);
  },
};

// ═══════════════════════════════════════════════════════════
// Admin Category API
// ═══════════════════════════════════════════════════════════

export const adminCategoryApi = {
  /**
   * Get all categories with stats
   */
  getAll: async (): Promise<AdminCategoryDTO[]> => {
    return apiClient.get('/admin/categories');
  },

  /**
   * Create category
   */
  create: async (input: CreateCategoryInput): Promise<CategoryMutationResponse> => {
    return apiClient.post('/admin/categories', input);
  },

  /**
   * Update category
   */
  update: async (
    id: string,
    input: UpdateCategoryInput
  ): Promise<CategoryMutationResponse> => {
    return apiClient.put(`/admin/categories/${id}`, input);
  },

  /**
   * Reparent category
   */
  reparent: async (
    id: string,
    input: ReparentCategoryInput
  ): Promise<CategoryMutationResponse> => {
    return apiClient.put(`/admin/categories/${id}/parent`, input);
  },

  /**
   * Delete category (and subtree)
   */
  delete: async (id: string): Promise<DeleteCategoryResponse> => {
    return apiClient.delete(`/admin/categories/${id}`);
  },
};

