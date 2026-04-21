import api, { requestWithFallback } from './api.js';

const postWithFallback = (url, payload, options = {}) =>
  requestWithFallback(
    (baseURL, timeout) => api.post(url, payload, { baseURL, timeout }),
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

const loginWithEmail = async (email, password) => {
  const response = await postWithFallback('/auth/email/login', {
    email: String(email ?? '').trim().toLowerCase(),
    password: String(password ?? '').trim(),
  });
  return response.data;
};

const registerWithEmail = async (email, password, confirmPassword, name) => {
  const response = await postWithFallback('/auth/email/register', {
    email: String(email ?? '').trim().toLowerCase(),
    password: String(password ?? '').trim(),
    confirmPassword: String(confirmPassword ?? '').trim(),
    name: String(name ?? '').trim(),
  });
  return response.data;
};

export {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
};
