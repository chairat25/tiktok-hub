import { PermissionAction } from '@tiktok/types';
import { AppError, conflict, notFound, validationError } from '../../domain/errors';
import { assertPermission } from '../../domain/rbac';
import { PublicUser, UserRecord, toPublicUser } from '../../domain/user';
import { SessionRepository, UserPatch, UserRepository } from '../ports';
import { creatorSettingsInputSchema, parseInput } from '../schemas';

export interface Actor {
  user: UserRecord;
  sessionId: string;
}

export async function updateCreatorSettings(
  deps: { users: UserRepository },
  actor: Actor,
  rawInput: unknown
): Promise<PublicUser> {
  assertPermission(actor.user.role, PermissionAction.MANAGE_SHOP_SETTINGS);
  const input = parseInput(creatorSettingsInputSchema, rawInput);

  if (input.creatorHandle && input.creatorHandle !== actor.user.creatorHandle) {
    const owner = await deps.users.findByHandle(input.creatorHandle);
    if (owner && owner.id !== actor.user.id) {
      throw conflict(`Handle ${input.creatorHandle} มีผู้ใช้งานแล้ว`);
    }
  }

  const patch: UserPatch = {
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.creatorHandle !== undefined ? { creatorHandle: input.creatorHandle } : {}),
    ...(input.tiktokShopUrl !== undefined ? { tiktokShopUrl: input.tiktokShopUrl } : {}),
    ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
  };

  try {
    return toPublicUser(await deps.users.update(actor.user.id, patch));
  } catch (error: unknown) {
    if (error instanceof AppError && error.code === 'CONFLICT') {
      throw conflict('Handle นี้มีผู้ใช้งานแล้ว');
    }
    throw error;
  }
}

/**
 * Removes the TikTok identity from the account and signs out every other
 * session, since some of them may have been created through TikTok login.
 */
export async function unlinkTikTokAccount(
  deps: { users: UserRepository; sessions: SessionRepository },
  actor: Actor
): Promise<PublicUser> {
  const user = await deps.users.findById(actor.user.id);
  if (!user) throw notFound('ไม่พบบัญชีผู้ใช้');
  if (!user.tiktokOpenId) throw validationError('บัญชีนี้ยังไม่ได้เชื่อมต่อกับ TikTok');
  if (!user.passwordHash || !user.email) {
    throw validationError(
      'ไม่สามารถยกเลิกการเชื่อมต่อได้ เนื่องจากบัญชียังไม่มีอีเมลและรหัสผ่านสำหรับเข้าสู่ระบบ'
    );
  }

  const updated = await deps.users.update(user.id, {
    tiktokOpenId: null,
    tiktokUsername: null,
    tiktokAvatarUrl: null,
  });
  await deps.sessions.deleteAllForUser(user.id, { exceptId: actor.sessionId });
  return toPublicUser(updated);
}
