import { api } from "./api";
import type { Notification } from "../types/notification";
import type { PaginatedResponse } from "../types/alarm";

export const notificationService = {
  getAll: async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<PaginatedResponse<Notification>>("/notifications", {
      params: { page, limit },
    });
    return response.data;
  },
};
