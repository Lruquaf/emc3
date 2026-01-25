import { apiClient } from './client';
import type {
  ArticleReadDTO,
  CreateArticleInput,
  CreateArticleResponse,
  CreateRevisionResponse,
  RevisionHistoryItemDTO,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Article API
// ═══════════════════════════════════════════════════════════

export const articlesApi = {
  /**
   * Get article by ID
   */
  getById: async (articleId: string): Promise<ArticleReadDTO> => {
    return apiClient.get(`/articles/${articleId}`);
  },

  /**
   * Create new article
   */
  create: async (input: CreateArticleInput): Promise<CreateArticleResponse> => {
    return apiClient.post('/articles', input);
  },

  /**
   * Create new revision for existing article
   */
  createRevision: async (articleId: string): Promise<CreateRevisionResponse> => {
    return apiClient.post(`/articles/${articleId}/revisions`);
  },

  /**
   * Get revision history
   */
  getRevisionHistory: async (articleId: string): Promise<RevisionHistoryItemDTO[]> => {
    return apiClient.get(`/articles/${articleId}/revisions`);
  },
};

