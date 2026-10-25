import type { Response } from 'express';

const MODEL = process.env.NVIDIA_MODEL ?? 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
const BASE_URL = (process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
const API_KEY = process.env.NVIDIA_API_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are an adaptive productivity planning assistant. Do not invent schedules, deadlines, commitments, energy, or user history. Ask a concise clarification question when required information is missing. When enough information exists, propose a sustainable plan with buffers, breaks, realistic focus blocks, and explicit assumptions. The user must approve a plan before it becomes active. Never claim that an action was completed unless the application confirms it.`;

async function complete(messages: ChatMessage[], stream: boolean, max_tokens: number): Promise<globalThis.Response> {
  if (!API_KEY) throw new Error('NVIDIA_API_KEY is not configured');
  return fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages], max_tokens, temperature: 0.2, stream }),
    signal: AbortSignal.timeout(60_000),
  });
}

export async function streamChat(
  messages: ChatMessage[],
  res: Response,
): Promise<void> {
  const response = await complete(messages, true, 3000);
  if (!response.ok || !response.body) throw new Error(`NVIDIA API error (${response.status})`);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ') || line.slice(6).trim() === '[DONE]') continue;
      try {
        const chunk = JSON.parse(line.slice(6));
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
      } catch { /* provider event may be incomplete */ }
    }
  }
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}

export async function singleChat(messages: ChatMessage[]): Promise<string> {
  const response = await complete(messages, false, 3000);
  if (!response.ok) throw new Error(`NVIDIA API error (${response.status})`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return body.choices?.[0]?.message?.content ?? '';
}
