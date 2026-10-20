import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './entities/User';
import { Category } from './entities/Category';
import { Product } from './entities/Product';
import { ClickTracking } from './entities/ClickTracking';
import { Session } from './entities/Session';
import { RateLimitBucket } from './entities/RateLimitBucket';

const ENTITIES = [User, Category, Product, ClickTracking, Session, RateLimitBucket];

type SslOption = false | { rejectUnauthorized: boolean; ca?: string };

/**
 * TLS certificates are verified by default. Supabase uses its own root CA,
 * so provide it via DB_SSL_CA (PEM, `\n` escapes allowed). Disabling
 * verification needs an explicit, loudly named opt-in.
 */
function resolveSsl(databaseUrl: string | undefined): SslOption {
  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');
  const wantsSsl = Boolean(ca) || process.env.DB_SSL === 'true' || Boolean(databaseUrl?.includes('supabase'));
  if (!wantsSsl || process.env.DB_SSL === 'false') return false;
  if (ca) return { rejectUnauthorized: true, ca };
  if (process.env.DB_SSL_INSECURE_SKIP_VERIFY === 'true') {
    console.warn('[DATABASE] TLS certificate verification is DISABLED (DB_SSL_INSECURE_SKIP_VERIFY=true).');
    return { rejectUnauthorized: false };
  }
  return { rejectUnauthorized: true };
}

/** Schema auto-sync can drop columns, so it is off in production unless explicitly enabled. */
function shouldSynchronize(): boolean {
  if (process.env.DB_SYNCHRONIZE !== undefined) return process.env.DB_SYNCHRONIZE === 'true';
  return process.env.NODE_ENV !== 'production';
}

function buildOptions(): DataSourceOptions {
  const databaseUrl = process.env.DATABASE_URL;
  const common = {
    type: 'postgres' as const,
    ssl: resolveSsl(databaseUrl),
    synchronize: shouldSynchronize(),
    logging: (process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']) as ('error' | 'warn')[],
    entities: ENTITIES,
    subscribers: [],
    migrations: [],
  };

  if (databaseUrl) {
    return { ...common, url: databaseUrl };
  }
  return {
    ...common,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'tiktok_catalog',
  };
}

export const AppDataSource = new DataSource(buildOptions());

let initializedPromise: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }
  if (!initializedPromise) {
    initializedPromise = AppDataSource.initialize().catch((error: unknown) => {
      // Allow the next request to retry instead of caching a failed connection forever.
      initializedPromise = null;
      throw error;
    });
  }
  return initializedPromise;
}
