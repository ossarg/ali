/**
 * API error codes returned by the backend.
 * Keep in sync with backend apierrors package.
 */
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'AUTH-001',
  UNAUTHORIZED: 'AUTH-002',
  FORBIDDEN: 'AUTH-003',
  TOKEN_EXPIRED: 'AUTH-004',

  // Validation
  VALIDATION_ERROR: 'VAL-001',

  // Server
  INTERNAL_SERVER_ERROR: 'SRV-001',

  // Network (client-side)
  NETWORK_ERROR: 'NET-001',
  TIMEOUT: 'NET-002',

  // General
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ApiErrorResponse {
  message: string;
  code?: ErrorCode;
}
