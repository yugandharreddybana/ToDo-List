import { z } from 'zod';

// =====================================================================
// Zod schemas — single source of truth for API request/response
// validation. Types in ../types are derived from or mirror these.
// =====================================================================

// ---------- Primitives ----------

export const isoDateString = z.string().datetime({ offset: true });
export const isoCalendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const uuid = z.string().uuid();

// ---------- Auth ----------

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80),
  timezone: z.string().default('UTC'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ---------- Tasks ----------

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'blocked', 'done', 'archived']);
export const taskPrioritySchema = z.enum(['urgent', 'high', 'medium', 'low']);
export const recurrenceFrequencySchema = z.enum(['daily', 'weekly', 'monthly']);

export const recurrenceConfigSchema = z.object({
  frequency: recurrenceFrequencySchema,
  interval: z.number().int().positive().max(365),
  endDate: isoDateString.nullable(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  dueDate: isoDateString.nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  parentTaskId: uuid.nullable().optional(),
  isRecurring: z.boolean().default(false),
  recurringConfig: recurrenceConfigSchema.nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

export const createSubtaskSchema = z.object({
  title: z.string().min(1).max(200),
  order: z.number().int().nonnegative().default(0),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isCompleted: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const bulkUpdateTasksSchema = z.object({
  ids: z.array(uuid).min(1).max(500),
  patch: updateTaskSchema,
});

// ---------- Focus sessions ----------

export const focusSessionTypeSchema = z.enum(['pomodoro', 'short_break', 'long_break', 'custom']);

export const createSessionSchema = z.object({
  taskId: uuid.nullable().optional(),
  startTime: isoDateString,
  endTime: isoDateString.nullable().optional(),
  durationMinutes: z.number().int().positive().max(720),
  type: focusSessionTypeSchema.default('pomodoro'),
});

export const updateSessionSchema = createSessionSchema.partial();

// ---------- Goals ----------

export const goalCategorySchema = z.enum(['career', 'health', 'personal', 'financial', 'learning']);
export const goalStatusSchema = z.enum(['active', 'completed', 'paused', 'archived']);

export const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  category: goalCategorySchema,
  targetDate: isoDateString.nullable().optional(),
  progress: z.number().int().min(0).max(100).default(0),
  status: goalStatusSchema.default('active'),
  notes: z.string().max(5000).nullable().optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  targetDate: isoDateString.nullable().optional(),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isCompleted: z.boolean().optional(),
  targetDate: isoDateString.nullable().optional(),
});

// ---------- Career ----------

export const careerStageSchema = z.enum([
  'saved',
  'applied',
  'phone_screen',
  'interview',
  'offer',
  'rejected',
]);

export const createApplicationSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  status: careerStageSchema.default('saved'),
  appliedDate: isoDateString.nullable().optional(),
  salaryMin: z.number().nonnegative().nullable().optional(),
  salaryMax: z.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).default('USD'),
  url: z.string().url().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  contactName: z.string().max(120).nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  nextFollowUp: isoDateString.nullable().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const createContactSchema = z.object({
  applicationId: uuid.nullable().optional(),
  name: z.string().min(1).max(120),
  email: z.string().email().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  role: z.string().max(120).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

// ---------- Health ----------

export const createHealthLogSchema = z.object({
  date: isoCalendarDate,
  mood: z.number().int().min(1).max(5).nullable().optional(),
  sleepHours: z.number().min(0).max(24).nullable().optional(),
  sleepQuality: z.number().int().min(1).max(5).nullable().optional(),
  waterIntakeLiters: z.number().nonnegative().max(20).nullable().optional(),
  weightKg: z.number().positive().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const habitFrequencySchema = z.enum(['daily', 'weekly']);

export const createHabitSchema = z.object({
  name: z.string().min(1).max(120),
  frequency: habitFrequencySchema.default('daily'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#5B9BD5'),
  icon: z.string().max(40).default('activity'),
});

export const logHabitSchema = z.object({
  date: isoCalendarDate,
  isCompleted: z.boolean(),
});

// ---------- Roster ----------

export const shiftTypeSchema = z.enum(['morning', 'day', 'evening', 'night', 'on_call', 'off']);

export const createShiftSchema = z.object({
  date: isoCalendarDate,
  startTime: hhmm,
  endTime: hhmm,
  shiftType: shiftTypeSchema,
  notes: z.string().max(500).nullable().optional(),
});

export const updateShiftSchema = createShiftSchema.partial();

// ---------- AI ----------

export const aiChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
});

export const aiChatRequestSchema = z.object({
  conversationId: uuid.nullable().optional(),
  messages: z.array(aiChatMessageSchema).min(1).max(40),
  stream: z.boolean().default(true),
});

export const aiParseTaskSchema = z.object({
  text: z.string().min(1).max(2000),
});

// ---------- Analytics ----------

export const analyticsPeriodSchema = z.enum(['week', 'month', 'year']);
export const analyticsQuerySchema = z.object({
  period: analyticsPeriodSchema.default('week'),
});

// ---------- Inferred request types (for middleware/controllers) ----------

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type CreateHealthLogInput = z.infer<typeof createHealthLogSchema>;
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
