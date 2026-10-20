import { randomUUID } from 'node:crypto';
import { UserRole } from '@tiktok/types';
import {
  NewSession,
  NewUser,
  RateLimiter,
  SessionRecord,
  SessionRepository,
  TikTokIdentityProvider,
  TikTokProfile,
  UserPatch,
  UserRecord,
  UserRepository,
  conflict,
} from '../src';

export class InMemoryUserRepository implements UserRepository {
  private users: ReadonlyArray<UserRecord> = [];

  seed(partial: Partial<UserRecord>): UserRecord {
    const user: UserRecord = {
      id: randomUUID(),
      email: null,
      displayName: 'Test User',
      creatorHandle: null,
      passwordHash: null,
      tiktokOpenId: null,
      tiktokUsername: null,
      tiktokAvatarUrl: null,
      tiktokShopUrl: null,
      avatarUrl: null,
      role: UserRole.CREATOR,
      isActive: true,
      ...partial,
    };
    this.users = [...this.users, user];
    return user;
  }

  all(): ReadonlyArray<UserRecord> {
    return this.users;
  }

  deactivate(id: string): void {
    this.users = this.users.map((u) => (u.id === id ? { ...u, isActive: false } : u));
  }

  async findById(id: string) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }
  async findByHandle(handle: string) {
    return this.users.find((u) => u.creatorHandle === handle) ?? null;
  }
  async findByTikTokOpenId(openId: string) {
    return this.users.find((u) => u.tiktokOpenId === openId) ?? null;
  }

  private assertUnique(candidate: UserRecord) {
    const clash = this.users.find(
      (u) =>
        u.id !== candidate.id &&
        ((candidate.email && u.email === candidate.email) ||
          (candidate.creatorHandle && u.creatorHandle === candidate.creatorHandle) ||
          (candidate.tiktokOpenId && u.tiktokOpenId === candidate.tiktokOpenId))
    );
    if (clash) throw conflict('duplicate');
  }

  async create(input: NewUser) {
    const user: UserRecord = {
      id: randomUUID(),
      tiktokShopUrl: null,
      isActive: true,
      tiktokOpenId: null,
      tiktokUsername: null,
      tiktokAvatarUrl: null,
      avatarUrl: null,
      ...input,
    } as UserRecord;
    this.assertUnique(user);
    this.users = [...this.users, user];
    return user;
  }

  async update(id: string, patch: UserPatch) {
    const current = await this.findById(id);
    if (!current) throw new Error('not found');
    const next = { ...current, ...patch };
    this.assertUnique(next);
    this.users = this.users.map((u) => (u.id === id ? next : u));
    return next;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  rows: ReadonlyArray<SessionRecord & { tokenHash: string }> = [];

  async create(s: NewSession) {
    const row = { id: randomUUID(), ...s };
    this.rows = [...this.rows, row];
    return row;
  }
  async findByTokenHash(tokenHash: string) {
    return this.rows.find((r) => r.tokenHash === tokenHash) ?? null;
  }
  async touch(id: string, lastSeenAt: Date) {
    this.rows = this.rows.map((r) => (r.id === id ? { ...r, lastSeenAt } : r));
  }
  async deleteById(id: string) {
    this.rows = this.rows.filter((r) => r.id !== id);
  }
  async deleteAllForUser(userId: string, options: { exceptId?: string } = {}) {
    this.rows = this.rows.filter((r) => r.userId !== userId || r.id === options.exceptId);
  }
}

export class CountingRateLimiter implements RateLimiter {
  private counts = new Map<string, number>();
  async consume(key: string, limit: number) {
    const count = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, count);
    return { allowed: count <= limit, retryAfterSeconds: 60 };
  }
}

export class FakeTikTok implements TikTokIdentityProvider {
  constructor(private profile: TikTokProfile) {}
  exchangedCodes: string[] = [];

  buildAuthorizeUrl({ state, redirectUri }: { state: string; redirectUri: string }) {
    return `https://tiktok.test/auth?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  async exchangeCode({ code }: { code: string; redirectUri: string }) {
    this.exchangedCodes = [...this.exchangedCodes, code];
    return this.profile;
  }
}

export function fixedClock(start = new Date('2026-10-20T00:00:00Z')) {
  let now = start;
  const clock = () => now;
  const advance = (ms: number) => {
    now = new Date(now.getTime() + ms);
  };
  return { clock, advance };
}
