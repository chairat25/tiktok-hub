import { staticSecurityHeaders } from '@tiktok/server/security-headers';

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@tiktok/types', '@tiktok/database', '@tiktok/auth', '@tiktok/server'],
  experimental: {
    serverComponentsExternalPackages: ['typeorm', 'pg', 'bcryptjs'],
  },
  async headers() {
    return [{ source: '/:path*', headers: staticSecurityHeaders(isProduction) }];
  },
};

export default nextConfig;
