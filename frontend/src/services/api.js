import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle expired access tokens (401) by refreshing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/refresh", {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });

          const newAccessToken = res.data.access_token;
          localStorage.setItem("access_token", newAccessToken);

          // Retry original request with new token
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api.request(error.config);

        } catch (err) {
          console.error("Refresh token expired. Logging out.");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
