import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔥 REQUIRED FOR REFRESH TOKEN COOKIE
  headers: {
    "Content-Type": "application/json",
  },
});

/* ==========================
   ACCESS TOKEN HELPERS
========================== */
const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

const setAccessToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

const clearAccessToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};

/* ==========================
   REQUEST INTERCEPTOR ✅
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
   RESPONSE INTERCEPTOR (OPTIONAL BUT GOOD)
========================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      localStorage.removeItem("user");
      localStorage.removeItem("features");

      // prevent infinite reload
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
