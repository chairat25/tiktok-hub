import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'tiktok-media';
const publicUrl = process.env.R2_PUBLIC_URL || '';

export const isR2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey
);

export const r2Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    })
  : null;

export interface UploadResult {
  url: string;
  key: string;
  source: 'r2' | 'fallback';
}

/**
 * Uploads a file buffer directly to Cloudflare R2
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const fileExt = filename.split('.').pop() || 'jpg';
  const key = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  if (!isR2Configured || !r2Client) {
    console.warn('[R2_STORAGE] Cloudflare R2 credentials not set in .env. Using mock URL path.');
    return {
      url: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80`,
      key,
      source: 'fallback',
    };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await r2Client.send(command);

  const fileUrl = publicUrl
    ? `${publicUrl.replace(/\/$/, '')}/${key}`
    : `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${key}`;

  return {
    url: fileUrl,
    key,
    source: 'r2',
  };
}

/**
 * Downloads a remote image (e.g. from TikTok thumbnail CDN) and caches it permanently in Cloudflare R2
 */
export async function cacheRemoteImageToR2(
  remoteImageUrl: string
): Promise<UploadResult> {
  if (!isR2Configured || !r2Client) {
    return {
      url: remoteImageUrl,
      key: '',
      source: 'fallback',
    };
  }

  try {
    const res = await fetch(remoteImageUrl);
    if (!res.ok) throw new Error('Failed to fetch remote image');

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return await uploadBufferToR2(buffer, 'tiktok-thumbnail.jpg', contentType);
  } catch (error) {
    console.error('[R2_CACHE_ERROR] Could not cache remote image to R2:', error);
    return {
      url: remoteImageUrl,
      key: '',
      source: 'fallback',
    };
  }
}
