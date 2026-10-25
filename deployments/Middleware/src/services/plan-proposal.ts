import { z } from 'zod';

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/).transform(value => value.slice(0, 5));
const task = z.object({
  id: z.string().uuid(), title: z.string().min(1).max(200), estimatedMinutes: z.number().int().min(1).max(1440),
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']), difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  energyRequirement: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(), environment: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(), status: z.string().optional(),
}).passthrough();
const commitment = z.object({
  id: z.string().uuid(), title: z.string(), startTime: clock, endTime: clock,
  daysOfWeek: z.array(z.number().int()).default([]), recurring: z.boolean(), date: z.string().nullable().optional(),
  flexible: z.boolean().default(false),
}).passthrough();
export const proposalInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), isToday: z.boolean(), currentTime: clock,
  tasks: z.array(task).max(100), commitments: z.array(commitment).max(100),
  commitmentsConfirmed: z.boolean(), feedback: z.string().max(2000).default(''),
  preferences: z.object({ windowStart: clock.default('06:00'), windowEnd: clock.default('21:00'), bufferMinutes: z.number().int().min(0).max(60).default(5), focusMinutes: z.number().int().min(10).max(90).default(25), shortBreakMinutes: z.number().int().min(1).max(45).default(5), longBreakMinutes: z.number().int().min(5).max(90).default(15) }),
  energy: z.object({ level: z.number().int().min(1).max(5).nullable().optional(), mood: z.number().int().min(1).max(5).nullable().optional() }).optional(),
  history: z.unknown().optional(),
});
export type ProposalInput = z.infer<typeof proposalInput>;
export type ProposedItem = { title: string; taskId: string | null; startTime: string; endTime: string; bufferMinutes: number; energyLevel: string; itemType: 'task' | 'break' | 'commitment'; itemOrder: number; notes?: string };
export type ProposedPlan = { planDate: string; windowStart: string; windowEnd: string; source: string; assumptions: string[]; summary: string; items: ProposedItem[] };

const aiDecision = z.object({ questions: z.array(z.string().min(1)).max(5).optional(), orderedTaskIds: z.array(z.string().uuid()).optional(), summary: z.string().max(2000).optional(), assumptions: z.array(z.string().max(300)).max(10).optional() });
export type AiDecision = z.infer<typeof aiDecision>;

