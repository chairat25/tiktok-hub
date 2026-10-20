import { describe, expect, it } from 'vitest';
import { UserRole } from '@tiktok/types';
import {
  OAUTH_STATE_TTL_MS,
  completeTikTokOAuth,
  sanitizeReturnTo,
  startTikTokOAuth,
  verifyOAuthState,
} from '../src';
import { FakeTikTok, InMemoryUserRepository, fixedClock } from './fakes';

const profile = { openId: 'open-123', displayName: 'Pond Shop', avatarUrl: 'https://cdn.example/a.jpg' };
const redirectUri = 'https://backoffice.example/api/auth/callback';

function setup() {
  const users = new InMemoryUserRepository();
  const tiktok = new FakeTikTok(profile);
  const { clock, advance } = fixedClock();
  return { deps: { users, tiktok, clock }, users, tiktok, clock, advance };
}

describe('sanitizeReturnTo', () => {
  it.each(['https://evil.com', '//evil.com', '/\\evil.com', 'javascript:alert(1)', '/a\nb', ''])(
    'falls back for %s',
    (value) => {
      expect(sanitizeReturnTo(value, '/')).toBe('/');
    }
  );

  it('keeps same-origin paths', () => {
    expect(sanitizeReturnTo('/@pond?x=1', '/')).toBe('/@pond?x=1');
  });
});

describe('OAuth state', () => {
  it('requires a signed-in user to start link mode', () => {
    const { deps } = setup();
    expect(() =>
      startTikTokOAuth(deps, { mode: 'link', returnTo: '/', userId: null, redirectUri })
    ).toThrow(expect.objectContaining({ code: 'UNAUTHENTICATED' }));
  });

  it('generates a unique random state per flow', () => {
    const { deps } = setup();
    const a = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    const b = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    expect(a.stateRecord.state).not.toBe(b.stateRecord.state);
    expect(a.authorizeUrl).toContain(a.stateRecord.state);
  });

  it('rejects a missing cookie, mismatched state, or expired state', () => {
    const { deps, clock } = setup();
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });

    expect(() => verifyOAuthState(null, stateRecord.state, clock())).toThrow();
    expect(() => verifyOAuthState(stateRecord, 'attacker-state', clock())).toThrow();
    const later = new Date(clock().getTime() + OAUTH_STATE_TTL_MS + 1);
    expect(() => verifyOAuthState(stateRecord, stateRecord.state, later)).toThrow();
    expect(verifyOAuthState(stateRecord, stateRecord.state, clock())).toEqual(stateRecord);
  });
});

describe('completeTikTokOAuth', () => {
  it('provisions a CREATOR with a valid handle on first backoffice login', async () => {
    const { deps } = setup();
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    const user = await completeTikTokOAuth(deps, {
      audience: 'backoffice', redirectUri, code: 'c', providerError: null,
      verifiedState: stateRecord, currentUserId: null,
    });

    expect(user.role).toBe(UserRole.CREATOR);
    expect(user.creatorHandle).toMatch(/^@pondshop_[a-z0-9]+$/);
    expect(user.email).toBeNull();
  });

  it('provisions a VIEWER without a handle on first viewer login', async () => {
    const { deps } = setup();
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    const user = await completeTikTokOAuth(deps, {
      audience: 'viewer', redirectUri, code: 'c', providerError: null,
      verifiedState: stateRecord, currentUserId: null,
    });

    expect(user.role).toBe(UserRole.VIEWER);
    expect(user.creatorHandle).toBeNull();
  });

  it('promotes an existing VIEWER to CREATOR on backoffice login', async () => {
    const { deps, users } = setup();
    users.seed({ tiktokOpenId: profile.openId, role: UserRole.VIEWER });
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    const user = await completeTikTokOAuth(deps, {
      audience: 'backoffice', redirectUri, code: 'c', providerError: null,
      verifiedState: stateRecord, currentUserId: null,
    });

    expect(user.role).toBe(UserRole.CREATOR);
    expect(user.creatorHandle).not.toBeNull();
  });

  it('does not re-promote a demoted creator who still owns a handle', async () => {
    const { deps, users } = setup();
    users.seed({ tiktokOpenId: profile.openId, role: UserRole.VIEWER, creatorHandle: '@formercreator' });
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    await expect(
      completeTikTokOAuth(deps, {
        audience: 'backoffice', redirectUri, code: 'c', providerError: null,
        verifiedState: stateRecord, currentUserId: null,
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses a deactivated account', async () => {
    const { deps, users } = setup();
    users.seed({ tiktokOpenId: profile.openId, isActive: false });
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    await expect(
      completeTikTokOAuth(deps, {
        audience: 'backoffice', redirectUri, code: 'c', providerError: null,
        verifiedState: stateRecord, currentUserId: null,
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('blocks forced account linking: the session must match the user who started the flow', async () => {
    const { deps, users, tiktok } = setup();
    const victim = users.seed({ email: 'victim@example.com' });
    const attacker = users.seed({ email: 'attacker@example.com' });
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'link', returnTo: '/', userId: attacker.id, redirectUri });

    await expect(
      completeTikTokOAuth(deps, {
        audience: 'backoffice', redirectUri, code: 'attacker-code', providerError: null,
        verifiedState: stateRecord, currentUserId: victim.id,
      })
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(tiktok.exchangedCodes).toHaveLength(0);
    expect((await users.findById(victim.id))?.tiktokOpenId).toBeNull();
  });

  it('links TikTok to the signed-in user', async () => {
    const { deps, users } = setup();
    const owner = users.seed({ email: 'owner@example.com' });
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'link', returnTo: '/', userId: owner.id, redirectUri });
    const user = await completeTikTokOAuth(deps, {
      audience: 'backoffice', redirectUri, code: 'c', providerError: null,
      verifiedState: stateRecord, currentUserId: owner.id,
    });

    expect(user.tiktokOpenId).toBe(profile.openId);
  });

  it('refuses to link a TikTok account already owned by someone else', async () => {
    const { deps, users } = setup();
    users.seed({ tiktokOpenId: profile.openId });
    const owner = users.seed({ email: 'owner@example.com' });
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'link', returnTo: '/', userId: owner.id, redirectUri });

    await expect(
      completeTikTokOAuth(deps, {
        audience: 'backoffice', redirectUri, code: 'c', providerError: null,
        verifiedState: stateRecord, currentUserId: owner.id,
      })
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('fails when TikTok returns an error instead of a code', async () => {
    const { deps } = setup();
    const { stateRecord } = startTikTokOAuth(deps, { mode: 'login', returnTo: '/', userId: null, redirectUri });
    await expect(
      completeTikTokOAuth(deps, {
        audience: 'viewer', redirectUri, code: null, providerError: 'access_denied',
        verifiedState: stateRecord, currentUserId: null,
      })
    ).rejects.toMatchObject({ code: 'OAUTH_FAILED' });
  });
});
