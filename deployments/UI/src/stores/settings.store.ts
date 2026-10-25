import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsBeforeLong: number;
  planningWindowStart: string;
  planningWindowEnd: string;
  planningBufferMinutes: number;
  askAboutCommitments: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  defaultTaskView: 'list' | 'board' | 'timeline';
  weekStartsOn: 0 | 1 | 6;

  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setTimezone: (tz: string) => void;
  setPomodoroSettings: (settings: {
    workMinutes?: number;
    breakMinutes?: number;
    longBreakMinutes?: number;
    sessionsBeforeLong?: number;
  }) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDefaultTaskView: (view: 'list' | 'board' | 'timeline') => void;
  setWeekStartsOn: (day: 0 | 1 | 6) => void;
  setPlanningSettings: (settings: { windowStart?: string; windowEnd?: string; bufferMinutes?: number; askAboutCommitments?: boolean }) => void;
  update: (patch: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      pomodoroWorkMinutes: 25,
      pomodoroBreakMinutes: 5,
      pomodoroLongBreakMinutes: 15,
      pomodoroSessionsBeforeLong: 4,
      planningWindowStart: '06:00',
      planningWindowEnd: '21:00',
      planningBufferMinutes: 5,
      askAboutCommitments: true,
      notificationsEnabled: true,
      soundEnabled: true,
      defaultTaskView: 'list',
      weekStartsOn: 1,

      setTheme: (theme) => set({ theme }),
      setTimezone: (timezone) => set({ timezone }),
      setPomodoroSettings: (s) =>
        set((state) => ({
          pomodoroWorkMinutes: s.workMinutes ?? state.pomodoroWorkMinutes,
          pomodoroBreakMinutes: s.breakMinutes ?? state.pomodoroBreakMinutes,
          pomodoroLongBreakMinutes: s.longBreakMinutes ?? state.pomodoroLongBreakMinutes,
          pomodoroSessionsBeforeLong: s.sessionsBeforeLong ?? state.pomodoroSessionsBeforeLong,
        })),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setDefaultTaskView: (view) => set({ defaultTaskView: view }),
      setWeekStartsOn: (day) => set({ weekStartsOn: day }),
      setPlanningSettings: (s) => set(state => ({
        planningWindowStart: s.windowStart ?? state.planningWindowStart,
        planningWindowEnd: s.windowEnd ?? state.planningWindowEnd,
        planningBufferMinutes: s.bufferMinutes ?? state.planningBufferMinutes,
        askAboutCommitments: s.askAboutCommitments ?? state.askAboutCommitments,
      })),
      update: (patch) => set(patch),
    }),
    {
      name: 'tps-settings',
    },
  ),
);
