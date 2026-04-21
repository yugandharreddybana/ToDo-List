import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/shifts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/api/roster/shifts', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/shifts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/api/roster/shifts', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/shifts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/api/roster/shifts/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/shifts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/api/roster/shifts/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
