import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';
import { streamChat, singleChat, type ChatMessage } from '../services/ai.service.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'messages array required' } });
      return;
    }
    await streamChat(messages, res);
  } catch (err) {
    next(err);
  }
});

router.post('/chat/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'messages array required' } });
      return;
    }
    const text = await singleChat(messages);
    res.json({ text });
  } catch (err) {
    next(err);
  }
});

router.get('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/api/ai/conversations');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/conversations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/api/ai/conversations/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/conversations', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/api/ai/conversations', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/conversations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/api/ai/conversations/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/conversations/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/api/ai/conversations/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
