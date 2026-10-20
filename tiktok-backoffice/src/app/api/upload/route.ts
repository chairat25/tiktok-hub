import { PermissionAction } from '@tiktok/types';
import { RATE_LIMITS, enforceRateLimit, validationError } from '@tiktok/auth';
import { ok, protectedRoute, readJson } from '@tiktok/server';
import { createR2Storage } from '@/server/media/r2-storage';
import { MAX_IMAGE_BYTES } from '@/server/media/image-validation';
import { cacheRemoteImage, uploadImageFile } from '@/server/media/upload-media';

export const dynamic = 'force-dynamic';

const MULTIPART_OVERHEAD_BYTES = 64 * 1024;
const MAX_MULTIPART_BYTES = MAX_IMAGE_BYTES + MULTIPART_OVERHEAD_BYTES;

const storage = createR2Storage();

export const POST = protectedRoute('backoffice', { permission: PermissionAction.UPLOAD_MEDIA }, async (ctx) => {
  const { req, actor, services } = ctx;
  await enforceRateLimit(services.rateLimiter, `upload:user:${actor.user.id}`, RATE_LIMITS.uploadPerUser);

  const contentType = req.headers.get('content-type') ?? '';
  if (contentType.startsWith('application/json')) {
    const body = (await readJson(req)) as { remoteUrl?: unknown } | null;
    return ok(await cacheRemoteImage(storage, actor.user.id, body?.remoteUrl));
  }

  if (!contentType.startsWith('multipart/form-data')) {
    throw validationError('รูปแบบคำขอไม่ถูกต้อง');
  }
  // Reject oversized bodies before buffering the multipart payload into memory.
  if (Number(req.headers.get('content-length') ?? Infinity) > MAX_MULTIPART_BYTES) {
    throw validationError('ไฟล์มีขนาดใหญ่เกิน 5MB');
  }
  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    throw validationError('กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด');
  }
  return ok(await uploadImageFile(storage, actor.user.id, file));
});
