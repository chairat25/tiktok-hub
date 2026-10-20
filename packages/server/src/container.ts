import {
  Clock,
  RateLimiter,
  SessionRepository,
  TikTokIdentityProvider,
  UserRepository,
} from '@tiktok/auth';
import {
  PostgresRateLimiter,
  TypeOrmSessionRepository,
  TypeOrmUserRepository,
  getDataSource,
} from '@tiktok/database';
import { AppConfig } from './config/app-config';
import { TikTokHttpClient } from './tiktok/TikTokHttpClient';

export interface Services {
  users: UserRepository;
  sessions: SessionRepository;
  rateLimiter: RateLimiter;
  clock: Clock;
}

let servicesPromise: Promise<Services> | null = null;

/** Composition root: the only place that knows which adapters implement the ports. */
export function getServices(): Promise<Services> {
  if (!servicesPromise) {
    servicesPromise = getDataSource()
      .then((dataSource) => ({
        users: new TypeOrmUserRepository(dataSource),
        sessions: new TypeOrmSessionRepository(dataSource),
        rateLimiter: new PostgresRateLimiter(dataSource),
        clock: () => new Date(),
      }))
      .catch((error: unknown) => {
        servicesPromise = null;
        throw error;
      });
  }
  return servicesPromise;
}

export function getTikTokProvider(config: AppConfig): TikTokIdentityProvider | null {
  return config.tiktok ? new TikTokHttpClient(config.tiktok) : null;
}
