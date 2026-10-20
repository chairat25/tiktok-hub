import { PermissionAction } from '@tiktok/types';
import {
  SessionAudience,
  createSession,
  loginWithPassword,
  registerCreator,
  revokeSession,
  toPublicUser,
  updateCreatorSettings,
  unlinkTikTokAccount,
  UserRecord,
} from '@tiktok/auth';
import { NextResponse } from 'next/server';
import { clearSessionCookie, readSessionToken, setSessionCookie } from '../http/cookies';
import { HandlerContext, protectedRoute, publicRoute, resolveActor } from '../http/handler';
import { clientIp, readJson, userAgent } from '../http/request';
import { ok } from '../http/response';

/**
 * Issues a brand-new session for `user`, revoking whatever session the browser
 * held before. Rotating on every sign-in prevents session fixation.
 */
export async function signIn(ctx: HandlerContext, user: UserRecord, res: NextResponse): Promise<NextResponse> {
  await revokeSession(ctx.services, readSessionToken(ctx.req, ctx.config));
  const { token } = await createSession(ctx.services, {
    userId: user.id,
    audience: ctx.config.audience,
    ipAddress: clientIp(ctx.req),
    userAgent: userAgent(ctx.req),
  });
  setSessionCookie(res, ctx.config, token);
  return res;
}

export function meRoute(audience: SessionAudience) {
  return publicRoute(audience, async (ctx) => {
    const actor = await resolveActor(ctx);
    if (!actor) {
      const res = ok({ authenticated: false, user: null });
      if (readSessionToken(ctx.req, ctx.config)) clearSessionCookie(res, ctx.config);
      return res;
    }
    return ok({ authenticated: true, user: toPublicUser(actor.user) });
  });
}

export function logoutRoute(audience: SessionAudience) {
  return publicRoute(audience, async (ctx) => {
    await revokeSession(ctx.services, readSessionToken(ctx.req, ctx.config));
    const res = ok({ message: 'ออกจากระบบสำเร็จ' });
    clearSessionCookie(res, ctx.config);
    return res;
  });
}

export function passwordLoginRoute() {
  return publicRoute('backoffice', async (ctx) => {
    const user = await loginWithPassword(ctx.services, await readJson(ctx.req), { ipAddress: clientIp(ctx.req) });
    return signIn(ctx, user, ok({ message: 'เข้าสู่ระบบสำเร็จ', user: toPublicUser(user) }));
  });
}

export function registerRoute() {
  return publicRoute('backoffice', async (ctx) => {
    const user = await registerCreator(ctx.services, await readJson(ctx.req), { ipAddress: clientIp(ctx.req) });
    const body = ok(
      { message: 'สมัครสมาชิกร้านค้าสำเร็จ ยินดีต้อนรับสู่ TikTok Showcase!', user: toPublicUser(user) },
      { status: 201 }
    );
    return signIn(ctx, user, body);
  });
}

export function creatorSettingsRoute() {
  return protectedRoute('backoffice', { permission: PermissionAction.MANAGE_SHOP_SETTINGS }, async (ctx) => {
    const user = await updateCreatorSettings(ctx.services, ctx.actor, await readJson(ctx.req));
    return ok({ message: 'บันทึกข้อมูลการตั้งค่าร้านค้าเรียบร้อยแล้ว', user });
  });
}

export function unlinkTikTokRoute() {
  return protectedRoute('backoffice', { permission: PermissionAction.ACCESS_BACKOFFICE }, async (ctx) => {
    const user = await unlinkTikTokAccount(ctx.services, ctx.actor);
    return ok({ message: 'ยกเลิกการเชื่อมต่อกับบัญชี TikTok เรียบร้อยแล้ว', user });
  });
}
