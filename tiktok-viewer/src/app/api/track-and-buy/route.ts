import { PermissionAction } from '@tiktok/types';
import { RATE_LIMITS, enforceRateLimit } from '@tiktok/auth';
import { clientIp, ok, protectedRoute, readJson } from '@tiktok/server';
import { trackPurchaseClick } from '@/server/click-tracking';

export const dynamic = 'force-dynamic';

export const POST = protectedRoute('viewer', { permission: PermissionAction.VIEW_PRODUCTS }, async (ctx) => {
  await enforceRateLimit(ctx.services.rateLimiter, `click:ip:${clientIp(ctx.req)}`, RATE_LIMITS.clickPerIp);
  return ok(trackPurchaseClick(await readJson(ctx.req), ctx.actor.user.id));
});
