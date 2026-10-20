import { SessionAudience } from '@tiktok/auth';

export interface AppConfig {
  readonly audience: SessionAudience;
  /** Canonical origin of this app, e.g. https://shop.example.com. Never derived from request headers. */
  readonly appOrigin: string;
  readonly isSecure: boolean;
  readonly tiktok: { readonly clientKey: string; readonly clientSecret: string } | null;
}

const DEV_ORIGINS: Record<SessionAudience, string> = {
  viewer: 'http://localhost:3000',
  backoffice: 'http://localhost:3001',
};

const PUBLIC_URL_ENV: Record<SessionAudience, string> = {
  viewer: 'NEXT_PUBLIC_VIEWER_URL',
  backoffice: 'NEXT_PUBLIC_BACKOFFICE_URL',
};

function resolveOrigin(audience: SessionAudience): string {
  const configured = process.env.APP_URL || process.env[PUBLIC_URL_ENV[audience]];
  const isProduction = process.env.NODE_ENV === 'production';

  if (!configured) {
    if (isProduction) {
      throw new Error(`APP_URL (or ${PUBLIC_URL_ENV[audience]}) must be set in production`);
    }
    return DEV_ORIGINS[audience];
  }

  const url = new URL(configured);
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (isProduction && url.protocol !== 'https:' && !isLocalhost) {
    throw new Error('APP_URL must use https in production');
  }
  return url.origin;
}

const cache = new Map<SessionAudience, AppConfig>();

export function getAppConfig(audience: SessionAudience): AppConfig {
  const cached = cache.get(audience);
  if (cached) return cached;

  const appOrigin = resolveOrigin(audience);
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const config: AppConfig = Object.freeze({
    audience,
    appOrigin,
    isSecure: appOrigin.startsWith('https://'),
    tiktok: clientKey && clientSecret ? Object.freeze({ clientKey, clientSecret }) : null,
  });
  cache.set(audience, config);
  return config;
}
