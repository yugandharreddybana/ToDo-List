import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TTL_SECONDS = Number(process.env.JWT_REFRESH_TTL ?? 604800);

if (!ACCESS_SECRET || ACCESS_SECRET.length < 32) {
  throw new Error('JWT_ACCESS_SECRET must be set to at least 32 characters');
}

export interface TokenPayload {
  sub: string;
  email: string;
}

export function verifyAccess(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export const REFRESH_COOKIE = 'tps_refresh';
export const REFRESH_COOKIE_MAX_AGE = REFRESH_TTL_SECONDS * 1000;
