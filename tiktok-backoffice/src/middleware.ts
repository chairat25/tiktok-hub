import { createSecurityMiddleware } from '@tiktok/server/edge';

export const middleware = createSecurityMiddleware({
  protectedPrefixes: ['/dashboard'],
  sessionCookieNames: ['__Host-bo_session', 'bo_session'],
  loginPath: '/',
});

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
