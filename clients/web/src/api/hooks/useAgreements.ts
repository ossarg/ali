import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agreementKeys, agreementService } from '../services/agreement.service';
import type { UpdateAgreementRequest } from '../schemas/agreement.schemas';

export function useAgreements(page = 1, pageSize = 20) {
  return useQuery({
    queryKey:  agreementKeys.list(page, pageSize),
    queryFn:   () => agreementService.list(page, pageSize),
  });
}

export function useAgreement(id: string) {
  return useQuery({
    queryKey: agreementKeys.detail(id),
    queryFn:  () => agreementService.getByID(id),
    enabled:  !!id,
  });
}

export function useAgreementsByCase(caseId: string) {
  return useQuery({
    queryKey: agreementKeys.byCase(caseId),
    queryFn:  () => agreementService.listByCase(caseId),
    enabled:  !!caseId,
  });
}

export function useUpdateAgreement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateAgreementRequest }) =>
      agreementService.update(id, req),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: agreementKeys.all });
      qc.setQueryData(agreementKeys.detail(updated.id), updated);
    },
  });
}

export function useDeleteAgreement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agreementService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agreementKeys.all });
    },
  });
}
