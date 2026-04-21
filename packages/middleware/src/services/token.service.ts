import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL ?? process.env.JWT_ACCESS_TTL_SECONDS ?? 900);
const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30);

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set');
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
}

export function signAccess(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefresh(payload: Pick<TokenPayload, 'sub'>): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: `${REFRESH_TTL_DAYS}d`,
  });
}

export function verifyAccess(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefresh(token: string): Pick<TokenPayload, 'sub'> {
  return jwt.verify(token, REFRESH_SECRET) as Pick<TokenPayload, 'sub'>;
}

export const REFRESH_COOKIE = 'tps_refresh';
export const REFRESH_COOKIE_MAX_AGE = REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
