
import axios from "axios";





const API_BASE_URL = "http://localhost:8000";



let logoutHandler: (() => void) | null = null;

export const configureApi = (logout: () => void) => {
  logoutHandler = logout;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token is expired (401) 
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/refresh_token`, {
            refresh_token: refreshToken,
          });
          

          const newToken = res.data.access_token;
          localStorage.setItem("token", newToken);

          // Set new token on original request and retry
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout()
          if (logoutHandler) logoutHandler();
          return Promise.reject(refreshError);
        }
      } else {
        if (logoutHandler) logoutHandler();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
