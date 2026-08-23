import api from './api';
import type { ApiResponse, Vehicle, VehiclePayload } from '@/types';

export const vehicleService = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<{ vehicles: Vehicle[] }>>('/vehicles');
    return data;
  },

  getOne: async (id: number) => {
    const { data } = await api.get<ApiResponse<{ vehicle: Vehicle }>>(`/vehicles/${id}`);
    return data;
  },

  create: async (payload: VehiclePayload) => {
    const { data } = await api.post<ApiResponse<{ vehicle: Vehicle }>>('/vehicles', payload);
    return data;
  },

  update: async (id: number, payload: Partial<VehiclePayload>) => {
    const { data } = await api.put<ApiResponse<{ vehicle: Vehicle }>>(`/vehicles/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/vehicles/${id}`);
    return data;
  },
};
