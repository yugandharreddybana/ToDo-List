import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/analytics/summary', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/heatmap', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/analytics/heatmap');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
