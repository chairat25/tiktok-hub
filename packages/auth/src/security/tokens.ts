import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_BYTES = 32;

/** 256-bit, URL-safe random token from the OS CSPRNG. */
export function generateToken(bytes: number = TOKEN_BYTES): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Session tokens are stored only as SHA-256 digests, so a database leak does
 * not hand out live sessions. A fast hash is fine here because the input is a
 * high-entropy random token, not a human password.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
