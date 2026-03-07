import { api } from '../client';
import { ClaimLookupResponseSchema, ClaimSchema } from '../schemas/claim.schemas';
import type { Claim, ClaimLookupResponse } from '../schemas/claim.schemas';

export const claimKeys = {
  all:    ['claims'] as const,
  list:   () => [...claimKeys.all, 'list'] as const,
  detail: (id: string) => [...claimKeys.all, 'detail', id] as const,
  lookup: (nro: string) => [...claimKeys.all, 'lookup', nro] as const,
};

const CLAIMS_BASE = '/api/v1/claims';

export const claimService = {
  getById: async (id: string): Promise<Claim> => {
    const res = await api.get(`${CLAIMS_BASE}/${id}`);
    return ClaimSchema.parse(res);
  },

  list: async (): Promise<Claim[]> => {
    const res = await api.get(CLAIMS_BASE);
    return ClaimSchema.array().parse(res);
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
