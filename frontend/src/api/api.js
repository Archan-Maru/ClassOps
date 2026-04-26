import axios from "axios";

function normalizeApiBaseUrl(rawUrl) {
  const fallback = "http://localhost:5000/api";

  if (!rawUrl) {
    return fallback;
  }

  let normalized = rawUrl.trim();

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    normalized = normalized.replace(/^http:\/\//i, "https://");
  }

  normalized = normalized.replace(/\/+$/, "");

  if (!normalized.endsWith("/api")) {
    normalized = `${normalized}/api`;
  }

  return normalized;
}

const baseURL = normalizeApiBaseUrl(import.meta.env?.VITE_API_BASE_URL);

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
