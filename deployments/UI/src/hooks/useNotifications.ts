import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

export type NotificationType =
  | 'TASK_DUE'
  | 'GOAL_DEADLINE'
  | 'HABIT_REMINDER'
  | 'WEEKLY_SUMMARY'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  resourceId?: string;
  createdAt: string;
}

const NOTIF_KEY = 'notifications';

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: [NOTIF_KEY],
    queryFn: async () => {
      const { data } = await api.get<Notification[]>('/api/notifications');
      return data;
    },
    // Only poll when logged in; silently return empty array on 401
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60_000 : false,
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/api/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.filter((n) => !n.read).length ?? 0;
}
