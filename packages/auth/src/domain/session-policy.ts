/**
 * Each app issues sessions for its own audience. A session minted for one app
 * is rejected by the other, so a stolen viewer cookie can never open the
 * backoffice.
 */
export type SessionAudience = 'viewer' | 'backoffice';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export interface SessionPolicy {
  /** Hard upper bound on a session's lifetime, regardless of activity. */
  readonly absoluteTtlMs: number;
  /** A session unused for this long is treated as expired. */
  readonly idleTtlMs: number;
  /** Minimum gap between lastSeenAt writes, to avoid a DB write on every request. */
  readonly touchIntervalMs: number;
}

export const SESSION_POLICIES: Readonly<Record<SessionAudience, SessionPolicy>> = Object.freeze({
  backoffice: Object.freeze({ absoluteTtlMs: 7 * DAY_MS, idleTtlMs: 12 * HOUR_MS, touchIntervalMs: 5 * 60 * 1000 }),
  viewer: Object.freeze({ absoluteTtlMs: 30 * DAY_MS, idleTtlMs: 7 * DAY_MS, touchIntervalMs: 15 * 60 * 1000 }),
});
