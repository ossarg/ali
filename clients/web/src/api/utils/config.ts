export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
  },
  CASES: {
    LIST: '/api/v1/cases',
    DETAIL: (id: string | number) => `/api/v1/cases/${id}`,
  },
  CASE_EVENTS: {
    METRICS:  '/api/v1/case-events/metrics',
    APPROVED: '/api/v1/case-events/approved',
    PENDING:  '/api/v1/case-events/pending',
    REVIEW:   (id: string) => `/api/v1/case-events/${id}/review`,
  },
} as const;
