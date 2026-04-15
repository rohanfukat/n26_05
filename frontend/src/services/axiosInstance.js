import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../apiurls.ts";

// ─────────────────────────────────────────────────────────────────────────────
//  Cookie key used to store the JWT token
// ─────────────────────────────────────────────────────────────────────────────
export const TOKEN_COOKIE_KEY = "nirman_token";
export const USER_COOKIE_KEY = "nirman_user";

// ─────────────────────────────────────────────────────────────────────────────
//  Axios instance — all backend calls go through here
// ─────────────────────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send cookies cross-origin if needed
});

// ── Request interceptor: attach JWT from cookie on every request ──────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_COOKIE_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: normalise error shape ───────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface the backend `detail` message when available
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(detail));
  },
);

export default axiosInstance;
