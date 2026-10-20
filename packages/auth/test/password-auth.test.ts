import { describe, expect, it } from 'vitest';
import { UserRole } from '@tiktok/types';
import { hashPassword, loginWithPassword, registerCreator } from '../src';
import { CountingRateLimiter, InMemoryUserRepository } from './fakes';

const ctx = { ipAddress: '10.0.0.1' };
const PASSWORD = 'correct horse battery';

async function setup() {
  const users = new InMemoryUserRepository();
  const rateLimiter = new CountingRateLimiter();
  const passwordHash = await hashPassword(PASSWORD);
  const creator = users.seed({ email: 'creator@example.com', passwordHash, creatorHandle: '@creator' });
  return { deps: { users, rateLimiter }, users, creator, passwordHash };
}

describe('loginWithPassword', () => {
  it('returns the user for valid credentials', async () => {
    const { deps, creator } = await setup();
    const user = await loginWithPassword(deps, { email: ' Creator@Example.com ', password: PASSWORD }, ctx);
    expect(user.id).toBe(creator.id);
  });

  it('does not trim the password', async () => {
    const { deps } = await setup();
    await expect(
      loginWithPassword(deps, { email: 'creator@example.com', password: ` ${PASSWORD} ` }, ctx)
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });

  it('uses one generic error for unknown email, wrong password, and TikTok-only accounts', async () => {
    const { deps, users } = await setup();
    users.seed({ email: 'tiktok-only@example.com', passwordHash: null, tiktokOpenId: 'tt1' });

    const attempts = [
      { email: 'nobody@example.com', password: PASSWORD },
      { email: 'creator@example.com', password: 'wrong-password' },
      { email: 'tiktok-only@example.com', password: PASSWORD },
    ];
    const messages = await Promise.all(
      attempts.map((input) => loginWithPassword(deps, input, ctx).catch((e: Error) => e.message))
    );
    expect(new Set(messages).size).toBe(1);
  }, 20_000);

  it('rejects a deactivated account after a correct password', async () => {
    const { deps, users, passwordHash } = await setup();
    users.seed({ email: 'off@example.com', passwordHash, isActive: false });
    await expect(
      loginWithPassword(deps, { email: 'off@example.com', password: PASSWORD }, ctx)
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects a VIEWER account from the backoffice', async () => {
    const { deps, users, passwordHash } = await setup();
    users.seed({ email: 'viewer@example.com', passwordHash, role: UserRole.VIEWER });
    await expect(
      loginWithPassword(deps, { email: 'viewer@example.com', password: PASSWORD }, ctx)
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('locks out an email after 5 attempts', async () => {
    const { deps } = await setup();
    for (let i = 0; i < 5; i += 1) {
      await loginWithPassword(deps, { email: 'creator@example.com', password: 'nope' }, ctx).catch(() => null);
    }
    await expect(
      loginWithPassword(deps, { email: 'creator@example.com', password: PASSWORD }, ctx)
    ).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  }, 20_000);
});

describe('registerCreator', () => {
  const valid = {
    email: 'new@example.com',
    password: 'long enough pass',
    displayName: 'New Creator',
    creatorHandle: 'NewShop',
  };

  it('creates a CREATOR with a normalized handle and hashed password', async () => {
    const { deps } = await setup();
    const user = await registerCreator(deps, valid, ctx);

    expect(user.role).toBe(UserRole.CREATOR);
    expect(user.creatorHandle).toBe('@newshop');
    expect(user.passwordHash).not.toBe(valid.password);
  });

  it('ignores a client-supplied role', async () => {
    const { deps } = await setup();
    const user = await registerCreator(deps, { ...valid, role: UserRole.SUPER_ADMIN }, ctx);
    expect(user.role).toBe(UserRole.CREATOR);
  });

  it.each([
    ['short password', { password: 'short' }],
    ['password over 72 bytes', { password: 'ก'.repeat(25) }],
    ['bad handle', { creatorHandle: '../admin' }],
    ['bad email', { email: 'not-an-email' }],
  ])('rejects %s', async (_label, override) => {
    const { deps } = await setup();
    await expect(registerCreator(deps, { ...valid, ...override }, ctx)).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    });
  });

  it('rejects a taken email or handle', async () => {
    const { deps } = await setup();
    await expect(
      registerCreator(deps, { ...valid, email: 'creator@example.com' }, ctx)
    ).rejects.toMatchObject({ code: 'CONFLICT' });
    await expect(
      registerCreator(deps, { ...valid, creatorHandle: '@Creator' }, ctx)
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});
