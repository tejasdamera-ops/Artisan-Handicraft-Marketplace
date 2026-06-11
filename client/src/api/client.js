import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("artisan_auth") || "{}");
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const auth = JSON.parse(localStorage.getItem("artisan_auth") || "{}");

    if (error.response?.status === 401 && auth.refreshToken && !original._retry) {
      original._retry = true;
      const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken: auth.refreshToken });
      const nextAuth = { ...auth, accessToken: data.accessToken, user: data.user };
      localStorage.setItem("artisan_auth", JSON.stringify(nextAuth));
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    }

    return Promise.reject(error);
  }
);

export default api;
