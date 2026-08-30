import { api } from "./api";
import type { Alarm, AlarmStatus, CreateAlarmDto, UpdateAlarmStatusDto, PaginatedResponse } from "../types/alarm";

export const alarmService = {
  getAll: async (page: number = 1, limit: number = 20, status?: AlarmStatus): Promise<PaginatedResponse<Alarm>> => {
    const response = await api.get<PaginatedResponse<Alarm>>("/alarms", {
      params: {
        page,
        limit,
        status: status || undefined,
      },
    });
    return response.data;
  },

  getByDevice: async (deviceId: string): Promise<Alarm[]> => {
    const response = await api.get<Alarm[]>(`/alarms/device/${deviceId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Alarm> => {
    const response = await api.get<Alarm>(`/alarms/${id}`);
    return response.data;
  },

  create: async (data: CreateAlarmDto): Promise<Alarm> => {
    const response = await api.post<Alarm>("/alarms", data);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateAlarmStatusDto): Promise<Alarm> => {
    const response = await api.patch<Alarm>(`/alarms/${id}/status`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alarms/${id}`);
  },
};
