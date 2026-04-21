import type { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../services/token.service.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing access token' } });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccess(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' } });
  }
}
