/**
 * Static security headers applied to every response via next.config `headers()`.
 * Plain ESM so next.config.mjs can import it without a TypeScript loader.
 * The Content-Security-Policy is per-request (nonce) and set in middleware.
 *
 * @param {boolean} isProduction
 * @returns {Array<{ key: string, value: string }>}
 */
export function staticSecurityHeaders(isProduction) {
  return [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    ...(isProduction
      ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
      : []),
  ];
}
