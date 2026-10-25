import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useMutation } from '@tanstack/react-query';

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DailyCount {
  date: string;
  count: number;
}

export interface AnalyticsSummary {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalFocusMinutes: number;
  pomodoroSessions: number;
  activeGoals: number;
  avgGoalProgress: number;
  taskCompletionByDay: DailyCount[];
  focusMinutesByDay: DailyCount[];
  fromDate: string;
  toDate: string;
  focusByTask: { taskId: string; title: string; actualMinutes: number; sessions: number }[];
}

export interface HeatmapCell {
  date: string;
  value: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface Heatmap {
  cells: HeatmapCell[];
}

const ANALYTICS_KEY = 'analytics';

export function useAnalyticsSummary(period: AnalyticsPeriod = 'week', from?: string, to?: string) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'summary', period, from, to],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsSummary>('/api/analytics/summary', {
        params: { period, from, to },
      });
      return data;
    },
    enabled: period !== 'custom' || Boolean(from && to),
  });
}

export interface AIAnalyticsReport { rating: number; wentWell: string[]; improve: string[]; nextSteps: string[]; explanation: string; fromDate: string; toDate: string; }
export function useAIAnalyticsReport() {
  return useMutation({ mutationFn: async (range: { period: AnalyticsPeriod; from?: string; to?: string }) =>
    (await api.post<AIAnalyticsReport>('/api/analytics/report', range)).data });
}

export function useHeatmap() {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'heatmap'],
    queryFn: async () => {
      const { data } = await api.get<Heatmap>('/api/analytics/heatmap');
      return data;
    },
  });
}
