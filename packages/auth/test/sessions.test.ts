import { describe, expect, it } from 'vitest';
import { UserRole } from '@tiktok/types';
import { SESSION_POLICIES, authenticateSession, createSession, hashToken, revokeSession } from '../src';
import { InMemorySessionRepository, InMemoryUserRepository, fixedClock } from './fakes';

function setup() {
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const { clock, advance } = fixedClock();
  const user = users.seed({ email: 'a@example.com', role: UserRole.CREATOR });
  return { deps: { users, sessions, clock }, users, sessions, advance, user };
}

const meta = { ipAddress: '1.2.3.4', userAgent: 'vitest' };

describe('createSession', () => {
  it('stores only the token hash, never the raw token', async () => {
    const { deps, sessions, user } = setup();
    const { token } = await createSession(deps, { userId: user.id, audience: 'backoffice', ...meta });

    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(sessions.rows[0].tokenHash).toBe(hashToken(token));
    expect(JSON.stringify(sessions.rows)).not.toContain(token);
  });
});

describe('authenticateSession', () => {
  it('returns the fresh database user for a valid token', async () => {
    const { deps, users, user } = setup();
    const { token } = await createSession(deps, { userId: user.id, audience: 'backoffice', ...meta });
    await users.update(user.id, { role: UserRole.STAFF });

    const result = await authenticateSession(deps, { token, audience: 'backoffice' });

    expect(result?.user.role).toBe(UserRole.STAFF);
  });

  it('rejects a token minted for another audience', async () => {
    const { deps, user } = setup();
    const { token } = await createSession(deps, { userId: user.id, audience: 'viewer', ...meta });

    expect(await authenticateSession(deps, { token, audience: 'backoffice' })).toBeNull();
  });

  it('rejects an unknown or missing token', async () => {
    const { deps } = setup();
    expect(await authenticateSession(deps, { token: 'forged', audience: 'backoffice' })).toBeNull();
    expect(await authenticateSession(deps, { token: undefined, audience: 'backoffice' })).toBeNull();
  });

  it('expires and deletes an idle session', async () => {
    const { deps, sessions, advance, user } = setup();
    const { token } = await createSession(deps, { userId: user.id, audience: 'backoffice', ...meta });
    advance(SESSION_POLICIES.backoffice.idleTtlMs);

    expect(await authenticateSession(deps, { token, audience: 'backoffice' })).toBeNull();
    expect(sessions.rows).toHaveLength(0);
  });

  it('expires at the absolute deadline even when active', async () => {
    const { deps, advance, user } = setup();
    const { token } = await createSession(deps, { userId: user.id, audience: 'backoffice', ...meta });
    const step = SESSION_POLICIES.backoffice.idleTtlMs - 1000;
    let elapsed = 0;
    while (elapsed + step < SESSION_POLICIES.backoffice.absoluteTtlMs) {
      advance(step);
      elapsed += step;
      expect(await authenticateSession(deps, { token, audience: 'backoffice' })).not.toBeNull();
    }
    advance(SESSION_POLICIES.backoffice.absoluteTtlMs - elapsed);

    expect(await authenticateSession(deps, { token, audience: 'backoffice' })).toBeNull();
  });

  it('rejects and deletes the session of a deactivated user', async () => {
    const { deps, users, sessions, user } = setup();
    const { token } = await createSession(deps, { userId: user.id, audience: 'backoffice', ...meta });
    users.deactivate(user.id);

    expect(await authenticateSession(deps, { token, audience: 'backoffice' })).toBeNull();
    expect(sessions.rows).toHaveLength(0);
  });
});

describe('revokeSession', () => {
  it('makes the token unusable', async () => {
    const { deps, user } = setup();
    const { token } = await createSession(deps, { userId: user.id, audience: 'backoffice', ...meta });
    await revokeSession(deps, token);

    expect(await authenticateSession(deps, { token, audience: 'backoffice' })).toBeNull();
  });
});
