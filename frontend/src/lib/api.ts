import axios from 'axios';
import { clearCachedSession, getCachedAccessToken, getSessionSnapshot } from './supabase';

type ApiErrorPayload = {
  detail?: string;
};

function resolveApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const fallbackUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : undefined;
  const baseUrl = configuredUrl || fallbackUrl;

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required outside development.');
  }

  return `${baseUrl.replace(/\/+$/, '')}/api/v1`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.request.use(async (config) => {
  const accessToken = getCachedAccessToken() ?? (await getSessionSnapshot())?.access_token;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearCachedSession();
    }

    return Promise.reject(error);
  },
);

export function getApiErrorDetail(error: unknown) {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return undefined;
  }

  return error.response?.data?.detail;
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function isForbiddenError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

export function isPendingApprovalError(error: unknown) {
  return isForbiddenError(error) && getApiErrorDetail(error) === 'Waiting for admin approval';
}

export function isServerError(error: unknown) {
  return axios.isAxiosError(error) && (error.response?.status ?? 0) >= 500;
}

export function isNetworkError(error: unknown) {
  return axios.isAxiosError(error) && !error.response;
}

export default api;
