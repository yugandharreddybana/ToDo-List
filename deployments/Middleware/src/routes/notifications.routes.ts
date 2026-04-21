import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/notifications');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch(`/notifications/${req.params.id}/read`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch('/notifications/read-all');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/notifications/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
