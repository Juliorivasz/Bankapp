import apiClient from './apiClient';
import type { DestinatarioDTO } from '../types/client/dashboard.types';

export const transferService = {
  getRecentRecipients: async (): Promise<DestinatarioDTO[]> => {
    const response = await apiClient.get<DestinatarioDTO[]>('/cliente/transferencias/destinatarios/recientes');
    return response.data;
  }
};
