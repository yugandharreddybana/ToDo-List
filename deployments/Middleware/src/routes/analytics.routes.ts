import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';
import { singleChat } from '../services/ai.service.js';
import { z } from 'zod';

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
    const { data } = await client(req).get('/analytics/productivity-heatmap');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

const reportSchema = z.object({ rating: z.number().min(0).max(10), wentWell: z.array(z.string()).max(5), improve: z.array(z.string()).max(5), nextSteps: z.array(z.string()).max(5), explanation: z.string() });
router.post('/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = String(req.body?.period ?? 'day');
    const from = req.body?.from;
    const to = req.body?.to;
    if (!['day', 'week', 'month', 'quarter', 'year', 'custom'].includes(period)) { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid period' } }); return; }
    const { data } = await client(req).get('/analytics/summary', { params: { period, from, to } });
    const prompt = `Analyze the following measured productivity data. Explain what went well, what can improve, and concrete next steps. Rate observed productivity from 0 to 10 only when enough data exists; otherwise rate 0 and clearly state that data is insufficient. Do not infer health or personality from productivity. Return ONLY JSON: {"rating":number,"wentWell":[string],"improve":[string],"nextSteps":[string],"explanation":string}. Data: ${JSON.stringify(data)}`;
    const raw = await singleChat([{ role: 'user', content: prompt }]);
    const clean = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const report = reportSchema.parse(JSON.parse(clean));
    res.json({ ...report, period, fromDate: data.fromDate, toDate: data.toDate });
  } catch (err) { next(err); }
});

export default router;
