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
    DETAIL:   (id: string) => `/api/v1/activity/events/${id}`,
    UPDATE:   (id: string) => `/api/v1/activity/events/${id}`,
    DELETE:   (id: string) => `/api/v1/activity/events/${id}`,
  },
  CLAIMS_EXTRA: {
    UNRESOLVED:    '/api/v1/claims/unresolved',
    BATCH_RESOLVE: '/api/v1/claims/batch-resolve',
  },
  AGREEMENTS: {
    LIST:         '/api/v1/agreements',
    CREATE:       '/api/v1/agreements',
    DETAIL:       (id: string) => `/api/v1/agreements/${id}`,
    UPDATE:       (id: string) => `/api/v1/agreements/${id}`,
    DELETE:       (id: string) => `/api/v1/agreements/${id}`,
    BY_CASE:      (caseId: string) => `/api/v1/cases/${caseId}/agreements`,
  },
} as const;
