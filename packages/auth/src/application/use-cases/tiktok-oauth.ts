import { PermissionAction, UserRole } from '@tiktok/types';
import { conflict, forbidden, oauthFailed, unauthenticated } from '../../domain/errors';
import { hasPermission } from '../../domain/rbac';
import { SessionAudience } from '../../domain/session-policy';
import { UserRecord } from '../../domain/user';
import { generateToken, safeEqual } from '../../security/tokens';
import { Clock, TikTokIdentityProvider, TikTokProfile, UserRepository } from '../ports';

export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const MAX_RETURN_TO_LENGTH = 512;
const HANDLE_ATTEMPTS = 5;

export type OAuthMode = 'login' | 'link';

/**
 * Stored in an httpOnly, host-only cookie for the duration of the redirect
 * round trip. Binding the state to the initiating browser (and, for linking,
 * to the signed-in user) blocks login CSRF and forced account linking.
 */
export interface OAuthStateRecord {
  state: string;
  mode: OAuthMode;
  returnTo: string;
  userId: string | null;
  expiresAt: number;
}

export interface TikTokOAuthDeps {
  users: UserRepository;
  tiktok: TikTokIdentityProvider;
  clock: Clock;
}

/** Only same-origin absolute paths are allowed, so the callback can never become an open redirect. */
export function sanitizeReturnTo(value: string | null | undefined, fallback: string): string {
  if (!value || value.length > MAX_RETURN_TO_LENGTH) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (/[\u0000-\u001F\u007F\\]/.test(value)) return fallback;
  return value;
}

export function startTikTokOAuth(
  deps: Pick<TikTokOAuthDeps, 'tiktok' | 'clock'>,
  params: { mode: OAuthMode; returnTo: string; userId: string | null; redirectUri: string }
): { authorizeUrl: string; stateRecord: OAuthStateRecord } {
  if (params.mode === 'link' && !params.userId) {
    throw unauthenticated();
  }
  const stateRecord: OAuthStateRecord = {
    state: generateToken(),
    mode: params.mode,
    returnTo: params.returnTo,
    userId: params.mode === 'link' ? params.userId : null,
    expiresAt: deps.clock().getTime() + OAUTH_STATE_TTL_MS,
  };
  const authorizeUrl = deps.tiktok.buildAuthorizeUrl({
    state: stateRecord.state,
    redirectUri: params.redirectUri,
  });
  return { authorizeUrl, stateRecord };
}

export function verifyOAuthState(
  stored: OAuthStateRecord | null,
  receivedState: string | null,
  now: Date
): OAuthStateRecord {
  if (!stored || !receivedState) throw oauthFailed('คำขอเข้าสู่ระบบหมดอายุ กรุณาลองใหม่');
  if (now.getTime() > stored.expiresAt) throw oauthFailed('คำขอเข้าสู่ระบบหมดอายุ กรุณาลองใหม่');
  if (!safeEqual(stored.state, receivedState)) throw oauthFailed('คำขอเข้าสู่ระบบไม่ถูกต้อง');
  return stored;
}

function handleBaseFrom(displayName: string): string {
  const base = displayName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
  return base.length >= 2 ? base : 'creator';
}

async function generateUniqueHandle(users: UserRepository, displayName: string): Promise<string> {
  const base = handleBaseFrom(displayName);
  for (let attempt = 0; attempt < HANDLE_ATTEMPTS; attempt += 1) {
    const suffix = generateToken(4).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6);
    const handle = `@${base}_${suffix}`;
    if (!(await users.findByHandle(handle))) return handle;
  }
  throw new Error('Could not allocate a unique creator handle');
}

async function linkTikTokAccount(
  users: UserRepository,
  userId: string,
  profile: TikTokProfile
): Promise<UserRecord> {
  const owner = await users.findByTikTokOpenId(profile.openId);
  if (owner && owner.id !== userId) {
    throw conflict('บัญชี TikTok นี้ถูกเชื่อมกับผู้ใช้อื่นแล้ว');
  }
  return users.update(userId, {
    tiktokOpenId: profile.openId,
    tiktokUsername: profile.displayName,
    tiktokAvatarUrl: profile.avatarUrl,
  });
}

async function provisionTikTokUser(
  users: UserRepository,
  profile: TikTokProfile,
  audience: SessionAudience
): Promise<UserRecord> {
  const isCreator = audience === 'backoffice';
  return users.create({
    email: null,
    passwordHash: null,
    displayName: profile.displayName,
    creatorHandle: isCreator ? await generateUniqueHandle(users, profile.displayName) : null,
    avatarUrl: profile.avatarUrl,
    tiktokOpenId: profile.openId,
    tiktokUsername: profile.displayName,
    tiktokAvatarUrl: profile.avatarUrl,
    role: isCreator ? UserRole.CREATOR : UserRole.VIEWER,
  });
}

/** A viewer who signs into the backoffice with TikTok becomes a creator with their own storefront. */
async function promoteViewerToCreator(users: UserRepository, user: UserRecord): Promise<UserRecord> {
  return users.update(user.id, {
    role: UserRole.CREATOR,
    creatorHandle: user.creatorHandle ?? (await generateUniqueHandle(users, user.displayName)),
  });
}

async function signInWithTikTok(
  users: UserRepository,
  profile: TikTokProfile,
  audience: SessionAudience
): Promise<UserRecord> {
  const existing = await users.findByTikTokOpenId(profile.openId);
  if (!existing) return provisionTikTokUser(users, profile, audience);
  if (!existing.isActive) throw forbidden('บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ');

  const refreshed = await users.update(existing.id, {
    tiktokUsername: profile.displayName,
    tiktokAvatarUrl: profile.avatarUrl,
  });
  if (audience === 'backoffice' && !hasPermission(refreshed.role, PermissionAction.ACCESS_BACKOFFICE)) {
    // Only never-a-creator viewer accounts self-upgrade. A user an admin demoted
    // (they still own a handle) must not regain backoffice access by signing in.
    if (refreshed.role !== UserRole.VIEWER || refreshed.creatorHandle !== null) {
      throw forbidden('บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบหลังร้าน');
    }
    return promoteViewerToCreator(users, refreshed);
  }
  return refreshed;
}

export interface CompleteTikTokOAuthParams {
  audience: SessionAudience;
  redirectUri: string;
  code: string | null;
  providerError: string | null;
  verifiedState: OAuthStateRecord;
  /** The user of the currently valid session, if any. Required for link mode. */
  currentUserId: string | null;
}

export async function completeTikTokOAuth(
  deps: TikTokOAuthDeps,
  params: CompleteTikTokOAuthParams
): Promise<UserRecord> {
  if (params.providerError || !params.code) {
    throw oauthFailed('ยกเลิกการเข้าสู่ระบบด้วย TikTok');
  }

  const { verifiedState } = params;
  if (verifiedState.mode === 'link') {
    // The session must belong to the same user who started the link flow.
    if (!params.currentUserId || params.currentUserId !== verifiedState.userId) {
      throw unauthenticated();
    }
  }

  const profile = await deps.tiktok.exchangeCode({ code: params.code, redirectUri: params.redirectUri });

  if (verifiedState.mode === 'link') {
    return linkTikTokAccount(deps.users, verifiedState.userId as string, profile);
  }
  return signInWithTikTok(deps.users, profile, params.audience);
}
