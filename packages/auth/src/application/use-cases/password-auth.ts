import { PermissionAction, UserRole } from '@tiktok/types';
import { AppError, conflict, forbidden, unauthenticated } from '../../domain/errors';
import { hasPermission } from '../../domain/rbac';
import { UserRecord } from '../../domain/user';
import { hashPassword, verifyPassword } from '../../security/password';
import { RateLimiter, UserRepository } from '../ports';
import { RATE_LIMITS, enforceRateLimit } from '../rate-limit';
import { loginInputSchema, parseInput, registerInputSchema } from '../schemas';

export interface PasswordAuthDeps {
  users: UserRepository;
  rateLimiter: RateLimiter;
}

export interface RequestContext {
  ipAddress: string;
}

/** Same message for unknown email, wrong password, and TikTok-only accounts: no account enumeration. */
const INVALID_CREDENTIALS = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';

export async function loginWithPassword(
  deps: PasswordAuthDeps,
  rawInput: unknown,
  ctx: RequestContext
): Promise<UserRecord> {
  await enforceRateLimit(deps.rateLimiter, `login:ip:${ctx.ipAddress}`, RATE_LIMITS.loginPerIp);
  const input = parseInput(loginInputSchema, rawInput);
  await enforceRateLimit(deps.rateLimiter, `login:email:${input.email}`, RATE_LIMITS.loginPerEmail);

  const user = await deps.users.findByEmail(input.email);
  const isMatch = await verifyPassword(input.password, user?.passwordHash ?? null);
  if (!user || !isMatch) {
    throw unauthenticated(INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw forbidden('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
  }
  if (!hasPermission(user.role, PermissionAction.ACCESS_BACKOFFICE)) {
    throw forbidden('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบหลังร้าน');
  }

  return user;
}

export async function registerCreator(
  deps: PasswordAuthDeps,
  rawInput: unknown,
  ctx: RequestContext
): Promise<UserRecord> {
  await enforceRateLimit(deps.rateLimiter, `register:ip:${ctx.ipAddress}`, RATE_LIMITS.registerPerIp);
  const input = parseInput(registerInputSchema, rawInput);

  const [emailOwner, handleOwner] = await Promise.all([
    deps.users.findByEmail(input.email),
    deps.users.findByHandle(input.creatorHandle),
  ]);
  if (emailOwner) {
    throw conflict('ไม่สามารถสมัครด้วยอีเมลนี้ได้ หากมีบัญชีอยู่แล้วกรุณาเข้าสู่ระบบ');
  }
  if (handleOwner) {
    throw conflict(`Handle "${input.creatorHandle}" ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น`);
  }

  const passwordHash = await hashPassword(input.password);
  try {
    return await deps.users.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      creatorHandle: input.creatorHandle,
      role: UserRole.CREATOR,
    });
  } catch (error: unknown) {
    // A concurrent registration can win the race after our pre-checks.
    if (error instanceof AppError && error.code === 'CONFLICT') {
      throw conflict('อีเมลหรือ Handle นี้ถูกใช้งานแล้ว');
    }
    throw error;
  }
}
