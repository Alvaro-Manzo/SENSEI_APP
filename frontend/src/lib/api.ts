import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Inyectar token JWT en cada request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sensei_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira, redirigir a login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sensei_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