export function minute(value: string): number { const [h, m] = value.split(':').map(Number); return h * 60 + m; }
function time(value: number): string { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
function dayNumber(date: string): number { const d = new Date(`${date}T12:00:00Z`).getUTCDay(); return d === 0 ? 7 : d; }

export function applicableCommitments(input: ProposalInput) {
  return input.commitments.filter(c => c.recurring ? c.daysOfWeek.includes(dayNumber(input.date)) : c.date === input.date);
}

export function requiredQuestions(input: ProposalInput): string[] {
  if (input.tasks.length === 0) return ['What tasks do you need to do today? Add at least one task with an estimated duration.'];
  if (!input.commitmentsConfirmed && input.commitments.length === 0)
    return ['Do you have any fixed meetings, sleep, or personal commitments today? Add their times, or confirm that there are none.'];
  const start = Math.max(minute(input.preferences.windowStart), input.isToday ? minute(input.currentTime) + 15 : 0);
  const end = minute(input.preferences.windowEnd);
  if (start >= end) return ['Your planning window has already ended. Extend the end time or choose another day.'];
  const fixed = applicableCommitments(input).filter(c => !c.flexible);
  const orderedFixed = [...fixed].sort((a, b) => minute(a.startTime) - minute(b.startTime));
  if (orderedFixed.some((c, i) => i > 0 && minute(c.startTime) < minute(orderedFixed[i - 1].endTime)))
    return ['Some fixed commitments overlap. Please correct their times before planning.'];
  const fixedMinutes = fixed.reduce((sum, c) => sum + Math.max(0, Math.min(minute(c.endTime), end) - Math.max(minute(c.startTime), start)), 0);
  const workMinutes = input.tasks.reduce((sum, t) => sum + t.estimatedMinutes + input.preferences.bufferMinutes, 0);
  if (workMinutes + fixedMinutes > end - start)
    return ['The tasks and fixed commitments exceed the available window. Which tasks should be deferred, or should the end time change?'];
  return [];
}

export function parseAiDecision(text: string, input: ProposalInput): AiDecision {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const parsed = aiDecision.parse(JSON.parse(clean));
  const validIds = new Set(input.tasks.map(t => t.id));
  if (parsed.orderedTaskIds?.some(id => !validIds.has(id))) throw new Error('AI returned an unknown task');
  return parsed;
}

export function buildPlan(input: ProposalInput, decision: AiDecision): ProposedPlan {
  const start = Math.max(minute(input.preferences.windowStart), input.isToday ? minute(input.currentTime) + 15 : 0);
  const end = minute(input.preferences.windowEnd);
  const fixed = applicableCommitments(input).filter(c => !c.flexible)
    .map(c => ({ ...c, start: Math.max(start, minute(c.startTime)), end: Math.min(end, minute(c.endTime)) }))
    .filter(c => c.end > c.start).sort((a, b) => a.start - b.start);
  const occupied = fixed.map(c => ({ start: c.start, end: c.end }));
  function findSlot(from: number, duration: number): number | null {
    let cursor = from;
    for (const block of occupied) {
      if (cursor + duration <= block.start) return cursor;
      if (cursor < block.end) cursor = block.end;
    }
    return cursor + duration <= end ? cursor : null;
  }
  const priorities = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const order = new Map((decision.orderedTaskIds ?? []).map((id, index) => [id, index]));
  const energy = input.energy?.level ?? 3;
  const energyFit = (requirement?: string) => Math.abs(({ LOW: 2, MEDIUM: 3, HIGH: 5 } as Record<string, number>)[requirement ?? 'MEDIUM'] - energy);
  const urgentDeadline = (due?: string | null) => due && due.slice(0, 10) <= input.date ? 0 : 1;
  const recommended = [...input.tasks].sort((a, b) =>
    urgentDeadline(a.dueDate) - urgentDeadline(b.dueDate)
    || priorities[a.priority] - priorities[b.priority]
    || (order.get(a.id) ?? 1000) - (order.get(b.id) ?? 1000)
    || energyFit(a.energyRequirement) - energyFit(b.energyRequirement)
    || (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
  const items: ProposedItem[] = fixed.map(c => ({ title: c.title, taskId: null, startTime: time(c.start), endTime: time(c.end), bufferMinutes: 0, energyLevel: 'medium', itemType: 'commitment', itemOrder: 0 }));
  let cursor = start;
  let focusBlocks = 0;
  for (const task of recommended) {
    let remaining = task.estimatedMinutes;
    while (remaining > 0) {
      const block = Math.min(input.preferences.focusMinutes, remaining);
      const slot = findSlot(cursor, block);
      if (slot === null) throw new Error('Schedule cannot fit all tasks; defer a task or expand the window');
      items.push({ title: task.title, taskId: task.id, startTime: time(slot), endTime: time(slot + block), bufferMinutes: input.preferences.bufferMinutes,
        energyLevel: task.energyRequirement?.toLowerCase() ?? 'medium', itemType: 'task', itemOrder: 0,
        notes: task.environment ? `Environment: ${task.environment}` : undefined });
      cursor = slot + block + input.preferences.bufferMinutes;
      remaining -= block;
      focusBlocks++;
      if (remaining > 0 || recommended.indexOf(task) < recommended.length - 1) {
        const breakLength = focusBlocks % 4 === 0 ? input.preferences.longBreakMinutes : input.preferences.shortBreakMinutes;
        const breakSlot = findSlot(cursor, breakLength);
        if (breakSlot === null) throw new Error('The available window cannot fit the required recovery breaks; defer a task or extend the window');
        {
          items.push({ title: focusBlocks % 4 === 0 ? 'Long break' : 'Short break', taskId: null,
            startTime: time(breakSlot), endTime: time(breakSlot + breakLength), bufferMinutes: 0,
            energyLevel: 'low', itemType: 'break', itemOrder: 0 });
          cursor = breakSlot + breakLength;
        }
      }
    }
  }
  items.sort((a, b) => minute(a.startTime) - minute(b.startTime));
  for (let i = 0; i < items.length; i++) {
    items[i].itemOrder = i;
    if (i > 0 && minute(items[i].startTime) < minute(items[i - 1].endTime))
      throw new Error('Generated plan contains overlapping items');
  }
  return { planDate: input.date, windowStart: time(start), windowEnd: time(end), source: 'ai',
    assumptions: decision.assumptions ?? [], summary: decision.summary ?? 'A balanced plan with focus blocks, breaks, and fixed commitments.', items };
}
