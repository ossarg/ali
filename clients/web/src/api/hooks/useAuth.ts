import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { LoginRequest } from '../types';

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      authService.logout();
    },
  });
};
