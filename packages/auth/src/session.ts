import jwt from 'jsonwebtoken';
import { AuthSession } from '@tiktok/types';

const DEFAULT_SECRET = process.env.AUTH_SECRET || 'tiktok_showcase_super_secret_jwt_token_2026';

export function signSessionToken(
  session: AuthSession['user'],
  secret: string = DEFAULT_SECRET,
  expiresIn: string = '7d'
): string {
  return jwt.sign(session, secret, { expiresIn: expiresIn as any });
}

export function verifySessionToken(
  token: string,
  secret: string = DEFAULT_SECRET
): AuthSession['user'] | null {
  try {
    const decoded = jwt.verify(token, secret) as AuthSession['user'];
    return decoded;
  } catch (error) {
    return null;
  }
}
