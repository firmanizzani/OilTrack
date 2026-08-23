import api from './api';
import type { ApiResponse, OilHistory, OilHistoryPayload, OilHistoryFilters, PaginationMeta } from '@/types';

interface OilHistoriesData {
  histories: OilHistory[];
  pagination: PaginationMeta;
}

interface VehicleHistoryData {
  vehicle: {
    id: number;
    name: string;
    type: string;
    licensePlate: string;
    brand: string;
    year: number;
    icon?: string;
    reminderSettings?: { kmInterval: number; monthInterval: number };
  };
  histories: OilHistory[];
}

export const oilHistoryService = {
  getAll: async (filters?: OilHistoryFilters) => {
    const params = new URLSearchParams();
    if (filters?.vehicleId) params.set('vehicleId', String(filters.vehicleId));
    if (filters?.dateFrom)  params.set('dateFrom',  filters.dateFrom);
    if (filters?.dateTo)    params.set('dateTo',    filters.dateTo);
    if (filters?.workshop)  params.set('workshop',  filters.workshop);
    if (filters?.page)      params.set('page',      String(filters.page));
    if (filters?.limit)     params.set('limit',     String(filters.limit));

    const { data } = await api.get<ApiResponse<OilHistoriesData>>(`/oil-history?${params}`);
    return data;
  },

  getByVehicle: async (vehicleId: number) => {
    const { data } = await api.get<ApiResponse<VehicleHistoryData>>(
      `/oil-history/vehicle/${vehicleId}`
    );
    return data;
  },

  create: async (payload: OilHistoryPayload) => {
    const { data } = await api.post<ApiResponse<{ history: OilHistory }>>('/oil-history', payload);
    return data;
  },

  update: async (id: number, payload: Partial<OilHistoryPayload>) => {
    const { data } = await api.put<ApiResponse<{ history: OilHistory }>>(`/oil-history/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await api.delete<ApiResponse<null>>(`/oil-history/${id}`);
    return data;
  },
};
