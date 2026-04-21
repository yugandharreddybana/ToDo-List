import { create } from 'zustand';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  order: number;
  parentTaskId?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  tags?: string[];
  dueBefore?: string;
  dueAfter?: string;
}

interface TaskState {
  selectedTaskId: string | null;
  filters: TaskFilters;
  viewMode: 'list' | 'board' | 'timeline';

  setSelectedTask: (id: string | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'list' | 'board' | 'timeline') => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
  selectedTaskId: null,
  filters: {},
  viewMode: 'list',

  setSelectedTask: (id) => set({ selectedTaskId: id }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({ filters: {} }),

  setViewMode: (mode) => set({ viewMode: mode }),
}));
