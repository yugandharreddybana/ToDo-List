import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

function client(req: Request) {
  return backendAuthed(req.headers.authorization!.slice(7));
}

router.get('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/api/career/applications', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/applications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/api/career/applications', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get(`/api/career/applications/${req.params.id}`);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(
      `/api/career/applications/${req.params.id}`,
      req.body,
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/applications/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/api/career/applications/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).get('/api/career/contacts', { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/contacts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).post('/api/career/contacts', req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/contacts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await client(req).put(`/api/career/contacts/${req.params.id}`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/contacts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await client(req).delete(`/api/career/contacts/${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
