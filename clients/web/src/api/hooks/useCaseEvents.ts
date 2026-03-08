import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { caseEventKeys, caseEventsByCaseKey, caseEventService } from '../services/case.service';
import type { RetryResolutionRequest, ReviewCaseEventRequest, UpdateCaseEventRequest } from '../schemas/case.schemas';

export function useCaseEvent(id: string) {
  return useQuery({
    queryKey: ['case-event', id],
    queryFn:  () => caseEventService.getEvent(id),
    enabled:  !!id,
  });
}

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
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: caseEventKeys.all });
      queryClient.invalidateQueries({ queryKey: ['case-event', id] });
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

export function useCaseEvents(caseId: string) {
  return useQuery({
    queryKey: caseEventsByCaseKey.all(caseId),
    queryFn:  () => caseEventService.byCaseID(caseId),
    enabled:  !!caseId,
  });
}

export function useUpdateCaseEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateCaseEventRequest }) =>
      caseEventService.update(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseEventKeys.all });
    },
  });
}

export function useDeleteCaseEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => caseEventService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseEventKeys.all });
    },
  });
}
