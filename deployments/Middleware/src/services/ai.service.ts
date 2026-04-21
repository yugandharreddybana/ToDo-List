import Anthropic from '@anthropic-ai/sdk';
import type { Response } from 'express';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-6';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a productivity coach embedded in a productivity suite application.
You help users manage tasks, set goals, track habits, and stay focused.
Be concise, practical, and encouraging. When relevant, reference the user's context from their tasks and goals.`;

export async function streamChat(
  messages: ChatMessage[],
  res: Response,
): Promise<void> {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
    }
  }

  const final = await stream.finalMessage();
  res.write(
    `data: ${JSON.stringify({ done: true, usage: final.usage })}\n\n`,
  );
  res.end();
}

export async function singleChat(messages: ChatMessage[]): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
