import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.routes.js';
import usersRouter from './routes/users.routes.js';
import tasksRouter from './routes/tasks.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import goalsRouter from './routes/goals.routes.js';
import careerRouter from './routes/career.routes.js';
import healthRouter from './routes/health.routes.js';
import rosterRouter from './routes/roster.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import notificationsRouter from './routes/notifications.routes.js';
import aiRouter from './routes/ai.routes.js';

const PORT = Number(process.env.PORT ?? 3001);
const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? 'http://localhost:3002')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, mobile apps, etc.)
      if (!origin) return callback(null, true);
      if (CORS_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 200),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
  }),
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'middleware', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/career', careerRouter);
app.use('/api/health', healthRouter);
app.use('/api/roster', rosterRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ai', aiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler as express.ErrorRequestHandler);

app.listen(PORT, () => {
  console.log(`[middleware] listening on :${PORT}`);
});
