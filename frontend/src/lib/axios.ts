import axios from "axios";
import { useAuthStore } from "../stores/auth";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8080/api"
      : "/api",
  withCredentials: true, //ko có client bị logout liên tục vì kh có cookie
});
// gắn access token vào req header
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // những api không cần check
    if (
      originalRequest.url.includes("/auth/sign-in") ||
      originalRequest.url.includes("/auth/sign-up") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;

      try {
        const res = await api.post("/auth/refresh", { withCredentials: true });
        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default api;
