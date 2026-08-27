import { api } from "./api";
import type { TelemetryRecord } from "../types/telemetry";

export const telemetryService = {
  getLatestByDevice: async (deviceId: string, limit: number = 20): Promise<TelemetryRecord[]> => {
    const response = await api.get<TelemetryRecord[]>(`/telemetry/device/${deviceId}/latest`, {
      params: { limit },
    });
    return response.data;
  },

  getHistoryByDevice: async (deviceId: string, start?: string, end?: string): Promise<TelemetryRecord[]> => {
    const params: Record<string, string> = {};
    if (start) params.start = start;
    if (end) params.end = end;

    const response = await api.get<TelemetryRecord[]>(`/telemetry/device/${deviceId}/history`, {
      params,
    });
    return response.data;
  },
};
