import { apiClient } from './client';
import type {
  RevisionDTO,
  UpdateRevisionInput,
  StatusChangeResponse,
  MyRevisionsResponse,
} from '@emc3/shared';

// ═══════════════════════════════════════════════════════════
// Revisions API
// ═══════════════════════════════════════════════════════════

export const revisionsApi = {
  /**
   * Get revision by ID
   */
  getById: async (id: string): Promise<RevisionDTO> => {
    return apiClient.get(`/revisions/${id}`);
  },

  /**
   * Update revision
   */
  update: async (id: string, input: UpdateRevisionInput): Promise<RevisionDTO> => {
    return apiClient.put(`/revisions/${id}`, input);
  },

  /**
   * Delete draft revision
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/revisions/${id}`);
  },

  /**
   * Submit to review
   */
  submit: async (id: string): Promise<StatusChangeResponse> => {
    return apiClient.post(`/revisions/${id}/submit`);
  },

  /**
   * Withdraw from review
   */
  withdraw: async (id: string): Promise<StatusChangeResponse> => {
    return apiClient.post(`/revisions/${id}/withdraw`);
  },
};

// ═══════════════════════════════════════════════════════════
// My Revisions API
// ═══════════════════════════════════════════════════════════

export const myRevisionsApi = {
  /**
   * Get my revisions/drafts
   */
  list: async (params?: {
    status?: string;
    limit?: number;
    cursor?: string;
  }): Promise<MyRevisionsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    
    const query = searchParams.toString();
    return apiClient.get(`/me/revisions${query ? `?${query}` : ''}`);
  },
};

