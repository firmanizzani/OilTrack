import api from './api';
import type { LoginPayload, RegisterPayload, ApiResponse, User } from '@/types';

interface AuthData {
  user: User;
  token: string;
}

export const authService = {
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload) => {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', payload);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data;
  },
};
