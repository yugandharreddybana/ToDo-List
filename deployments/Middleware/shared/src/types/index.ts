// =====================================================================
// Shared domain types
// These mirror the Java entities in services/backend and the Zod schemas
// in ../schemas. Update in lockstep.
// =====================================================================

export type ISODateString = string;
export type UUID = string;

// ---------- Auth / user ----------

export interface User {
  id: UUID;
  email: string;
  name: string;
  avatarUrl: string | null;
  timezone: string;
  createdAt: ISODateString;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: ISODateString;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

// ---------- Tasks ----------

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'archived';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval: number; // every N days/weeks/months
  endDate: ISODateString | null;
}

export interface Subtask {
  id: UUID;
  taskId: UUID;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface TaskComment {
  id: UUID;
  taskId: UUID;
  userId: UUID;
  content: string;
  createdAt: ISODateString;
}

export interface Task {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: ISODateString | null;
  tags: string[];
  parentTaskId: UUID | null;
  order: number;
  isRecurring: boolean;
  recurringConfig: RecurrenceConfig | null;
  subtasks: Subtask[];
  comments: TaskComment[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ---------- Focus sessions ----------

export type FocusSessionType = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export interface FocusSession {
  id: UUID;
  userId: UUID;
  taskId: UUID | null;
  startTime: ISODateString;
  endTime: ISODateString | null;
  durationMinutes: number;
  type: FocusSessionType;
}

// ---------- Goals ----------

export type GoalCategory = 'career' | 'health' | 'personal' | 'financial' | 'learning';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface GoalMilestone {
  id: UUID;
  goalId: UUID;
  title: string;
  isCompleted: boolean;
  targetDate: ISODateString | null;
}

export interface Goal {
  id: UUID;
  userId: UUID;
  title: string;
  category: GoalCategory;
  targetDate: ISODateString | null;
  progress: number; // 0–100
  status: GoalStatus;
  notes: string | null;
  milestones: GoalMilestone[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------- Career CRM ----------

export type CareerStage =
  | 'saved'
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface CareerContact {
  id: UUID;
  userId: UUID;
  applicationId: UUID | null;
  name: string;
  email: string | null;
  linkedinUrl: string | null;
  role: string | null;
  notes: string | null;
}

export interface CareerApplication {
  id: UUID;
  userId: UUID;
  company: string;
  role: string;
  status: CareerStage;
  appliedDate: ISODateString | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  url: string | null;
  notes: string | null;
  contactName: string | null;
  contactEmail: string | null;
  nextFollowUp: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------- Health ----------

export interface HealthLog {
  id: UUID;
  userId: UUID;
  date: ISODateString; // YYYY-MM-DD
  mood: number | null; // 1–5
  sleepHours: number | null;
  sleepQuality: number | null; // 1–5
  waterIntakeLiters: number | null;
  weightKg: number | null;
  notes: string | null;
}

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: UUID;
  userId: UUID;
  name: string;
  frequency: HabitFrequency;
  streak: number;
  color: string;
  icon: string;
}

export interface HabitLog {
  id: UUID;
  habitId: UUID;
  date: ISODateString;
  isCompleted: boolean;
}

// ---------- Roster ----------

export type ShiftType = 'morning' | 'day' | 'evening' | 'night' | 'on_call' | 'off';

export interface RosterShift {
  id: UUID;
  userId: UUID;
  date: ISODateString;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  shiftType: ShiftType;
  notes: string | null;
}

// ---------- Notifications ----------

export type NotificationType =
  | 'task_due'
  | 'goal_deadline'
  | 'weekly_summary'
  | 'follow_up'
  | 'system';

export interface Notification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: ISODateString;
}

// ---------- AI ----------

export type AIRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: UUID;
  role: AIRole;
  content: string;
  createdAt: ISODateString;
}

export interface AIConversation {
  id: UUID;
  userId: UUID;
  messages: AIMessage[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// ---------- API envelope ----------

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiErrorResponse {
  data?: never;
  error: ApiError;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
