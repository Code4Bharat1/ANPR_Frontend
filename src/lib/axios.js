import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
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
const setAccessToken = (token) => localStorage.setItem("accessToken", token);
const clearAccessToken = () => localStorage.removeItem("accessToken");

export default api;
