export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
  },
  CASES: {
    LIST: '/api/v1/cases',
    DETAIL: (id: string | number) => `/api/v1/cases/${id}`,
  },
} as const;
