import { api } from "./api";
import type { AlarmRule, CreateAlarmRuleDto, UpdateAlarmRuleDto } from "../types/alarm";

export const alarmRuleService = {
  getAll: async (): Promise<AlarmRule[]> => {
    const response = await api.get<AlarmRule[]>("/alarm-rules");
    return response.data;
  },

  getByDevice: async (deviceId: string): Promise<AlarmRule[]> => {
    const response = await api.get<AlarmRule[]>(`/alarm-rules/device/${deviceId}`);
    return response.data;
  },

  getById: async (id: string): Promise<AlarmRule> => {
    const response = await api.get<AlarmRule>(`/alarm-rules/${id}`);
    return response.data;
  },

  create: async (data: CreateAlarmRuleDto): Promise<AlarmRule> => {
    const response = await api.post<AlarmRule>("/alarm-rules", data);
    return response.data;
  },

  update: async (id: string, data: UpdateAlarmRuleDto): Promise<AlarmRule> => {
    const response = await api.patch<AlarmRule>(`/alarm-rules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alarm-rules/${id}`);
  },

  deleteByDevice: async (deviceId: string): Promise<void> => {
    await api.delete(`/alarm-rules/device/${deviceId}`);
  },
};
