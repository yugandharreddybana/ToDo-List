import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/health/logs', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/health/logs', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/logs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/health/logs/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/logs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/health/logs/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/habits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/health/habits');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/habits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/health/habits', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/habits/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/health/habits/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/habits/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/health/habits/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/habits/:id/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/health/habits/${req.params.id}/logs`, {
      params: req.query,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/habits/:id/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post(
      `/health/habits/${req.params.id}/logs`,
      req.body,
    );
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
