import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';
import { streamChat, singleChat, type ChatMessage } from '../services/ai.service.js';
import { z } from 'zod';

const router = Router();
const chatInput = z.object({ messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(8000) })).min(1).max(40) });

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = chatInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid chat messages' } });
      return;
    }
    await streamChat(parsed.data.messages as ChatMessage[], res);
  } catch (err) {
    next(err);
  }
});

router.post('/chat/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = chatInput.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid chat messages' } });
      return;
    }
    const text = await singleChat(parsed.data.messages as ChatMessage[]);
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

router.get('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/ai/conversations');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/conversations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/ai/conversations/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/ai/conversations', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/conversations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/ai/conversations/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/conversations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/ai/conversations/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
