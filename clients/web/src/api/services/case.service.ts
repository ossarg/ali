import { api } from '../client';
import { CaseListResponseSchema, CaseSchema } from '../schemas';
import type { Case, CaseListResponse } from '../schemas/case.schemas';
import { API_ENDPOINTS } from '../utils';

export const caseKeys = {
  all: ['cases'] as const,
  list: (params?: Record<string, string>) => [...caseKeys.all, 'list', params] as const,
  detail: (id: string) => [...caseKeys.all, 'detail', id] as const,
};

export const caseService = {
  list: async (params?: Record<string, string>): Promise<CaseListResponse> => {
    const response = await api.get(API_ENDPOINTS.CASES.LIST, { params });
    return CaseListResponseSchema.parse(response);
  },

  get: async (id: string): Promise<Case> => {
    const response = await api.get(API_ENDPOINTS.CASES.DETAIL(id));
    return CaseSchema.parse(response);
  },
};
