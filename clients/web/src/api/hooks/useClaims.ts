import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimKeys, claimService } from '../services/claim.service';

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
