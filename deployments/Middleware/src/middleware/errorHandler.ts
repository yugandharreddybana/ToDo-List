import type { Request, Response, NextFunction } from 'express';
import { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 502;
    const body = err.response?.data as { message?: string } | undefined;
    res.status(status).json({
      error: { code: 'BACKEND_ERROR', message: status < 500 ? body?.message ?? 'Request rejected' : 'Service unavailable' },
    });
    return;
  }

  console.error('[middleware] unhandled error:', err);
  if (!res.headersSent) res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
  else res.end();
}
