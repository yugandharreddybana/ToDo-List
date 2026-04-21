import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Task, TaskFilters } from '../stores/task.store';
import { useAuthStore } from '../stores/auth.store';

const TASKS_KEY = 'tasks';

export function useTasks(filters?: TaskFilters) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: async () => {
      const { data } = await api.get<Task[]>('/api/tasks', { params: filters });
      return data;
    },
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useTask(id: string | null) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<Task>(`/api/tasks/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<Task>) => {
      const { data } = await api.post<Task>('/api/tasks', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<Task> & { id: string }) => {
      const { data } = await api.put<Task>(`/api/tasks/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Task['status'] }) => {
      const { data } = await api.patch<Task>(`/api/tasks/${id}/status`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useReorderTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const { data } = await api.post('/api/tasks/reorder', { orderedIds });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useSubtasks(taskId: string | null) {
  return useQuery({
    queryKey: [TASKS_KEY, taskId, 'subtasks'],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/${taskId}/subtasks`);
      return data;
    },
    enabled: !!taskId,
  });
}

export function useCreateSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const { data } = await api.post(`/api/tasks/${taskId}/subtasks`, { title });
      return data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: [TASKS_KEY, vars.taskId, 'subtasks'] }),
  });
}

export function useToggleSubtask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      subId,
      completed,
    }: {
      taskId: string;
      subId: string;
      completed: boolean;
    }) => {
      const { data } = await api.patch(`/api/tasks/${taskId}/subtasks/${subId}`, { completed });
      return data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: [TASKS_KEY, vars.taskId, 'subtasks'] }),
  });
}

export function useTaskComments(taskId: string | null) {
  return useQuery({
    queryKey: [TASKS_KEY, taskId, 'comments'],
    queryFn: async () => {
      const { data } = await api.get(`/api/tasks/${taskId}/comments`);
      return data;
    },
    enabled: !!taskId,
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const { data } = await api.post(`/api/tasks/${taskId}/comments`, { content });
      return data;
    },
    onSuccess: (_d, vars) =>
      qc.invalidateQueries({ queryKey: [TASKS_KEY, vars.taskId, 'comments'] }),
  });
}
