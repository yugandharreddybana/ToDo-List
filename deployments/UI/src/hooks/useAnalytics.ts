import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

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
  careerApplications: number;
  taskCompletionByDay: DailyCount[];
  focusMinutesByDay: DailyCount[];
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

export function useAnalyticsSummary(period: 'week' | 'month' | 'year' = 'week') {
  return useQuery({
    queryKey: [ANALYTICS_KEY, 'summary', period],
    queryFn: async () => {
      const { data } = await api.get<AnalyticsSummary>('/api/analytics/summary', {
        params: { period },
      });
      return data;
    },
  });
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
