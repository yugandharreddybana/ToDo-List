import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface DailyCommitment {
  id: string; title: string; startTime: string; endTime: string;
  daysOfWeek: number[]; recurring: boolean; date?: string; flexible: boolean;
}
const KEY = ['planning', 'commitments'];
export function useCommitments() { return useQuery({ queryKey: KEY, queryFn: async () => (await api.get<DailyCommitment[]>('/api/planning/commitments')).data }); }
export function useCreateCommitment() { const qc = useQueryClient(); return useMutation({ mutationFn: (body: Omit<DailyCommitment, 'id'>) => api.post('/api/planning/commitments', body), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) }); }
export function useUpdateCommitment() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, ...body }: DailyCommitment) => api.put(`/api/planning/commitments/${id}`, body), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) }); }
export function useDeleteCommitment() { const qc = useQueryClient(); return useMutation({ mutationFn: (id: string) => api.delete(`/api/planning/commitments/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) }); }
