import { api } from '../lib/api';

export interface AITask {
  title: string;
  description?: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  durationMinutes: number;
  tags?: string[];
  dueDate?: string | null;
  isRecurring?: boolean;
  recurrenceFreq?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

async function ask(prompt: string): Promise<string> {
  const { data } = await api.post<{ text: string }>('/api/ai/chat/sync', { messages: [{ role: 'user', content: prompt }] });
  return data.text;
}

function parseJson<T>(text: string, fallback: T): T {
  try {
    const match = text.match(/[\[{][\s\S]*[\]}]/);
    return match ? JSON.parse(match[0]) as T : fallback;
  } catch { return fallback; }
}

export async function generateTasksFromPrompt(prompt: string): Promise<AITask[]> {
  const parsed = parseJson<unknown>(await ask(`Extract actionable tasks. Do not invent durations, deadlines, or recurrence. Return either {"questions":["one concise question"]} if a task lacks a clear estimated duration or priority, or ONLY a JSON array of {title,description,priority,durationMinutes,dueDate,isRecurring,recurrenceFreq,tags}. priority is URGENT, HIGH, MEDIUM, or LOW; recurrenceFreq is DAILY, WEEKLY, or MONTHLY when explicitly stated. Request: ${prompt}`), []);
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && 'questions' in parsed) {
    const questions = (parsed as { questions?: unknown }).questions;
    if (Array.isArray(questions) && typeof questions[0] === 'string') throw new Error(questions[0]);
  }
  if (!Array.isArray(parsed)) return [];
  const valid = parsed.filter((task): task is Record<string, unknown> => typeof task === 'object' && task !== null && typeof task.title === 'string' && task.title.trim().length > 0);
  for (const task of valid) {
    if (typeof task.durationMinutes !== 'number' || !Number.isInteger(task.durationMinutes) || task.durationMinutes < 1 || task.durationMinutes > 1440)
      throw new Error(`How many minutes will “${String(task.title)}” take? Add an estimate and try again.`);
    if (!['URGENT', 'HIGH', 'MEDIUM', 'LOW'].includes(String(task.priority)))
      throw new Error(`What priority is “${String(task.title)}”? Add it and try again.`);
    if (task.isRecurring === true && (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(String(task.recurrenceFreq)) || !task.dueDate))
      throw new Error(`What is the first due date and repeat frequency for “${String(task.title)}”?`);
  }
  return valid
    .map(task => ({
      title: String(task.title).trim(),
      description: typeof task.description === 'string' ? task.description : undefined,
      priority: task.priority as AITask['priority'],
      durationMinutes: task.durationMinutes as number,
      tags: Array.isArray(task.tags) ? task.tags.filter((tag): tag is string => typeof tag === 'string') : undefined,
      dueDate: typeof task.dueDate === 'string' ? task.dueDate : undefined,
      isRecurring: task.isRecurring === true,
      recurrenceFreq: task.isRecurring === true ? task.recurrenceFreq as AITask['recurrenceFreq'] : undefined,
    }));
}

export async function parseVoiceToTasks(transcript: string): Promise<AITask[]> {
  return generateTasksFromPrompt(transcript);
}

export async function getAIInsight(context: unknown, question?: unknown): Promise<string> {
  return ask(`Analyze this productivity context and provide practical, evidence-based guidance. ${typeof question === 'string' ? question : ''}\n${JSON.stringify(context)}\n${typeof question === 'object' ? JSON.stringify(question) : ''}`);
}
