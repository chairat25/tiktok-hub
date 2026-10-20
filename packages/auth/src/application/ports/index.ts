import { UserRole } from '@tiktok/types';
import { UserRecord } from '../../domain/user';
import { SessionAudience } from '../../domain/session-policy';

export interface NewUser {
  email: string | null;
  displayName: string;
  creatorHandle: string | null;
  passwordHash: string | null;
  role: UserRole;
  tiktokOpenId?: string | null;
  tiktokUsername?: string | null;
  tiktokAvatarUrl?: string | null;
  avatarUrl?: string | null;
}

export type UserPatch = Partial<
  Pick<
    UserRecord,
    | 'displayName'
    | 'creatorHandle'
    | 'role'
    | 'tiktokOpenId'
    | 'tiktokUsername'
    | 'tiktokAvatarUrl'
    | 'tiktokShopUrl'
    | 'avatarUrl'
  >
>;

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByHandle(handle: string): Promise<UserRecord | null>;
  findByTikTokOpenId(openId: string): Promise<UserRecord | null>;
  /** Throws a CONFLICT AppError when a unique field is already taken. */
  create(input: NewUser): Promise<UserRecord>;
  /** Throws a CONFLICT AppError when a unique field is already taken. */
  update(id: string, patch: UserPatch): Promise<UserRecord>;
}

export interface SessionRecord {
  readonly id: string;
  readonly userId: string;
  readonly audience: SessionAudience;
  readonly expiresAt: Date;
  readonly lastSeenAt: Date;
}

export interface NewSession {
  userId: string;
  tokenHash: string;
  audience: SessionAudience;
  expiresAt: Date;
  lastSeenAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface SessionRepository {
  create(session: NewSession): Promise<SessionRecord>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  touch(id: string, lastSeenAt: Date): Promise<void>;
  deleteById(id: string): Promise<void>;
  deleteAllForUser(userId: string, options?: { exceptId?: string }): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

export interface TikTokProfile {
  openId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface TikTokIdentityProvider {
  buildAuthorizeUrl(params: { state: string; redirectUri: string }): string;
  /** Exchanges an authorization code for the verified TikTok identity. */
  exchangeCode(params: { code: string; redirectUri: string }): Promise<TikTokProfile>;
}

export type Clock = () => Date;
