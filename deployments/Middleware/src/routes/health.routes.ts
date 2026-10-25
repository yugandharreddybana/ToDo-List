import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
type BackendLog = Record<string, unknown> & { date?: string; waterIntakeLiters?: number };
const toUiLog = (log: BackendLog) => ({ ...log, logDate: log.date, waterMl: log.waterIntakeLiters == null ? undefined : Math.round(Number(log.waterIntakeLiters) * 1000) });
const toBackendLog = (body: Record<string, unknown>) => ({ ...body, date: body.logDate, waterIntakeLiters: body.waterMl == null ? undefined : Number(body.waterMl) / 1000 });
type BackendHabit = Record<string, unknown> & { frequency?: string };
const toUiHabit = (habit: BackendHabit) => ({ ...habit, targetFrequency: habit.frequency === 'WEEKLY' ? 1 : 7, active: true });
const toBackendHabit = (body: Record<string, unknown>) => ({ ...body, frequency: Number(body.targetFrequency) === 1 ? 'WEEKLY' : 'DAILY' });

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/health/logs', { params: req.query });
    res.json((data as BackendLog[]).map(toUiLog));
  } catch (err) {
    next(err);
  }
});

router.post('/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post<BackendLog>('/health/logs', toBackendLog(req.body));
    res.status(201).json(toUiLog(data));
  } catch (err) {
    next(err);
  }
});

router.put('/logs/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put<BackendLog>(`/health/logs/${req.params.id}`, toBackendLog(req.body));
    res.json(toUiLog(data));
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
    res.json((data as BackendHabit[]).map(toUiHabit));
  } catch (err) {
    next(err);
  }
});

router.post('/habits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post<BackendHabit>('/health/habits', toBackendHabit(req.body));
    res.status(201).json(toUiHabit(data));
  } catch (err) {
    next(err);
  }
});

router.put('/habits/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put<BackendHabit>(`/health/habits/${req.params.id}`, toBackendHabit(req.body));
    res.json(toUiHabit(data));
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

router.get('/habits/logs/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/health/habits/logs', { params: req.query });
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/habits/:id/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post(
      `/health/habits/${req.params.id}/logs`,
      { ...req.body, date: req.body.logDate },
    );
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
