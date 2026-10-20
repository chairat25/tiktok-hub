import { NextRequest, NextResponse } from 'next/server';
import {
  AppErrorCode,
  OAuthMode,
  RATE_LIMITS,
  SessionAudience,
  completeTikTokOAuth,
  enforceRateLimit,
  isAppError,
  sanitizeReturnTo,
  startTikTokOAuth,
  verifyOAuthState,
} from '@tiktok/auth';
import { getAppConfig } from '../config/app-config';
import { getServices, getTikTokProvider } from '../container';
import { clearOAuthStateCookie, readOAuthStateCookie, setOAuthStateCookie } from '../http/cookies';
import { HandlerContext, resolveActor } from '../http/handler';
import { logger } from '../http/logger';
import { clientIp } from '../http/request';
import { signIn } from './session-routes';

const CALLBACK_PATH = '/api/auth/callback';

interface OAuthTargets {
  loginSuccess: string;
  loginError: string;
  linkSuccess: string;
  linkError: string;
  /** Whether the caller may choose where to land after login (viewer storefront pages). */
  allowCustomReturn: boolean;
  allowLink: boolean;
}

const TARGETS: Record<SessionAudience, OAuthTargets> = {
  backoffice: {
    loginSuccess: '/dashboard/products',
    loginError: '/',
    linkSuccess: '/dashboard/settings?linked=success',
    linkError: '/dashboard/settings',
    allowCustomReturn: false,
    allowLink: true,
  },
  viewer: {
    loginSuccess: '/',
    loginError: '/',
    linkSuccess: '/',
    linkError: '/',
    allowCustomReturn: true,
    allowLink: false,
  },
};

const ERROR_PARAM_BY_CODE: Partial<Record<AppErrorCode, string>> = {
  OAUTH_FAILED: 'tiktok_denied',
  CONFLICT: 'already_linked_other',
  UNAUTHENTICATED: 'unauthorized',
  FORBIDDEN: 'account_disabled',
  RATE_LIMITED: 'rate_limited',
};

function redirectTo(origin: string, path: string, errorParam?: string): NextResponse {
  const url = new URL(path, origin);
  if (errorParam) url.searchParams.set('error', errorParam);
  return NextResponse.redirect(url, { status: 303, headers: { 'Cache-Control': 'no-store' } });
}

export function tiktokAuthorizeRoute(audience: SessionAudience) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const config = getAppConfig(audience);
    const targets = TARGETS[audience];
    const mode: OAuthMode = targets.allowLink && req.nextUrl.searchParams.get('mode') === 'link' ? 'link' : 'login';
    const errorPath = mode === 'link' ? targets.linkError : targets.loginError;

    const tiktok = getTikTokProvider(config);
    if (!tiktok) return redirectTo(config.appOrigin, errorPath, 'missing_credentials');

    try {
      const services = await getServices();
      await enforceRateLimit(services.rateLimiter, `oauth:ip:${clientIp(req)}`, RATE_LIMITS.oauthStartPerIp);
      const actor = mode === 'link' ? await resolveActor({ req, config, services }) : null;
      const returnTo = targets.allowCustomReturn
        ? sanitizeReturnTo(req.nextUrl.searchParams.get('returnTo'), targets.loginSuccess)
        : mode === 'link' ? targets.linkSuccess : targets.loginSuccess;

      const { authorizeUrl, stateRecord } = startTikTokOAuth(
        { tiktok, clock: services.clock },
        { mode, returnTo, userId: actor?.user.id ?? null, redirectUri: `${config.appOrigin}${CALLBACK_PATH}` }
      );
      const res = NextResponse.redirect(authorizeUrl, { status: 303, headers: { 'Cache-Control': 'no-store' } });
      setOAuthStateCookie(res, config, stateRecord);
      return res;
    } catch (error: unknown) {
      if (!isAppError(error)) logger.error('oauth.authorize_failed', error, { audience });
      const code = isAppError(error) ? ERROR_PARAM_BY_CODE[error.code] : undefined;
      return redirectTo(config.appOrigin, errorPath, code ?? 'server_error');
    }
  };
}

export function tiktokCallbackRoute(audience: SessionAudience) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const config = getAppConfig(audience);
    const targets = TARGETS[audience];
    const stored = readOAuthStateCookie(req, config);
    const params = req.nextUrl.searchParams;
    let errorPath = stored?.mode === 'link' ? targets.linkError : targets.loginError;

    const tiktok = getTikTokProvider(config);
    if (!tiktok) return redirectTo(config.appOrigin, errorPath, 'missing_credentials');

    let res: NextResponse;
    try {
      const services = await getServices();
      const ctx: HandlerContext = { req, config, services };
      const verified = verifyOAuthState(stored, params.get('state'), services.clock());
      errorPath = verified.mode === 'link' ? targets.linkError : sanitizeReturnTo(verified.returnTo, targets.loginError);
      const actor = verified.mode === 'link' ? await resolveActor(ctx) : null;

      const user = await completeTikTokOAuth(
        { users: services.users, tiktok, clock: services.clock },
        {
          audience,
          redirectUri: `${config.appOrigin}${CALLBACK_PATH}`,
          code: params.get('code'),
          providerError: params.get('error'),
          verifiedState: verified,
          currentUserId: actor?.user.id ?? null,
        }
      );

      const successPath = sanitizeReturnTo(verified.returnTo, targets.loginSuccess);
      res = redirectTo(config.appOrigin, successPath);
      if (verified.mode === 'login') {
        await signIn(ctx, user, res);
      }
    } catch (error: unknown) {
      if (!isAppError(error)) logger.error('oauth.callback_failed', error, { audience });
      const code = isAppError(error) ? ERROR_PARAM_BY_CODE[error.code] : undefined;
      res = redirectTo(config.appOrigin, errorPath, code ?? 'server_error');
    }

    clearOAuthStateCookie(res, config);
    return res;
  };
}
