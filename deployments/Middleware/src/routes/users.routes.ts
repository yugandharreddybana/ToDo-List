import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/users/me');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch('/users/me', req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch('/users/me', req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/account', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete('/users/me');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
