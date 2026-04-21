import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'CUSTOM';

export interface RosterShift {
  id: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  location?: string;
  notes?: string;
  createdAt: string;
}

const ROSTER_KEY = 'roster-shifts';

export function useRosterShifts(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [ROSTER_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<RosterShift[]>('/api/roster/shifts', { params });
      return data;
    },
  });
}

export function useCreateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<RosterShift>) => {
      const { data } = await api.post<RosterShift>('/api/roster/shifts', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROSTER_KEY] }),
  });
}

export function useUpdateShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<RosterShift> & { id: string }) => {
      const { data } = await api.put<RosterShift>(`/api/roster/shifts/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROSTER_KEY] }),
  });
}

export function useDeleteShift() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/roster/shifts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ROSTER_KEY] }),
  });
}
