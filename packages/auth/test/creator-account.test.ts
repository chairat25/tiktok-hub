import { describe, expect, it } from 'vitest';
import { UserRole } from '@tiktok/types';
import { createSession, hashPassword, unlinkTikTokAccount, updateCreatorSettings } from '../src';
import { InMemorySessionRepository, InMemoryUserRepository, fixedClock } from './fakes';

function setup() {
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  return { users, sessions };
}

describe('updateCreatorSettings', () => {
  it('updates allowed fields and never returns the password hash', async () => {
    const { users } = setup();
    const creator = users.seed({ creatorHandle: '@old', passwordHash: 'secret-hash' });
    const result = await updateCreatorSettings(
      { users },
      { user: creator, sessionId: 's1' },
      { displayName: 'New Name', creatorHandle: 'NewHandle', tiktokShopUrl: 'https://shop.tiktok.com/x' }
    );

    expect(result).toMatchObject({ displayName: 'New Name', creatorHandle: '@newhandle' });
    expect(JSON.stringify(result)).not.toContain('secret-hash');
  });

  it.each(['javascript:alert(1)', 'http://insecure.example', 'data:text/html,hi'])(
    'rejects non-https URL %s',
    async (url) => {
      const { users } = setup();
      const creator = users.seed({});
      await expect(
        updateCreatorSettings({ users }, { user: creator, sessionId: 's1' }, { avatarUrl: url })
      ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
    }
  );

  it('rejects unknown fields such as role escalation', async () => {
    const { users } = setup();
    const creator = users.seed({});
    await expect(
      updateCreatorSettings({ users }, { user: creator, sessionId: 's1' }, { role: UserRole.SUPER_ADMIN })
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it('forbids STAFF from changing shop settings', async () => {
    const { users } = setup();
    const staff = users.seed({ role: UserRole.STAFF });
    await expect(
      updateCreatorSettings({ users }, { user: staff, sessionId: 's1' }, { displayName: 'x' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects a handle owned by another user', async () => {
    const { users } = setup();
    users.seed({ creatorHandle: '@taken' });
    const creator = users.seed({ creatorHandle: '@mine' });
    await expect(
      updateCreatorSettings({ users }, { user: creator, sessionId: 's1' }, { creatorHandle: '@taken' })
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('clears an optional URL with an empty string', async () => {
    const { users } = setup();
    const creator = users.seed({ avatarUrl: 'https://cdn.example/a.png' });
    const result = await updateCreatorSettings({ users }, { user: creator, sessionId: 's1' }, { avatarUrl: '' });
    expect(result.avatarUrl).toBeNull();
  });
});

describe('unlinkTikTokAccount', () => {
  it('actually clears the TikTok identity and revokes other sessions', async () => {
    const { users, sessions } = setup();
    const { clock } = fixedClock();
    const user = users.seed({
      email: 'u@example.com',
      passwordHash: await hashPassword('password123'),
      tiktokOpenId: 'open-1',
      tiktokUsername: 'pond',
    });
    const meta = { audience: 'backoffice' as const, ipAddress: null, userAgent: null };
    await createSession({ users, sessions, clock }, { userId: user.id, ...meta });
    await createSession({ users, sessions, clock }, { userId: user.id, ...meta });
    const currentId = sessions.rows[0].id;

    const result = await unlinkTikTokAccount({ users, sessions }, { user, sessionId: currentId });

    expect(result.isTikTokLinked).toBe(false);
    expect((await users.findById(user.id))?.tiktokOpenId).toBeNull();
    expect(sessions.rows.map((r) => r.id)).toEqual([currentId]);
  });

  it('refuses when the account has no password login to fall back on', async () => {
    const { users, sessions } = setup();
    const user = users.seed({ tiktokOpenId: 'open-1', passwordHash: null });
    await expect(
      unlinkTikTokAccount({ users, sessions }, { user, sessionId: 's1' })
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});
