import { api } from '../client';
import { CaseEventMetricsSchema, CaseEventSchema, CaseListResponseSchema, CaseSchema } from '../schemas';
import type {
  Case,
  CaseEvent,
  CaseEventMetrics,
  CaseListResponse,
  RetryResolutionRequest,
  ReviewCaseEventRequest,
} from '../schemas/case.schemas';
import { API_ENDPOINTS } from '../utils';

export const caseKeys = {
  all: ['cases'] as const,
  list: (params?: Record<string, string>) => [...caseKeys.all, 'list', params] as const,
  detail: (id: string | number) => [...caseKeys.all, 'detail', id] as const,
};

export const caseEventKeys = {
  all:      ['case-events'] as const,
  metrics:  () => [...caseEventKeys.all, 'metrics'] as const,
  approved: () => [...caseEventKeys.all, 'approved'] as const,
  pending:  () => [...caseEventKeys.all, 'pending'] as const,
};

export const caseService = {
  list: async (params?: Record<string, string>): Promise<CaseListResponse> => {
    const response = await api.get(API_ENDPOINTS.CASES.LIST, { params });
    return CaseListResponseSchema.parse(response);
  },

  get: async (id: string | number): Promise<Case> => {
    const response = await api.get(API_ENDPOINTS.CASES.DETAIL(id));
    return CaseSchema.parse(response);
  },
};

export const caseEventService = {
  metrics: async (): Promise<CaseEventMetrics> => {
    const response = await api.get(API_ENDPOINTS.CASE_EVENTS.METRICS);
    return CaseEventMetricsSchema.parse(response);
  },

  approved: async (): Promise<CaseEvent[]> => {
    const response = await api.get(API_ENDPOINTS.CASE_EVENTS.APPROVED);
    return CaseEventSchema.array().parse(response);
  },

  pending: async (): Promise<CaseEvent[]> => {
    const response = await api.get(API_ENDPOINTS.CASE_EVENTS.PENDING);
    return CaseEventSchema.array().parse(response);
  },

  review: async (id: string, req: ReviewCaseEventRequest): Promise<CaseEvent> => {
    const response = await api.patch(API_ENDPOINTS.CASE_EVENTS.REVIEW(id), req);
    return CaseEventSchema.parse(response);
  },

  unresolved: async (): Promise<CaseEvent[]> => {
    const response = await api.get(API_ENDPOINTS.CLAIMS_EXTRA.UNRESOLVED);
    return CaseEventSchema.array().parse(response);
  },

  retryResolution: async (id: string, req: RetryResolutionRequest): Promise<CaseEvent> => {
    const response = await api.post(API_ENDPOINTS.CASE_EVENTS.RESOLVE(id), req);
    return CaseEventSchema.parse(response);
  },

  batchResolve: async (): Promise<{ resolved: number; errors: number; message: string }> => {
    return api.post(API_ENDPOINTS.CLAIMS_EXTRA.BATCH_RESOLVE, {});
  },
};
