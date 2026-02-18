import axios from "axios";

const FALLBACK_API_BASE = import.meta.env.PROD
  ? "http://sysc-music.onrender.com/api"
  : "http://localhost:5000/api";

const resolveApiBase = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE).trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return /\/api$/i.test(withoutTrailingSlash) ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

const api = axios.create({
  baseURL: resolveApiBase(),
});

export default api;
