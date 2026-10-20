import { validationError } from '@tiktok/auth';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface DetectedImage {
  mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  ext: 'jpg' | 'png' | 'webp' | 'gif';
}

function startsWith(buffer: Buffer, signature: number[], offset = 0): boolean {
  return signature.every((byte, i) => buffer[offset + i] === byte);
}

/**
 * Identifies the image type from its magic bytes. The client-declared
 * Content-Type and filename are ignored, so HTML or SVG payloads cannot be
 * smuggled onto the public media domain as "images".
 */
export function detectImageType(buffer: Buffer): DetectedImage | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg' };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png' };
  if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38])) return { mime: 'image/gif', ext: 'gif' };
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

export function assertValidImage(buffer: Buffer): DetectedImage {
  if (buffer.length === 0) throw validationError('ไฟล์ว่างเปล่า');
  if (buffer.length > MAX_IMAGE_BYTES) throw validationError('ไฟล์มีขนาดใหญ่เกิน 5MB');
  const detected = detectImageType(buffer);
  if (!detected) throw validationError('รองรับเฉพาะไฟล์ JPEG, PNG, WebP หรือ GIF');
  return detected;
}
