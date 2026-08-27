import { api } from "./api";
import type { Notification } from "../types/notification";

export const notificationService = {
  getAll: async (limit: number = 20): Promise<Notification[]> => {
    const response = await api.get<Notification[]>("/notifications", {
      params: { limit },
    });
    return response.data;
  },
};
