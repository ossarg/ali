export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
  },
  CASES: {
    LIST: '/api/v1/cases',
    DETAIL: (id: string | number) => `/api/v1/cases/${id}`,
    EVENTS: (id: string | number) => `/api/v1/cases/${id}/events`,
  },
  CASE_EVENTS: {
    METRICS:  '/api/v1/activity/metrics',
    APPROVED: '/api/v1/activity/events/approved',
    PENDING:  '/api/v1/activity/events/pending',
    REVIEW:   (id: string) => `/api/v1/activity/events/${id}/review`,
    RESOLVE:  (id: string) => `/api/v1/activity/events/${id}/resolve`,
    UPDATE:   (id: string) => `/api/v1/activity/events/${id}`,
    DELETE:   (id: string) => `/api/v1/activity/events/${id}`,
  },
  CLAIMS_EXTRA: {
    UNRESOLVED:    '/api/v1/claims/unresolved',
    BATCH_RESOLVE: '/api/v1/claims/batch-resolve',
  },
} as const;
