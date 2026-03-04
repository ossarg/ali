import { api, setAccessToken } from '../client';
import { LoginRequestSchema, LoginResponseSchema } from '../schemas';
import type { LoginRequest, LoginResponse } from '../types';
import { API_ENDPOINTS } from '../utils';

export const authKeys = {
  all: ['auth'] as const,
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const validated = LoginRequestSchema.parse(credentials);
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, validated);
    const data = LoginResponseSchema.parse(response);
    setAccessToken(data.access_token);
    return data;
  },

  logout: () => {
    setAccessToken(null);
  },
};
