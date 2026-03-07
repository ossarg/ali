import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { caseEventKeys, caseEventService } from '../services/case.service';
import type { RetryResolutionRequest, ReviewCaseEventRequest } from '../schemas/case.schemas';

export function useCaseEventMetrics() {
  return useQuery({
    queryKey: caseEventKeys.metrics(),
    queryFn:  caseEventService.metrics,
    refetchInterval: 30_000, // refresh every 30s to keep "last seen" alive
  });
}

export function useApprovedEvents() {
  return useQuery({
    queryKey: caseEventKeys.approved(),
    queryFn:  caseEventService.approved,
  });
}

export function useApprovedEventsPaginated(page: number, limit = 10) {
  return useQuery({
    queryKey: [...caseEventKeys.approved(), 'paginated', page, limit],
    queryFn:  () => caseEventService.approvedPaginated(page, limit),
    placeholderData: prev => prev,
  });
}

export function usePendingEvents() {
  return useQuery({
    queryKey: caseEventKeys.pending(),
    queryFn:  caseEventService.pending,
  });
}

export function useReviewEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: ReviewCaseEventRequest }) =>
      caseEventService.review(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseEventKeys.all });
    },
  });
}

export function useUnresolvedEvents() {
  return useQuery({
    queryKey: [...caseEventKeys.all, 'unresolved'],
    queryFn:  caseEventService.unresolved,
  });
}

export function useRetryResolution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: RetryResolutionRequest }) =>
      caseEventService.retryResolution(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseEventKeys.all });
    },
  });
}

export function useBatchResolve() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => caseEventService.batchResolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseEventKeys.all });
    },
  });
}
