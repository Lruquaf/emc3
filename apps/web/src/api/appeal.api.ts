import { apiClient } from './client';
import type { MyAppealDTO } from '@emc3/shared';

export const appealApi = {
  /** Get current user's appeal (if banned) */
  getMyAppeal: async (): Promise<MyAppealDTO> => {
    return apiClient.get<MyAppealDTO>('/appeals/me');
  },

  /** Create a new appeal */
  create: async (message: string): Promise<MyAppealDTO> => {
    return apiClient.post<MyAppealDTO>('/appeals', { message });
  },

  /** Send a message in the appeal */
  sendMessage: async (appealId: string, message: string): Promise<{ id: string }> => {
    return apiClient.post<{ id: string }>(`/appeals/${appealId}/message`, { message });
  },
};
