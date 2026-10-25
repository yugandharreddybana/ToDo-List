import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

function toUi(shift: Record<string, unknown>) {
  return { ...shift, shiftDate: shift.date, type: shift.shiftType };
}
function toBackend(body: Record<string, unknown>) {
  const { shiftDate, type, ...rest } = body;
  return { ...rest, date: shiftDate, shiftType: type };
}

router.get('/shifts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/roster/shifts', { params: req.query });
    const { from, to } = req.query;
    res.json((data as Record<string, unknown>[]).filter(s => (!from || String(s.date) >= String(from)) && (!to || String(s.date) <= String(to))).map(toUi));
  } catch (err) {
    next(err);
  }
});

router.post('/shifts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/roster/shifts', toBackend(req.body));
    res.status(201).json(toUi(data));
  } catch (err) {
    next(err);
  }
});

router.put('/shifts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).patch(`/roster/shifts/${req.params.id}`, toBackend(req.body));
    res.json(toUi(data));
  } catch (err) {
    next(err);
  }
});

router.delete('/shifts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/roster/shifts/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
