import { NextRequest } from 'next/server';
import { AppError, forbidden, validationError } from '@tiktok/auth';

const DEFAULT_MAX_JSON_BYTES = 16 * 1024;
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Client IP for rate limiting. On Vercel `request.ip` and `x-real-ip` are set
 * by the platform edge and cannot be spoofed. DEPLOYMENT REQUIREMENT: anywhere
 * else, run behind a reverse proxy that overwrites x-real-ip/x-forwarded-for,
 * otherwise per-IP limits can be bypassed (per-email login limits still hold).
 */
export function clientIp(req: NextRequest): string {
  const fromPlatform = req.ip || req.headers.get('x-real-ip');
  if (fromPlatform) return fromPlatform.slice(0, 45);
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (forwarded || 'unknown').slice(0, 45);
}

export function userAgent(req: NextRequest): string | null {
  return req.headers.get('user-agent')?.slice(0, 512) ?? null;
}

/**
 * CSRF defence for cookie-authenticated, state-changing requests: the browser
 * must declare that the request comes from our own origin. Combined with
 * SameSite=Lax cookies this blocks cross-site form posts and fetches.
 */
export function assertSameOrigin(req: NextRequest, appOrigin: string): void {
  if (!UNSAFE_METHODS.has(req.method)) return;

  const fetchSite = req.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin') throw forbidden('คำขอไม่ได้มาจากเว็บไซต์นี้');

  const origin = req.headers.get('origin');
  if (origin !== appOrigin) throw forbidden('คำขอไม่ได้มาจากเว็บไซต์นี้');
}

export async function readJson(req: NextRequest, maxBytes = DEFAULT_MAX_JSON_BYTES): Promise<unknown> {
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new AppError('VALIDATION_FAILED', 'Content-Type ต้องเป็น application/json');
  }
  const declaredLength = Number(req.headers.get('content-length') ?? 0);
  if (declaredLength > maxBytes) throw validationError('ข้อมูลมีขนาดใหญ่เกินไป');

  const text = await req.text();
  if (Buffer.byteLength(text, 'utf8') > maxBytes) throw validationError('ข้อมูลมีขนาดใหญ่เกินไป');
  try {
    return JSON.parse(text);
  } catch {
    throw validationError('รูปแบบข้อมูลไม่ถูกต้อง');
  }
}
