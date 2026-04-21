import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type GoalCategory = 'CAREER' | 'HEALTH' | 'LEARNING' | 'PERSONAL' | 'FINANCE' | 'OTHER';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

const GOALS_KEY = 'goals';

export function useGoals() {
  return useQuery({
    queryKey: [GOALS_KEY],
    queryFn: async () => {
      const { data } = await api.get<Goal[]>('/goals');
      return data;
    },
  });
}

export function useGoal(id: string | null) {
  return useQuery({
    queryKey: [GOALS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<Goal>(`/goals/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<Goal>) => {
      const { data } = await api.post<Goal>('/goals', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [GOALS_KEY] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<Goal> & { id: string }) => {
      const { data } = await api.put<Goal>(`/goals/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [GOALS_KEY] }),
  });
}

export function useUpdateGoalProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const { data } = await api.patch<Goal>(`/goals/${id}/progress`, { progress });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [GOALS_KEY] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GOALS_KEY] }),
  });
}

export function useMilestones(goalId: string | null) {
  return useQuery({
    queryKey: [GOALS_KEY, goalId, 'milestones'],
    queryFn: async () => {
      const { data } = await api.get<Milestone[]>(`/goals/${goalId}/milestones`);
      return data;
    },
    enabled: !!goalId,
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ goalId, title, dueDate }: { goalId: string; title: string; dueDate?: string }) => {
      const { data } = await api.post<Milestone>(`/goals/${goalId}/milestones`, { title, dueDate });
      return data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: [GOALS_KEY, vars.goalId, 'milestones'] }),
  });
}

export function useToggleMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goalId,
      milestoneId,
      completed,
    }: {
      goalId: string;
      milestoneId: string;
      completed: boolean;
    }) => {
      const { data } = await api.patch(`/goals/${goalId}/milestones/${milestoneId}`, {
        completed,
      });
      return data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: [GOALS_KEY, vars.goalId, 'milestones'] }),
  });
}
