import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { MediaStorage } from './media-storage';

/** Cloudflare R2 adapter for the MediaStorage port. Returns null when R2 is not configured. */
export function createR2Storage(): MediaStorage | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || 'tiktok-media';
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !publicUrl) return null;

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  return {
    async put({ key, body, contentType }) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: body,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );
      return `${publicUrl.replace(/\/$/, '')}/${key}`;
    },
  };
}
