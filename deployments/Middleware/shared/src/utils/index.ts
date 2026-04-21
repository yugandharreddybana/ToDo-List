import type { Task, TaskPriority, TaskStatus } from '../types/index.js';

// =====================================================================
// Shared pure utilities — no Node or browser APIs. Safe to import from
// both the frontend and the middleware.
// =====================================================================

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_ORDER: Record<TaskStatus, number> = {
  in_progress: 0,
  todo: 1,
  blocked: 2,
  done: 3,
  archived: 4,
};

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.order - b.order;
  });
}

export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'done' || task.status === 'archived') return false;
  return new Date(task.dueDate).getTime() < now.getTime();
}

export function completionPercent(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

export function todayISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function minutesBetween(startIso: string, endIso: string): number {
  return Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const API_PATHS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
    avatar: '/users/avatar',
  },
  tasks: {
    list: '/tasks',
    byId: (id: string) => `/tasks/${id}`,
    subtasks: (id: string) => `/tasks/${id}/subtasks`,
    comments: (id: string) => `/tasks/${id}/comments`,
    bulk: '/tasks/bulk-update',
  },
  sessions: '/sessions',
  goals: {
    list: '/goals',
    byId: (id: string) => `/goals/${id}`,
    milestones: (id: string) => `/goals/${id}/milestones`,
  },
  career: {
    applications: '/career/applications',
    contacts: '/career/contacts',
  },
  health: {
    logs: '/health/logs',
    habits: '/health/habits',
  },
  roster: '/roster/shifts',
  analytics: {
    summary: '/analytics/summary',
    heatmap: '/analytics/productivity-heatmap',
    focusTime: '/analytics/focus-time',
  },
  ai: {
    chat: '/ai/chat',
    parseTask: '/ai/parse-task',
    briefing: '/ai/daily-briefing',
  },
  notifications: '/notifications',
} as const;
