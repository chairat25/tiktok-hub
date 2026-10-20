-- Auth hardening: server-side sessions, Postgres rate limiting, TikTok-only/viewer accounts.
-- Idempotent: safe to run more than once. Run in the Supabase SQL editor (or psql)
-- before deploying with DB_SYNCHRONIZE=false.

BEGIN;

-- TikTok-only creators and viewers have no email; viewers have no storefront handle.
ALTER TABLE users ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE users ALTER COLUMN "creatorHandle" DROP NOT NULL;

-- Case-insensitive uniqueness for handles ("@Pond" vs "@pond").
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_creatorHandle_lower" ON users (LOWER("creatorHandle"));
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email_lower" ON users (LOWER("email"));

CREATE TABLE IF NOT EXISTS sessions (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"     uuid NOT NULL REFERENCES users("id") ON DELETE CASCADE,
  "tokenHash"  varchar(64) NOT NULL UNIQUE,
  "audience"   varchar(16) NOT NULL,
  "expiresAt"  timestamptz NOT NULL,
  "lastSeenAt" timestamptz NOT NULL,
  "ipAddress"  varchar(45),
  "userAgent"  varchar(512),
  "createdAt"  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "IDX_sessions_userId" ON sessions ("userId");
CREATE INDEX IF NOT EXISTS "IDX_sessions_expiresAt" ON sessions ("expiresAt");

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  "key"         varchar(64) PRIMARY KEY,
  "count"       integer NOT NULL,
  "windowStart" timestamptz NOT NULL
);

-- Tables reachable through Supabase's auto-generated REST API must not be readable
-- with the public anon key. The app connects as the table owner and bypasses RLS.
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_trackings ENABLE ROW LEVEL SECURITY;

COMMIT;
