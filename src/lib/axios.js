import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 REQUIRED FOR COOKIES
  headers: {
    "Content-Type": "application/json",
  },
});

/* ==========================
   ACCESS TOKEN HELPERS
========================== */
const getAccessToken = () => localStorage.getItem("accessToken");
const setAccessToken = (token) =>
  localStorage.setItem("accessToken", token);
const clearAccessToken = () =>
  localStorage.removeItem("accessToken");

/* ==========================
   REQUEST INTERCEPTOR
========================== */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ==========================
   RESPONSE INTERCEPTOR
========================== */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❗ Prevent infinite loop
    if (
      error.response?.status === 401 &&
      originalRequest.url === "/auth/refresh"
    ) {
      clearAccessToken();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        // ✅ CORRECT ENDPOINT
        const res = await api.post("/auth/refresh");

        const newAccessToken = res.data.accessToken;
        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
