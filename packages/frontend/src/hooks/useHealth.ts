import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface HealthLog {
  id: string;
  logDate: string;
  sleepHours?: number;
  waterMl?: number;
  weightKg?: number;
  stepsCount?: number;
  calories?: number;
  notes?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  targetFrequency: number;
  active: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  logDate: string;
  completed: boolean;
  notes?: string;
}

const HEALTH_LOGS_KEY = 'health-logs';
const HABITS_KEY = 'habits';

export function useHealthLogs(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [HEALTH_LOGS_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<HealthLog[]>('/health/logs', { params });
      return data;
    },
  });
}

export function useUpsertHealthLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<HealthLog>) => {
      if (body.id) {
        const { data } = await api.put<HealthLog>(`/health/logs/${body.id}`, body);
        return data;
      }
      const { data } = await api.post<HealthLog>('/health/logs', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [HEALTH_LOGS_KEY] }),
  });
}

export function useDeleteHealthLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/health/logs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [HEALTH_LOGS_KEY] }),
  });
}

export function useHabits() {
  return useQuery({
    queryKey: [HABITS_KEY],
    queryFn: async () => {
      const { data } = await api.get<Habit[]>('/health/habits');
      return data;
    },
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<Habit>) => {
      const { data } = await api.post<Habit>('/health/habits', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [HABITS_KEY] }),
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<Habit> & { id: string }) => {
      const { data } = await api.put<Habit>(`/health/habits/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [HABITS_KEY] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/health/habits/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [HABITS_KEY] }),
  });
}

export function useHabitLogs(habitId: string | null, params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [HABITS_KEY, habitId, 'logs', params],
    queryFn: async () => {
      const { data } = await api.get<HabitLog[]>(`/health/habits/${habitId}/logs`, {
        params,
      });
      return data;
    },
    enabled: !!habitId,
  });
}

export function useLogHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      habitId,
      logDate,
      completed,
      notes,
    }: {
      habitId: string;
      logDate: string;
      completed: boolean;
      notes?: string;
    }) => {
      const { data } = await api.post<HabitLog>(`/health/habits/${habitId}/logs`, {
        logDate,
        completed,
        notes,
      });
      return data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: [HABITS_KEY, vars.habitId, 'logs'] }),
  });
}
