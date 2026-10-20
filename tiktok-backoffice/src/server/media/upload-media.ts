import { randomUUID } from 'node:crypto';
import { serviceUnavailable, validationError } from '@tiktok/auth';
import { isTikTokCdnUrl, logger } from '@tiktok/server';
import { MAX_IMAGE_BYTES, assertValidImage } from './image-validation';
import { MediaStorage } from './media-storage';

const REMOTE_FETCH_TIMEOUT_MS = 10_000;
const DEV_PLACEHOLDER_URL =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

export interface UploadResult {
  url: string;
  source: 'r2' | 'fallback';
}

function objectKey(ownerId: string, ext: string): string {
  return `products/${ownerId}/${randomUUID()}.${ext}`;
}

/** Without storage, development gets a placeholder; production fails loudly instead of pretending. */
function requireStorage(storage: MediaStorage | null): MediaStorage | null {
  if (storage) return storage;
  if (process.env.NODE_ENV === 'production') {
    throw serviceUnavailable('ระบบจัดเก็บไฟล์ยังไม่ได้ตั้งค่า');
  }
  logger.warn('media.storage_not_configured');
  return null;
}

export async function uploadImageFile(
  storage: MediaStorage | null,
  ownerId: string,
  file: File
): Promise<UploadResult> {
  if (file.size > MAX_IMAGE_BYTES) throw validationError('ไฟล์มีขนาดใหญ่เกิน 5MB');
  const buffer = Buffer.from(await file.arrayBuffer());
  const image = assertValidImage(buffer);

  const target = requireStorage(storage);
  if (!target) return { url: DEV_PLACEHOLDER_URL, source: 'fallback' };

  const url = await target.put({ key: objectKey(ownerId, image.ext), body: buffer, contentType: image.mime });
  return { url, source: 'r2' };
}

async function readBodyWithLimit(res: Response, maxBytes: number): Promise<Buffer> {
  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > maxBytes) throw validationError('รูปภาพมีขนาดใหญ่เกินไป');
  if (!res.body) throw validationError('ไม่พบข้อมูลรูปภาพ');

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw validationError('รูปภาพมีขนาดใหญ่เกินไป');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

/**
 * Copies a TikTok thumbnail into our storage. Only TikTok CDN hosts over
 * https are fetched and redirects are refused, so this cannot be used as an
 * SSRF proxy into internal networks or arbitrary sites.
 */
export async function cacheRemoteImage(
  storage: MediaStorage | null,
  ownerId: string,
  remoteUrl: unknown
): Promise<UploadResult> {
  if (typeof remoteUrl !== 'string' || remoteUrl.length > 2048 || !isTikTokCdnUrl(remoteUrl)) {
    throw validationError('รองรับเฉพาะรูปภาพจาก TikTok CDN');
  }

  const target = requireStorage(storage);
  if (!target) return { url: remoteUrl, source: 'fallback' };

  const res = await fetch(remoteUrl, {
    redirect: 'error',
    signal: AbortSignal.timeout(REMOTE_FETCH_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!res.ok) throw validationError('ไม่สามารถดาวน์โหลดรูปภาพจาก TikTok ได้');

  const buffer = await readBodyWithLimit(res, MAX_IMAGE_BYTES);
  const image = assertValidImage(buffer);
  const url = await target.put({ key: objectKey(ownerId, image.ext), body: buffer, contentType: image.mime });
  return { url, source: 'r2' };
}
