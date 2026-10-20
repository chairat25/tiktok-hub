/**
 * Edge-runtime safe helpers for Next.js middleware and next.config.
 * This module must not import Node built-ins, TypeORM, or bcrypt.
 */
import { NextRequest, NextResponse } from 'next/server';

export interface CspOptions {
  nonce: string;
  isDev: boolean;
}

export function buildContentSecurityPolicy({ nonce, isDev }: CspOptions): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    // 'strict-dynamic' lets Next's nonce-tagged bootstrap load its own chunks.
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(isDev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", ...(isDev ? ['ws:'] : [])],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`);
  return [...policy, ...(isDev ? [] : ['upgrade-insecure-requests'])].join('; ');
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
}

export interface SecurityMiddlewareOptions {
  /** Path prefixes that need a session cookie; others are public. */
  protectedPrefixes?: string[];
  /** Name of the session cookie for the current environment. */
  sessionCookieNames: string[];
  /** Where to send visitors without a session cookie. */
  loginPath?: string;
}

/**
 * Per-request nonce CSP plus an optimistic auth redirect. The redirect only
 * checks that a session cookie exists; every API call still validates the
 * session against the database, which is the real access control.
 */
export function createSecurityMiddleware(options: SecurityMiddlewareOptions) {
  return function middleware(req: NextRequest): NextResponse {
    const { pathname } = req.nextUrl;
    const isProtected = options.protectedPrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false;
    const hasSessionCookie = options.sessionCookieNames.some((name) => req.cookies.has(name));
    if (isProtected && !hasSessionCookie) {
      return NextResponse.redirect(new URL(options.loginPath ?? '/', req.url));
    }

    const nonce = generateNonce();
    const csp = buildContentSecurityPolicy({ nonce, isDev: process.env.NODE_ENV !== 'production' });
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', csp);

    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set('Content-Security-Policy', csp);
    return res;
  };
}
