import { API_BASE } from "./api-url";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/autentificare";
    }
    return Promise.reject(error);
  },
);
