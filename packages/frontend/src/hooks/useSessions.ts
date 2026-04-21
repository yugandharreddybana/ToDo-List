import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type SessionType = 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK' | 'DEEP_WORK' | 'CUSTOM';

export interface FocusSession {
  id: string;
  type: SessionType;
  durationMinutes: number;
  startTime: string;
  endTime?: string;
  taskId?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

const SESSIONS_KEY = 'sessions';

export function useSessions(params?: { limit?: number; from?: string; to?: string }) {
  return useQuery({
    queryKey: [SESSIONS_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<FocusSession[]>('/sessions', { params });
      return data;
    },
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      type: SessionType;
      durationMinutes: number;
      taskId?: string;
    }) => {
      const { data } = await api.post<FocusSession>('/sessions', {
        ...body,
        startTime: new Date().toISOString(),
        completed: false,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [SESSIONS_KEY] }),
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data } = await api.put<FocusSession>(`/sessions/${id}`, {
        endTime: new Date().toISOString(),
        completed: true,
        notes,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [SESSIONS_KEY] }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sessions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SESSIONS_KEY] }),
  });
}
