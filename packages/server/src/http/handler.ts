import { NextRequest, NextResponse } from 'next/server';
import { PermissionAction } from '@tiktok/types';
import {
  Actor,
  SessionAudience,
  assertPermission,
  authenticateSession,
  unauthenticated,
} from '@tiktok/auth';
import { AppConfig, getAppConfig } from '../config/app-config';
import { Services, getServices } from '../container';
import { readSessionToken } from './cookies';
import { assertSameOrigin } from './request';
import { errorResponse } from './response';

export interface HandlerContext {
  req: NextRequest;
  config: AppConfig;
  services: Services;
}

export interface AuthedHandlerContext extends HandlerContext {
  actor: Actor;
}

type Handler<C> = (ctx: C) => Promise<NextResponse>;

/**
 * Wraps a route handler with the cross-cutting concerns every endpoint needs:
 * CSRF origin check on unsafe methods, dependency resolution, and safe error
 * mapping. Handlers only contain the HTTP <-> use-case translation.
 */
export function publicRoute(audience: SessionAudience, handler: Handler<HandlerContext>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const config = getAppConfig(audience);
      assertSameOrigin(req, config.appOrigin);
      const services = await getServices();
      return await handler({ req, config, services });
    } catch (error: unknown) {
      return errorResponse(error, `${req.method} ${req.nextUrl.pathname}`);
    }
  };
}

export async function resolveActor(ctx: HandlerContext): Promise<Actor | null> {
  const authenticated = await authenticateSession(ctx.services, {
    token: readSessionToken(ctx.req, ctx.config),
    audience: ctx.config.audience,
  });
  return authenticated ? { user: authenticated.user, sessionId: authenticated.session.id } : null;
}

/**
 * Like publicRoute, but rejects the request unless it carries a valid session
 * for this app and (optionally) the actor's current role grants `permission`.
 * The role is read from the database on every request, never from the cookie.
 */
export function protectedRoute(
  audience: SessionAudience,
  options: { permission?: PermissionAction },
  handler: Handler<AuthedHandlerContext>
) {
  return publicRoute(audience, async (ctx) => {
    const actor = await resolveActor(ctx);
    if (!actor) throw unauthenticated();
    if (options.permission) assertPermission(actor.user.role, options.permission);
    return handler({ ...ctx, actor });
  });
}
