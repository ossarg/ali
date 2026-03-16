import { api } from '../client/axios.client';
import { API_ENDPOINTS } from '../utils/config';
import {
  AgreementSchema,
  AgreementListResponseSchema,
  type Agreement,
  type AgreementListResponse,
  type CreateAgreementRequest,
  type UpdateAgreementRequest,
} from '../schemas/agreement.schemas';

export const agreementKeys = {
  all:    ['agreements'] as const,
  list:   (page: number, pageSize: number) => ['agreements', 'list', page, pageSize] as const,
  detail: (id: string) => ['agreements', id] as const,
  byCase: (caseId: string) => ['agreements', 'case', caseId] as const,
};

export const agreementService = {
  list: async (page = 1, pageSize = 20): Promise<AgreementListResponse> => {
    const res = await api.get(API_ENDPOINTS.AGREEMENTS.LIST, {
      params: { page, page_size: pageSize },
    });
    return AgreementListResponseSchema.parse(res);
  },

  getByID: async (id: string): Promise<Agreement> => {
    const res = await api.get(API_ENDPOINTS.AGREEMENTS.DETAIL(id));
    return AgreementSchema.parse(res);
  },

  listByCase: async (caseId: string): Promise<Agreement[]> => {
    const res = await api.get(API_ENDPOINTS.AGREEMENTS.BY_CASE(caseId));
    return AgreementSchema.array().parse(res);
  },

  create: async (req: CreateAgreementRequest): Promise<Agreement> => {
    const res = await api.post(API_ENDPOINTS.AGREEMENTS.CREATE, req);
    return AgreementSchema.parse(res);
  },

  update: async (id: string, req: UpdateAgreementRequest): Promise<Agreement> => {
    const res = await api.patch(API_ENDPOINTS.AGREEMENTS.UPDATE(id), req);
    return AgreementSchema.parse(res);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.AGREEMENTS.DELETE(id));
  },
};
