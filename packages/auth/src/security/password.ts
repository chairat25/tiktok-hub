import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;
/** bcrypt silently ignores input beyond 72 bytes, so longer passwords are rejected outright. */
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Pre-computed hash compared against when the account does not exist, so that
 * "unknown email" and "wrong password" take the same time to answer.
 */
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer-not-a-real-password', BCRYPT_COST);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return hash !== null && isMatch;
}

export function passwordByteLength(password: string): number {
  return Buffer.byteLength(password, 'utf8');
}
