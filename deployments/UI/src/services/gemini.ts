import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!_ai) {
    if (!API_KEY) throw new Error('Gemini API key not set. Add VITE_GEMINI_API_KEY to your .env file.');
    _ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return _ai;
}

/** Translates raw API errors into friendly messages */
function friendlyError(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate')) {
    throw new Error('AI quota reached. Please wait a moment and try again, or check your Gemini API plan.');
  }
  if (msg.includes('403') || msg.toLowerCase().includes('api key')) {
    throw new Error('Invalid Gemini API key. Check VITE_GEMINI_API_KEY in your .env file.');
  }
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
    throw new Error('Network error — make sure you are connected to the internet.');
  }
  throw new Error(`AI error: ${msg}`);
}

async function callGemini(prompt: string): Promise<string> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    return response.text ?? '';
  } catch (err) {
    friendlyError(err);
  }
}

function stripJSON(raw: string): string {
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

/* ─── Types ─────────────────────────────────────────────────── */
export interface GeminiTask {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  dueDate?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

/* ─── Task generation ────────────────────────────────────────── */
export async function generateTasksFromPrompt(prompt: string): Promise<GeminiTask[]> {
  const today = new Date().toISOString().split('T')[0];
  const systemPrompt = `You are a productivity assistant. Extract actionable tasks from the user's description.
Today's date is ${today}.
Respond ONLY with a valid JSON array. Each item:
{ "title": string, "description"?: string, "priority": "LOW"|"MEDIUM"|"HIGH"|"URGENT", "tags": string[], "dueDate"?: "YYYY-MM-DD", "isRecurring"?: boolean, "recurringPattern"?: string }
Return ONLY the JSON array, no markdown.

User request: ${prompt}`;

  const raw = await callGemini(systemPrompt);
  try {
    const parsed = JSON.parse(stripJSON(raw));
    return Array.isArray(parsed) ? (parsed as GeminiTask[]) : [];
  } catch {
    return [];
  }
}

export async function parseVoiceToTasks(transcript: string): Promise<GeminiTask[]> {
  return generateTasksFromPrompt(`[Voice input] ${transcript}`);
}

/* ─── AI coaching ────────────────────────────────────────────── */
export async function getAIInsight(
  userMessage: string,
  context?: { tasks?: { title: string; status: string; priority: string }[]; userName?: string },
): Promise<string> {
  const parts: string[] = [
    'You are a personal productivity coach embedded in a todo app.',
    'Be concise, motivating, and practical.',
    'Format responses in plain text with occasional **bold** for emphasis.',
  ];
  if (context?.userName) parts.push(`User name: ${context.userName}.`);
  if (context?.tasks?.length) {
    parts.push('Current tasks:\n' + context.tasks.slice(0, 15).map((t) => `- ${t.title} (${t.status}, ${t.priority})`).join('\n'));
  }
  parts.push(`\nUser: ${userMessage}`);
  return callGemini(parts.join('\n'));
}

/* ─── CV analysis ────────────────────────────────────────────── */
export async function matchCVToRoles(cvText: string): Promise<{
  topRoles: { role: string; match: number; reason: string }[];
  skills: string[];
  gaps: string[];
  summary: string;
}> {
  const prompt = `Analyze this CV/resume and return ONLY valid JSON:
{
  "topRoles": [{ "role": "string", "match": 0-100, "reason": "string" }],
  "skills": ["string"],
  "gaps": ["string"],
  "summary": "string"
}

CV:
${cvText.slice(0, 8000)}`;

  const raw = await callGemini(prompt);
  try {
    return JSON.parse(stripJSON(raw));
  } catch {
    return { topRoles: [], skills: [], gaps: [], summary: 'Could not parse CV analysis. Please try again.' };
  }
}

/* ─── Job search / ATS matching ─────────────────────────────── */
export interface JobMatch {
  title: string;
  company: string;
  location: string;
  salary?: string;
  url?: string;
  atsScore: number;
  matchReason: string;
  postedDate: string;
}

export async function findMatchingJobs(cvSummary: string, skills: string[]): Promise<JobMatch[]> {
  const prompt = `Given this candidate profile, generate 6 realistic job listings that would match them at 80%+ ATS score.
These should represent jobs that would typically be posted in the last 48 hours.

Candidate skills: ${skills.join(', ')}
Profile summary: ${cvSummary.slice(0, 1000)}

Return ONLY valid JSON array:
[{
  "title": "Job Title",
  "company": "Company Name",
  "location": "City, Country or Remote",
  "salary": "£50k-£70k",
  "url": "https://linkedin.com/jobs/view/example",
  "atsScore": 85,
  "matchReason": "Strong match because...",
  "postedDate": "${new Date().toISOString().split('T')[0]}"
}]

Return ONLY the JSON array.`;

  const raw = await callGemini(prompt);
  try {
    const parsed = JSON.parse(stripJSON(raw));
    return Array.isArray(parsed) ? (parsed as JobMatch[]) : [];
  } catch {
    return [];
  }
}
