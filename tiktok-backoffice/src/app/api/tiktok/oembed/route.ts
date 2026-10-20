import { z } from 'zod';
import { PermissionAction } from '@tiktok/types';
import { RATE_LIMITS, enforceRateLimit, validationError } from '@tiktok/auth';
import { isTikTokCdnUrl, isTikTokLink, logger, ok, protectedRoute } from '@tiktok/server';

export const dynamic = 'force-dynamic';

const OEMBED_ENDPOINT = 'https://www.tiktok.com/oembed';
const REQUEST_TIMEOUT_MS = 8_000;

const oembedSchema = z.object({
  title: z.string().max(2200).optional(),
  thumbnail_url: z.string().max(2048).optional(),
});

export const GET = protectedRoute('backoffice', { permission: PermissionAction.CREATE_PRODUCT }, async (ctx) => {
  const { req, actor, services } = ctx;
  await enforceRateLimit(services.rateLimiter, `oembed:user:${actor.user.id}`, RATE_LIMITS.oembedPerUser);

  const videoUrl = req.nextUrl.searchParams.get('url') ?? '';
  if (videoUrl.length > 2048 || !isTikTokLink(videoUrl)) {
    throw validationError('กรุณาระบุลิงก์คลิป TikTok ที่ถูกต้อง (https://www.tiktok.com/...)');
  }

  const res = await fetch(`${OEMBED_ENDPOINT}?url=${encodeURIComponent(videoUrl)}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });
  const parsed = oembedSchema.safeParse(await res.json().catch(() => null));
  if (!res.ok || !parsed.success) {
    logger.warn('tiktok.oembed_failed', { status: res.status });
    throw validationError('ไม่สามารถดึงข้อมูลคลิป TikTok ได้ กรุณาตรวจสอบลิงก์');
  }

  const thumbnailUrl = parsed.data.thumbnail_url ?? '';
  return ok({
    title: parsed.data.title ?? '',
    thumbnailUrl: isTikTokCdnUrl(thumbnailUrl) ? thumbnailUrl : '',
  });
});
