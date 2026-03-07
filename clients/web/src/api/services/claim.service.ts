import { api } from '../client';
import { ClaimLookupResponseSchema, ClaimMetricsSchema, ClaimSchema, PaginatedClaimsSchema } from '../schemas/claim.schemas';
import type { Claim, ClaimLookupResponse, ClaimMetrics, PaginatedClaims } from '../schemas/claim.schemas';

export const claimKeys = {
  all:     ['claims'] as const,
  metrics: () => [...claimKeys.all, 'metrics'] as const,
  list:    () => [...claimKeys.all, 'list'] as const,
  detail:  (id: string) => [...claimKeys.all, 'detail', id] as const,
  lookup:  (nro: string) => [...claimKeys.all, 'lookup', nro] as const,
};

const CLAIMS_BASE = '/api/v1/claims';

export const claimService = {
  getMetrics: async (): Promise<ClaimMetrics> => {
    const res = await api.get(`${CLAIMS_BASE}/metrics`);
    return ClaimMetricsSchema.parse(res);
  },

  getById: async (id: string): Promise<Claim> => {
    const res = await api.get(`${CLAIMS_BASE}/${id}`);
    return ClaimSchema.parse(res);
  },

  list: async (): Promise<Claim[]> => {
    const res = await api.get(CLAIMS_BASE);
    return ClaimSchema.array().parse(res);
  },

  listPaginated: async (page: number, limit: number): Promise<PaginatedClaims> => {
    const res = await api.get(CLAIMS_BASE, { params: { page: String(page), limit: String(limit) } });
    return PaginatedClaimsSchema.parse(res);
  },

  lookup: async (nroStro: string): Promise<ClaimLookupResponse> => {
    const res = await api.get(`${CLAIMS_BASE}/lookup`, { params: { nro_stro: nroStro } });
    return ClaimLookupResponseSchema.parse(res);
  },

  create: async (nroStro: string): Promise<Claim> => {
    const res = await api.post(CLAIMS_BASE, { nro_stro: nroStro });
    return ClaimSchema.parse(res);
  },
};
