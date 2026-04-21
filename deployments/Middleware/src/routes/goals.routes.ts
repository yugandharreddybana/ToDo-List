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
    const { data } = await client(req).get('/goals', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/goals', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/goals/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/goals/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch(`/goals/${req.params.id}/progress`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/goals/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/:id/milestones', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/goals/${req.params.id}/milestones`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/milestones', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post(`/goals/${req.params.id}/milestones`, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:goalId/milestones/:milestoneId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch(
      `/goals/${req.params.goalId}/milestones/${req.params.milestoneId}`,
      req.body,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:goalId/milestones/:milestoneId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(
      `/goals/${req.params.goalId}/milestones/${req.params.milestoneId}`,
    );
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
