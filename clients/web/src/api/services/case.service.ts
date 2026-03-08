import { api } from '../client';
import { CaseEventMetricsSchema, CaseEventSchema, CaseListResponseSchema, CaseSchema } from '../schemas';
import { PaginatedCaseEventsSchema } from '../schemas/case.schemas';
import type {
  Case,
  CaseEvent,
  CaseEventMetrics,
  CaseListResponse,
  PaginatedCaseEvents,
  RetryResolutionRequest,
  ReviewCaseEventRequest,
  UpdateCaseEventRequest,
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

  listPaginated: async (page: number, limit: number, params?: Record<string, string>): Promise<CaseListResponse> => {
    const response = await api.get(API_ENDPOINTS.CASES.LIST, { params: { ...params, page: String(page), limit: String(limit) } });
    return CaseListResponseSchema.parse(response);
  },

  get: async (id: string | number): Promise<Case> => {
    const response = await api.get(API_ENDPOINTS.CASES.DETAIL(id));
    return CaseSchema.parse(response);
  },
};

export const caseEventsByCaseKey = {
  all: (caseId: string) => ['case-events-by-case', caseId] as const,
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

  approvedPaginated: async (page: number, limit: number): Promise<PaginatedCaseEvents> => {
    const response = await api.get(API_ENDPOINTS.CASE_EVENTS.APPROVED, { params: { page: String(page), limit: String(limit) } });
    return PaginatedCaseEventsSchema.parse(response);
  },

  pending: async (): Promise<CaseEvent[]> => {
    const response = await api.get(API_ENDPOINTS.CASE_EVENTS.PENDING);
    return CaseEventSchema.array().parse(response);
  },

  pendingPaginated: async (page: number, limit: number): Promise<PaginatedCaseEvents> => {
    const response = await api.get(API_ENDPOINTS.CASE_EVENTS.PENDING, { params: { page: String(page), limit: String(limit) } });
    const parsed = PaginatedCaseEventsSchema.safeParse(response);
    if (!parsed.success) {
      console.error('[pendingPaginated] Zod error:', parsed.error.issues);
      // Fallback: return raw data cast
      const raw = response as any;
      return { data: raw.data ?? [], total: raw.total ?? 0, page: raw.page ?? page, limit: raw.limit ?? limit };
    }
    return parsed.data;
  },

  byCaseID: async (caseId: string): Promise<CaseEvent[]> => {
    const response = await api.get(API_ENDPOINTS.CASES.EVENTS(caseId));
    return CaseEventSchema.array().parse(response);
  },

  getEvent: async (id: string): Promise<CaseEvent> => {
    const response = await api.get(API_ENDPOINTS.CASE_EVENTS.DETAIL(id));
    return CaseEventSchema.parse(response);
  },

  review: async (id: string, req: ReviewCaseEventRequest): Promise<CaseEvent> => {
    const response = await api.patch(API_ENDPOINTS.CASE_EVENTS.REVIEW(id), req);
    return CaseEventSchema.parse(response);
  },

  update: async (id: string, req: UpdateCaseEventRequest): Promise<CaseEvent> => {
    const response = await api.put(API_ENDPOINTS.CASE_EVENTS.UPDATE(id), req);
    return CaseEventSchema.parse(response);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CASE_EVENTS.DELETE(id));
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
