import { createSecurityMiddleware } from '@tiktok/server/edge';

export const middleware = createSecurityMiddleware({
  sessionCookieNames: ['__Host-tv_session', 'tv_session'],
});

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
