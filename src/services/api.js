import axios from "axios";

const REMOTE_API_BASE = "https://sysc-music.onrender.com/api";
const LOCAL_API_BASE = "http://localhost:5000/api";

const FALLBACK_API_BASE = import.meta.env.PROD
  ? REMOTE_API_BASE
  : LOCAL_API_BASE;

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
  return [LOCAL_API_BASE, REMOTE_API_BASE];
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
      const response = await requestFn(baseURL);
      if (api.defaults.baseURL !== baseURL) {
        api.defaults.baseURL = baseURL;
      }
      return response;
    } catch (error) {
      lastError = error;
      const isNetworkError = !error?.response && error?.code === "ERR_NETWORK";
      const status = Number(error?.response?.status || 0);
      const isRetryableStatus = retryOnStatuses.includes(status);
      const shouldRetry = (isNetworkError || isRetryableStatus) && i < bases.length - 1;
      if (!shouldRetry) throw error;
    }
  }

  throw lastError;
};

const getWithFallback = async (url, config = {}) =>
  requestWithFallback((baseURL) => api.get(url, { ...config, baseURL }), {
    retryOnStatuses: [500, 502, 503, 504],
  });

export { getApiBaseCandidates, getWithFallback, requestWithFallback };
export default api;
