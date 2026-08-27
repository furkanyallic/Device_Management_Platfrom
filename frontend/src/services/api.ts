import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3010/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
