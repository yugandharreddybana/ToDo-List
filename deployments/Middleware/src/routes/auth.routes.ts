import { Router, type Request, type Response, type NextFunction } from 'express';
import { backendClient, backendAuthed } from '../services/backend.client.js';
import { requireAuth } from '../middleware/auth.js';
import { REFRESH_COOKIE, REFRESH_COOKIE_MAX_AGE } from '../services/token.service.js';

const router = Router();

interface BackendAuthResponse {
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  timezone?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
}

function toClientResponse(data: BackendAuthResponse) {
  const { userId, email, name, avatarUrl, timezone, accessToken, accessTokenExpiresAt } = data;
  return {
    accessToken,
    accessTokenExpiresAt,
    user: { id: userId, email, name, avatarUrl, timezone: timezone ?? 'UTC' },
  };
}

function setCookieAndRespond(
  res: Response,
  refreshToken: string,
  clientBody: Record<string, unknown>,
  status = 200,
) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/',
  });
  res.status(status).json(clientBody);
}

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await backendClient.post<BackendAuthResponse>('/auth/register', req.body);
    setCookieAndRespond(res, data.refreshToken, toClientResponse(data), 201);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data } = await backendClient.post<BackendAuthResponse>('/auth/login', req.body);
    setCookieAndRespond(res, data.refreshToken, toClientResponse(data));
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) {
      res.status(401).json({ error: { code: 'NO_REFRESH_TOKEN', message: 'Refresh token missing' } });
      return;
    }
    const { data } = await backendClient.post<BackendAuthResponse>('/auth/refresh', { refreshToken });
    setCookieAndRespond(res, data.refreshToken, toClientResponse(data));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
    if (refreshToken) {
      await backendAuthed(req.headers.authorization!.slice(7))
        .post('/auth/logout', { refreshToken })
        .catch(() => undefined);
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization!.slice(7);
    const { data } = await backendAuthed(accessToken).get('/users/me');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
