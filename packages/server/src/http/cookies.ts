import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OAUTH_STATE_TTL_MS, OAuthStateRecord, SESSION_POLICIES } from '@tiktok/auth';
import { AppConfig } from '../config/app-config';

/**
 * In production, cookie names carry the `__Host-` prefix: the browser then
 * enforces Secure, Path=/ and no Domain attribute, so sibling subdomains
 * cannot overwrite (toss) our cookies.
 */
function cookieName(config: AppConfig, base: string): string {
  return config.isSecure ? `__Host-${base}` : base;
}

const SESSION_COOKIE_BASE = { viewer: 'tv_session', backoffice: 'bo_session' } as const;
const OAUTH_COOKIE_BASE = 'tt_oauth';

export function sessionCookieName(config: AppConfig): string {
  return cookieName(config, SESSION_COOKIE_BASE[config.audience]);
}

function baseCookieOptions(config: AppConfig) {
  return { httpOnly: true, secure: config.isSecure, sameSite: 'lax' as const, path: '/' };
}

export function readSessionToken(req: NextRequest, config: AppConfig): string | undefined {
  return req.cookies.get(sessionCookieName(config))?.value;
}

export function setSessionCookie(res: NextResponse, config: AppConfig, token: string): void {
  res.cookies.set(sessionCookieName(config), token, {
    ...baseCookieOptions(config),
    maxAge: Math.floor(SESSION_POLICIES[config.audience].absoluteTtlMs / 1000),
  });
}

export function clearSessionCookie(res: NextResponse, config: AppConfig): void {
  res.cookies.set(sessionCookieName(config), '', { ...baseCookieOptions(config), maxAge: 0 });
}

const oauthStateSchema = z.object({
  state: z.string().min(32).max(128),
  mode: z.enum(['login', 'link']),
  returnTo: z.string().max(512),
  userId: z.string().uuid().nullable(),
  expiresAt: z.number().int().positive(),
});

export function setOAuthStateCookie(res: NextResponse, config: AppConfig, record: OAuthStateRecord): void {
  const value = Buffer.from(JSON.stringify(record), 'utf8').toString('base64url');
  res.cookies.set(cookieName(config, OAUTH_COOKIE_BASE), value, {
    ...baseCookieOptions(config),
    maxAge: Math.floor(OAUTH_STATE_TTL_MS / 1000),
  });
}

export function readOAuthStateCookie(req: NextRequest, config: AppConfig): OAuthStateRecord | null {
  const raw = req.cookies.get(cookieName(config, OAUTH_COOKIE_BASE))?.value;
  if (!raw) return null;
  try {
    const parsed = oauthStateSchema.safeParse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearOAuthStateCookie(res: NextResponse, config: AppConfig): void {
  res.cookies.set(cookieName(config, OAUTH_COOKIE_BASE), '', { ...baseCookieOptions(config), maxAge: 0 });
}
