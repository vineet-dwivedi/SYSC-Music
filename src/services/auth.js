import api, { requestWithFallback } from './api.js';

const postWithFallback = (url, payload, options = {}) =>
  requestWithFallback(
    (baseURL) => api.post(url, payload, { baseURL }),
    { retryOnStatuses: [404], ...options },
  );

const loginWithGoogle = async (credential) => {
  const response = await postWithFallback('/auth/google', { credential });
  return response.data;
};

const requestRegisterOtp = async ({ name, mobile }) => {
  const response = await postWithFallback('/auth/mobile/register/request-otp', { name, mobile });
  return response.data;
};

const verifyRegisterOtp = async ({ name, mobile, otp }) => {
  const response = await postWithFallback('/auth/mobile/register/verify-otp', { name, mobile, otp });
  return response.data;
};

const requestLoginOtp = async ({ mobile }) => {
  const response = await postWithFallback('/auth/mobile/login/request-otp', { mobile });
  return response.data;
};

const verifyLoginOtp = async ({ mobile, otp }) => {
  const response = await postWithFallback('/auth/mobile/login/verify-otp', { mobile, otp });
  return response.data;
};

export {
  loginWithGoogle,
  requestLoginOtp,
  requestRegisterOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
};
