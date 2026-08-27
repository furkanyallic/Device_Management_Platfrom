import { api } from "./api";
import type { Device, CreateDeviceDto, UpdateDeviceDto } from "../types/device";

export const deviceService = {
  getAll: async (): Promise<Device[]> => {
    const response = await api.get<Device[]>("/devices");
    return response.data;
  },

  getById: async (id: string): Promise<Device> => {
    const response = await api.get<Device>(`/devices/${id}`);
    return response.data;
  },

  create: async (data: CreateDeviceDto): Promise<Device> => {
    const response = await api.post<Device>("/devices", data);
    return response.data;
  },

  update: async (id: string, data: UpdateDeviceDto): Promise<Device> => {
    const response = await api.patch<Device>(`/devices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/devices/${id}`);
  },
};
