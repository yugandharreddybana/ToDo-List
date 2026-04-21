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
    const { data } = await client(req).get('/tasks', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/tasks', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/tasks/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/tasks/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch(`/tasks/${req.params.id}/status`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/tasks/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/reorder', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/tasks/reorder', req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/subtasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/tasks/${req.params.id}/subtasks`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/subtasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post(`/tasks/${req.params.id}/subtasks`, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.patch('/:taskId/subtasks/:subId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch(
      `/tasks/${req.params.taskId}/subtasks/${req.params.subId}`,
      req.body,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:taskId/subtasks/:subId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/tasks/${req.params.taskId}/subtasks/${req.params.subId}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/tasks/${req.params.id}/comments`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post(`/tasks/${req.params.id}/comments`, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:taskId/comments/:commentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/tasks/${req.params.taskId}/comments/${req.params.commentId}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
