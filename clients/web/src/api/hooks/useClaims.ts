import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimKeys, claimService } from '../services/claim.service';

export function useClaimMetrics() {
  return useQuery({
    queryKey:       claimKeys.metrics(),
    queryFn:        claimService.getMetrics,
    refetchInterval: 30_000,
  });
}

export function useClaimById(id: string) {
  return useQuery({
    queryKey: claimKeys.detail(id),
    queryFn:  () => claimService.getById(id),
    enabled:  !!id,
  });
}

export function useClaims() {
  return useQuery({
    queryKey: claimKeys.list(),
    queryFn:  claimService.list,
  });
}

export function useClaimLookup(nroStro: string) {
  return useQuery({
    queryKey: claimKeys.lookup(nroStro),
    queryFn:  () => claimService.lookup(nroStro),
    enabled:  nroStro.length >= 3,
    retry:    false,
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nroStro: string) => claimService.create(nroStro),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimKeys.list() });
    },
  });
}
