import { createHash } from 'node:crypto';
import { DataSource } from 'typeorm';
import { RateLimitResult, RateLimiter } from '@tiktok/auth';

/** Roughly 1 in 100 calls prunes buckets that have been idle for a day. */
const CLEANUP_PROBABILITY = 0.01;

/**
 * Fixed-window limiter backed by Postgres, so limits hold across every
 * serverless instance. A single atomic upsert both counts and resets windows.
 */
export class PostgresRateLimiter implements RateLimiter {
  constructor(private readonly dataSource: DataSource) {}

  async consume(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const hashedKey = createHash('sha256').update(key).digest('hex');
    const rows: Array<{ count: number; retry_after: string }> = await this.dataSource.query(
      `INSERT INTO rate_limit_buckets ("key", "count", "windowStart")
       VALUES ($1, 1, now())
       ON CONFLICT ("key") DO UPDATE SET
         "count" = CASE
           WHEN rate_limit_buckets."windowStart" <= now() - ($2::int * interval '1 millisecond') THEN 1
           ELSE rate_limit_buckets."count" + 1 END,
         "windowStart" = CASE
           WHEN rate_limit_buckets."windowStart" <= now() - ($2::int * interval '1 millisecond') THEN now()
           ELSE rate_limit_buckets."windowStart" END
       RETURNING "count",
         CEIL(EXTRACT(EPOCH FROM ("windowStart" + ($2::int * interval '1 millisecond') - now()))) AS retry_after`,
      [hashedKey, windowMs]
    );

    if (Math.random() < CLEANUP_PROBABILITY) {
      await this.dataSource.query(
        `DELETE FROM rate_limit_buckets WHERE "windowStart" < now() - interval '1 day'`
      );
    }

    const { count, retry_after: retryAfter } = rows[0];
    return {
      allowed: count <= limit,
      retryAfterSeconds: Math.max(1, Number(retryAfter)),
    };
  }
}
