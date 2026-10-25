import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
type BackendGoal = Record<string, unknown> & { notes?: string; milestones?: unknown[] };
const toUi = (goal: BackendGoal) => ({ ...goal, description: goal.notes });
const toBackend = (body: Record<string, unknown>) => {
  const { description, ...rest } = body;
  return { ...rest, ...(description === undefined ? {} : { notes: description }) };
};

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/goals', { params: req.query });
    res.json((data as BackendGoal[]).map(toUi));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post<BackendGoal>('/goals', toBackend(req.body));
    res.status(201).json(toUi(data));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/goals/${req.params.id}`);
    res.json(toUi(data as BackendGoal));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch<BackendGoal>(`/goals/${req.params.id}`, toBackend(req.body));
    res.json(toUi(data));
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
    const { data } = await client(req).post(`/goals/${req.params.id}/milestones`, { ...req.body, targetDate: req.body.dueDate });
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
