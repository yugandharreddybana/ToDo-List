import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { PlanDraft } from './usePlans';

export interface ProposalContext {
  date: string; isToday: boolean; tasks: unknown[]; commitments: unknown[];
  commitmentsConfirmed: boolean; currentTime: string; feedback: string;
  preferences: { windowStart: string; windowEnd: string; bufferMinutes: number; focusMinutes: number; shortBreakMinutes: number; longBreakMinutes: number };
  energy?: { level?: number | null; mood?: number | null }; history?: unknown;
}

export function usePlanProposal() {
  return useMutation({
    mutationFn: async (context: ProposalContext) =>
      (await api.post<{ questions?: string[]; plan?: PlanDraft }>('/api/plans/proposal', context)).data,
  });
}
