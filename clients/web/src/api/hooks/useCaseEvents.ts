import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { caseEventKeys, caseEventService } from '../services/case.service';
import type { ReviewCaseEventRequest } from '../schemas/case.schemas';

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
      // Invalidate all event-related queries so metrics + lists refresh
      queryClient.invalidateQueries({ queryKey: caseEventKeys.all });
    },
  });
}
