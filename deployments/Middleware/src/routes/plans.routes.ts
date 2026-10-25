import { Router, type Request } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { backendAuthed } from '../services/backend.client.js';
import { singleChat } from '../services/ai.service.js';
import { proposalInput, requiredQuestions, parseAiDecision, buildPlan } from '../services/plan-proposal.js';

const router = Router();
router.use(requireAuth);
const client = (req: Request) => backendAuthed(req.headers.authorization!.slice(7));

router.get('/', async (req, res, next) => { try { res.json((await client(req).get('/plans', { params: req.query })).data); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { res.status(201).json((await client(req).post('/plans', req.body)).data); } catch (e) { next(e); } });
router.post('/:id/approve', async (req, res, next) => { try { res.json((await client(req).post(`/plans/${req.params.id}/approve`)).data); } catch (e) { next(e); } });
router.post('/:id/replan', async (req, res, next) => { try { res.json((await client(req).post(`/plans/${req.params.id}/replan`, req.body)).data); } catch (e) { next(e); } });
router.post('/energy', async (req, res, next) => { try { await client(req).post('/plans/energy', req.body); res.status(201).end(); } catch (e) { next(e); } });
router.post('/proposal', async (req, res, next) => {
  try {
    const parsed = proposalInput.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid planning context', details: parsed.error.flatten() } }); return; }
    const input = parsed.data;
    const questions = requiredQuestions(input);
    if (questions.length) { res.json({ questions }); return; }
    const prompt = `Analyze the user's tasks, current energy and mood, commitments, past focus behavior, and feedback. Ask up to three concise clarification questions only if there is a material ambiguity. Otherwise recommend an energy-aware task ordering, putting urgent/deadline work first where feasible. Do not invent tasks or facts. The server will assign exact times, focus blocks, breaks and buffers. Return ONLY JSON: {"questions":[]} OR {"orderedTaskIds":["existing UUID only"],"summary":"clear rationale","assumptions":[]}. Context: ${JSON.stringify(input)}`;
    const decision = parseAiDecision(await singleChat([{ role: 'user', content: prompt }]), input);
    if (decision.questions?.length) { res.json({ questions: decision.questions }); return; }
    try { res.json({ plan: buildPlan(input, decision) }); }
    catch (error) { res.json({ questions: [error instanceof Error ? error.message : 'Please adjust the planning window or tasks.'] }); }
  } catch (e) { next(e); }
});
export default router;
