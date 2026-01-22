import { apiClient } from './client';
import type { MyAppealDTO } from '@emc3/shared';

export const appealApi = {
  /** Get current user's appeal (if banned) */
  getMyAppeal: async (): Promise<MyAppealDTO> => {
    return apiClient.get<MyAppealDTO>('/appeals/me');
  },

  /** Create a new appeal */
  create: async (reason: string): Promise<MyAppealDTO> => {
    return apiClient.post<MyAppealDTO>('/appeals', { reason });
  },

  /** Send a message in the appeal */
  sendMessage: async (message: string): Promise<{ id: string }> => {
    return apiClient.post<{ id: string }>('/appeals/message', { message });
  },
};
