import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

// In-memory token storage (never localStorage for JWTs in prod)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Callback triggered when refresh fails (e.g. redirect to login)
let onUnauthenticated: (() => void) | null = null;
export const setOnUnauthenticated = (cb: () => void) => {
  onUnauthenticated = cb;
};

// Refresh queue — prevents multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: { resolve: (v?: unknown) => void; reject: (r?: unknown) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const createRequestInterceptor = () => ({
  onFulfilled: (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  onRejected: (error: AxiosError) => Promise.reject(error),
});

const createResponseInterceptor = (instance: AxiosInstance) => ({
  onFulfilled: (response: AxiosResponse) => response.data,
  onRejected: async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!original || error.response?.status !== 401) return Promise.reject(error);
    if (original._retry) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => instance(original))
        .catch(err => Promise.reject(err));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // TODO: implement refresh token endpoint when backend supports it
      // For now, clear session and redirect to login
      throw new Error('No refresh token support yet');
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      setAccessToken(null);
      if (onUnauthenticated) onUnauthenticated();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
});

const applyInterceptors = (instance: AxiosInstance) => {
  const req = createRequestInterceptor();
  const res = createResponseInterceptor(instance);
  instance.interceptors.request.use(req.onFulfilled, req.onRejected);
  instance.interceptors.response.use(res.onFulfilled, res.onRejected);
};

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

applyInterceptors(api);
