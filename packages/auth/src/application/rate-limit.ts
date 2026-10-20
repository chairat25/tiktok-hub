import { rateLimited } from '../domain/errors';
import { RateLimiter } from './ports';

const MINUTE_MS = 60 * 1000;

export interface RateLimitRule {
  readonly limit: number;
  readonly windowMs: number;
}

export const RATE_LIMITS = Object.freeze({
  loginPerIp: { limit: 20, windowMs: 15 * MINUTE_MS },
  loginPerEmail: { limit: 5, windowMs: 15 * MINUTE_MS },
  registerPerIp: { limit: 5, windowMs: 60 * MINUTE_MS },
  oauthStartPerIp: { limit: 20, windowMs: 10 * MINUTE_MS },
  uploadPerUser: { limit: 30, windowMs: 10 * MINUTE_MS },
  oembedPerUser: { limit: 60, windowMs: 10 * MINUTE_MS },
  clickPerIp: { limit: 120, windowMs: 10 * MINUTE_MS },
} satisfies Record<string, RateLimitRule>);

export async function enforceRateLimit(
  limiter: RateLimiter,
  key: string,
  rule: RateLimitRule
): Promise<void> {
  const result = await limiter.consume(key, rule.limit, rule.windowMs);
  if (!result.allowed) {
    throw rateLimited(result.retryAfterSeconds);
  }
}
