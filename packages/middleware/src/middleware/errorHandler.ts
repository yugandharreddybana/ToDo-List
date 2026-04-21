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
      error: { code: 'BACKEND_ERROR', message: body?.message ?? err.message },
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Something went wrong';
  console.error('[middleware] unhandled error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } });
}
