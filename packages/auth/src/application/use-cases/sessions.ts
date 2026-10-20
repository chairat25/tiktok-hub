import { SESSION_POLICIES, SessionAudience } from '../../domain/session-policy';
import { UserRecord } from '../../domain/user';
import { generateToken, hashToken } from '../../security/tokens';
import { Clock, SessionRecord, SessionRepository, UserRepository } from '../ports';

export interface SessionDeps {
  sessions: SessionRepository;
  users: UserRepository;
  clock: Clock;
}

export interface IssuedSession {
  /** Raw token for the cookie. It is never stored server-side. */
  token: string;
  expiresAt: Date;
}

export interface AuthenticatedSession {
  session: SessionRecord;
  /** Freshly loaded from the database, so role and status changes apply immediately. */
  user: UserRecord;
}

export async function createSession(
  deps: SessionDeps,
  params: { userId: string; audience: SessionAudience; ipAddress: string | null; userAgent: string | null }
): Promise<IssuedSession> {
  const now = deps.clock();
  const policy = SESSION_POLICIES[params.audience];
  const token = generateToken();
  const expiresAt = new Date(now.getTime() + policy.absoluteTtlMs);

  await deps.sessions.create({
    userId: params.userId,
    tokenHash: hashToken(token),
    audience: params.audience,
    expiresAt,
    lastSeenAt: now,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent?.slice(0, 512) ?? null,
  });

  return { token, expiresAt };
}

function isExpired(session: SessionRecord, now: Date): boolean {
  const policy = SESSION_POLICIES[session.audience];
  const idleDeadline = session.lastSeenAt.getTime() + policy.idleTtlMs;
  return now >= session.expiresAt || now.getTime() >= idleDeadline;
}

export async function authenticateSession(
  deps: SessionDeps,
  params: { token: string | undefined; audience: SessionAudience }
): Promise<AuthenticatedSession | null> {
  if (!params.token) return null;

  const session = await deps.sessions.findByTokenHash(hashToken(params.token));
  if (!session || session.audience !== params.audience) return null;

  const now = deps.clock();
  if (isExpired(session, now)) {
    await deps.sessions.deleteById(session.id);
    return null;
  }

  const user = await deps.users.findById(session.userId);
  if (!user || !user.isActive) {
    await deps.sessions.deleteById(session.id);
    return null;
  }

  const policy = SESSION_POLICIES[session.audience];
  const shouldTouch = now.getTime() - session.lastSeenAt.getTime() >= policy.touchIntervalMs;
  if (shouldTouch) {
    await deps.sessions.touch(session.id, now);
  }

  return { session: shouldTouch ? { ...session, lastSeenAt: now } : session, user };
}

export async function revokeSession(deps: SessionDeps, token: string | undefined): Promise<void> {
  if (!token) return;
  const session = await deps.sessions.findByTokenHash(hashToken(token));
  if (session) {
    await deps.sessions.deleteById(session.id);
  }
}
