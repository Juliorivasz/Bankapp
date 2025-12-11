import type { DashboardResponse } from '../types/client/dashboard.types';
import apiClient from './apiClient';

export const dashboardService = {
  getDashboard: async (from?: Date, to?: Date): Promise<DashboardResponse> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from.toISOString());
    if (to) params.append('to', to.toISOString());

    const { data } = await apiClient.get<DashboardResponse>(`/cliente/dashboard?${params.toString()}`);
    return data;
  },
};
