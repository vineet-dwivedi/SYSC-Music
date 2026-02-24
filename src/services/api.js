import axios from "axios";

const REMOTE_API_BASE = "https://sysc-music.onrender.com/api";
const LOCAL_API_BASE = "http://localhost:5000/api";

const FALLBACK_API_BASE = import.meta.env.PROD
  ? REMOTE_API_BASE
  : REMOTE_API_BASE;

const resolveApiBase = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE).trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return /\/api$/i.test(withoutTrailingSlash) ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

const isLocalApiBase = (value) => /localhost:5000|127\.0\.0\.1:5000/i.test(value || "");

const getApiBaseCandidates = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (configured) {
    const primary = resolveApiBase();
    if (import.meta.env.PROD || !isLocalApiBase(primary)) return [primary];
    return [primary, REMOTE_API_BASE];
  }

  if (import.meta.env.PROD) return [REMOTE_API_BASE];
  return [REMOTE_API_BASE, LOCAL_API_BASE];
};

const api = axios.create({
  baseURL: getApiBaseCandidates()[0],
});

const getWithFallback = async (url, config = {}) => {
  const bases = getApiBaseCandidates();
  let lastError;

  for (let i = 0; i < bases.length; i += 1) {
    const baseURL = bases[i];
    try {
      const response = await api.get(url, { ...config, baseURL });
      if (api.defaults.baseURL !== baseURL) {
        api.defaults.baseURL = baseURL;
      }
      return response;
    } catch (error) {
      lastError = error;
      const isNetworkError = !error?.response && error?.code === "ERR_NETWORK";
      const shouldRetry = isNetworkError && i < bases.length - 1;
      if (!shouldRetry) throw error;
    }
  }

  throw lastError;
};

export { getWithFallback };
export default api;
