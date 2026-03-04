import { api, setAccessToken } from '../client';
import { LoginRequestSchema, LoginResponseSchema } from '../schemas';
import type { LoginRequest, LoginResponse } from '../schemas/auth.schemas';
import { API_ENDPOINTS } from '../utils';

export const authKeys = {
  all: ['auth'] as const,
};

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const validated = LoginRequestSchema.parse(credentials);
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, validated);
    const data = LoginResponseSchema.parse(response);
    setAccessToken(data.token);
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Always clear token regardless of server response
      setAccessToken(null);
    }
  },
};
