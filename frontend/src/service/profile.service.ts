import apiClient from './apiClient';
import type { ProfileData, UpdateProfileData, ChangePasswordData } from '../types/client/profile.types';

export const profileService = {
  getProfile: async (): Promise<ProfileData> => {
    const response = await apiClient.get<ProfileData>('/cliente/perfil');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<ProfileData> => {
    const response = await apiClient.put<ProfileData>('/cliente/perfil', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.put('/cliente/perfil/password', data);
  }
};
