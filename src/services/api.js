import axios from "axios";

const REMOTE_API_BASE = "https://sysc-music.onrender.com/api";
const LOCAL_API_BASE = "http://localhost:5000/api";
const LOOPBACK_API_BASE = "http://127.0.0.1:5000/api";

const FALLBACK_API_BASE = import.meta.env.PROD
  ? REMOTE_API_BASE
  : LOCAL_API_BASE;

const normalizeApiBase = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  return /\/api$/i.test(withoutTrailingSlash) ? withoutTrailingSlash : `${withoutTrailingSlash}/api`;
};

const resolveApiBase = () => {
  return normalizeApiBase(import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE);
};

const isLocalApiBase = (value) => /localhost:5000|127\.0\.0\.1:5000/i.test(value || "");

const getBrowserLocalApiBase = () => {
  if (typeof window === "undefined") return LOCAL_API_BASE;

  const hostname = String(window.location?.hostname || "").trim();
  if (!hostname) return LOCAL_API_BASE;

  const protocol = window.location?.protocol === "https:" ? "http:" : window.location?.protocol || "http:";
  return normalizeApiBase(`${protocol}//${hostname}:5000`);
};

const getLocalApiBases = () => {
  const candidates = [getBrowserLocalApiBase(), LOCAL_API_BASE, LOOPBACK_API_BASE].filter(Boolean);
  return [...new Set(candidates)];
};

const getRequestTimeoutMs = (baseURL) => {
  const configured = Number.parseInt(import.meta.env.VITE_API_TIMEOUT_MS ?? "", 10);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return isLocalApiBase(baseURL) ? 1500 : 8000;
};

const getApiBaseCandidates = () => {
  const configured = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (configured) {
    const primary = resolveApiBase();
    if (import.meta.env.PROD || !isLocalApiBase(primary)) return [primary];
    return [primary, REMOTE_API_BASE];
  }

  if (import.meta.env.PROD) return [REMOTE_API_BASE];
  return [...getLocalApiBases(), REMOTE_API_BASE];
};

const api = axios.create({
  baseURL: getApiBaseCandidates()[0],
});

const requestWithFallback = async (requestFn, options = {}) => {
  const { retryOnStatuses = [] } = options;
  const bases = getApiBaseCandidates();
  let lastError;

  for (let i = 0; i < bases.length; i += 1) {
    const baseURL = bases[i];
    try {
      const response = await requestFn(baseURL, getRequestTimeoutMs(baseURL));
      if (api.defaults.baseURL !== baseURL) {
        api.defaults.baseURL = baseURL;
      }
      return response;
    } catch (error) {
      lastError = error;
      const code = String(error?.code || "").toUpperCase();
      const message = String(error?.message || "").toLowerCase();
      const isNetworkError =
        !error?.response &&
        (code === "ERR_NETWORK" ||
          code === "ECONNABORTED" ||
          code === "ETIMEDOUT" ||
          message.includes("timeout"));
      const status = Number(error?.response?.status || 0);
      const isRetryableStatus = retryOnStatuses.includes(status);
      const shouldRetry = (isNetworkError || isRetryableStatus) && i < bases.length - 1;
      if (!shouldRetry) throw error;
    }
  }

  throw lastError;
};

const getWithFallback = async (url, config = {}) =>
  requestWithFallback((baseURL, timeout) => api.get(url, { ...config, baseURL, timeout }), {
    retryOnStatuses: [500, 502, 503, 504],
  });

export { getApiBaseCandidates, getWithFallback, requestWithFallback };
export default api;
