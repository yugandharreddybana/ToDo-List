import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

type BackendTask = Record<string, unknown> & { status?: string; recurring?: boolean; subtasks?: unknown[]; comments?: unknown[] };
function toUi(task: BackendTask): BackendTask {
  return { ...task, status: task.status === 'ARCHIVED' ? 'CANCELLED' : task.status, isRecurring: task.recurring };
}
function toBackend(body: Record<string, unknown>): Record<string, unknown> {
  const { isRecurring, ...rest } = body;
  return { ...rest, ...(isRecurring === undefined ? {} : { recurring: isRecurring }), status: rest.status === 'CANCELLED' ? 'ARCHIVED' : rest.status };
}

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks: BackendTask[] = [];
    const { tags, dueBefore, dueAfter, status, ...filters } = req.query;
    const backendStatus = status === 'CANCELLED' ? 'ARCHIVED' : status;
    const tag = Array.isArray(tags) ? tags[0] : tags;
    let page = 1;
    let totalPages = 1;
    do {
      const { data } = await client(req).get<{ items: BackendTask[]; totalPages: number }>('/tasks', { params: { ...filters, status: backendStatus, tag, page, limit: 100 } });
      tasks.push(...data.items);
      totalPages = data.totalPages;
      page++;
    } while (page <= totalPages && page <= 100);
    if (page <= totalPages) { res.status(422).json({ error: { code: 'TOO_MANY_TASKS', message: 'Task list exceeds the supported size; narrow your filters.' } }); return; }
    const filtered = tasks.filter((task) => {
      if (!task.dueDate) return !dueBefore && !dueAfter;
      const due = String(task.dueDate).slice(0, 10);
      return (!dueBefore || due <= String(dueBefore)) && (!dueAfter || due >= String(dueAfter));
    });
    res.json(filtered.map(toUi));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post<BackendTask>('/tasks', toBackend(req.body));
    res.status(201).json(toUi(data));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get<BackendTask>(`/tasks/${req.params.id}`);
    res.json(toUi(data));
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put<BackendTask>(`/tasks/${req.params.id}`, toBackend(req.body));
    res.json(toUi(data));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch<BackendTask>(`/tasks/${req.params.id}`, toBackend(req.body));
    res.json(toUi(data));
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
      `/tasks/${req.params.taskId}/subtasks/${req.params.subId}/completed`,
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
