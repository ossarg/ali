import { useQuery } from '@tanstack/react-query';
import { caseService, caseKeys } from '../services/case.service';

export const useCases = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: caseKeys.list(params),
    queryFn: () => caseService.list(params),
    staleTime: 30_000,
  });
};

export const useCase = (id: string) => {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => caseService.get(id),
    enabled: !!id,
    staleTime: 30_000,
  });
};
