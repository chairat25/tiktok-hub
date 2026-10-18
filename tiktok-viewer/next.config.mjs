/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tiktok/types', '@tiktok/database', '@tiktok/auth'],
  experimental: {
    serverComponentsExternalPackages: ['typeorm', 'pg', 'bcryptjs'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
