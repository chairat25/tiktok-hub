import { z } from 'zod';
import { TikTokIdentityProvider, TikTokProfile, oauthFailed } from '@tiktok/auth';
import { logger } from '../http/logger';

const AUTHORIZE_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name';
const SCOPES = 'user.info.basic';
const REQUEST_TIMEOUT_MS = 10_000;

const tokenFields = z.object({
  access_token: z.string().min(1),
  open_id: z.string().min(1).max(100),
});

// TikTok v2 returns the token fields at the top level; older docs show them under `data`.
const tokenResponseSchema = z.union([tokenFields, z.object({ data: tokenFields })]);

const userInfoSchema = z.object({
  data: z.object({
    user: z.object({
      open_id: z.string().optional(),
      display_name: z.string().max(255).optional(),
      avatar_url: z.string().max(2048).optional(),
    }),
  }),
});

function safeAvatarUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

export class TikTokHttpClient implements TikTokIdentityProvider {
  constructor(private readonly credentials: { clientKey: string; clientSecret: string }) {}

  buildAuthorizeUrl({ state, redirectUri }: { state: string; redirectUri: string }): string {
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set('client_key', this.credentials.clientKey);
    url.searchParams.set('scope', SCOPES);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    return url.toString();
  }

  async exchangeCode({ code, redirectUri }: { code: string; redirectUri: string }): Promise<TikTokProfile> {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body: new URLSearchParams({
        client_key: this.credentials.clientKey,
        client_secret: this.credentials.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
    const tokenBody: unknown = await tokenRes.json().catch(() => null);
    const parsedToken = tokenResponseSchema.safeParse(tokenBody);
    if (!tokenRes.ok || !parsedToken.success) {
      // Log only the provider's error fields; never the token payload itself.
      const errorInfo = (tokenBody ?? {}) as { error?: unknown; error_description?: unknown; log_id?: unknown };
      logger.warn('tiktok.token_exchange_failed', {
        status: tokenRes.status,
        error: errorInfo.error,
        description: errorInfo.error_description,
        logId: errorInfo.log_id,
      });
      throw oauthFailed();
    }
    const token = 'data' in parsedToken.data ? parsedToken.data.data : parsedToken.data;

    const userRes = await fetch(USER_INFO_URL, {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
    const parsedUser = userInfoSchema.safeParse(await userRes.json().catch(() => null));
    if (!userRes.ok || !parsedUser.success) {
      logger.warn('tiktok.user_info_failed', { status: userRes.status });
      throw oauthFailed();
    }

    const profile = parsedUser.data.data.user;
    if (profile.open_id && profile.open_id !== token.open_id) {
      logger.warn('tiktok.open_id_mismatch', {});
      throw oauthFailed();
    }

    return {
      openId: token.open_id,
      displayName: profile.display_name?.trim() || 'TikTok User',
      avatarUrl: safeAvatarUrl(profile.avatar_url),
    };
  }
}
