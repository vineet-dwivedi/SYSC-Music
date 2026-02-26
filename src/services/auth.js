import api, { requestWithFallback } from './api.js';

const postWithFallback = (url, payload, options = {}) =>
  requestWithFallback(
    (baseURL) => api.post(url, payload, { baseURL }),
    { retryOnStatuses: [404], ...options },
  );

const normalizeAuthMode = (mode) =>
  String(mode ?? '').trim().toLowerCase() === 'register' ? 'register' : 'login';

const loginWithGoogle = async (credential, mode = 'login') => {
  const response = await postWithFallback('/auth/google', {
    credential,
    mode: normalizeAuthMode(mode),
  });
  return response.data;
};

export {
  loginWithGoogle,
};
