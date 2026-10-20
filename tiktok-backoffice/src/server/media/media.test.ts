import { describe, expect, it, vi } from 'vitest';
import { MAX_IMAGE_BYTES, assertValidImage, detectImageType } from './image-validation';
import { cacheRemoteImage, uploadImageFile } from './upload-media';
import { MediaStorage } from './media-storage';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
const HTML = Buffer.from('<html><script>alert(1)</script></html>');
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>');

function memoryStorage() {
  const puts: Array<{ key: string; contentType: string }> = [];
  const storage: MediaStorage = {
    async put({ key, contentType }) {
      puts.push({ key, contentType });
      return `https://media.example/${key}`;
    },
  };
  return { storage, puts };
}

describe('detectImageType', () => {
  it('recognizes images by magic bytes', () => {
    expect(detectImageType(PNG)?.mime).toBe('image/png');
    expect(detectImageType(JPEG)?.mime).toBe('image/jpeg');
  });

  it('rejects HTML and SVG payloads', () => {
    expect(detectImageType(HTML)).toBeNull();
    expect(detectImageType(SVG)).toBeNull();
  });

  it('rejects files above the size limit', () => {
    const big = Buffer.concat([PNG, Buffer.alloc(MAX_IMAGE_BYTES)]);
    expect(() => assertValidImage(big)).toThrow(expect.objectContaining({ code: 'VALIDATION_FAILED' }));
  });
});

describe('uploadImageFile', () => {
  it('stores with the sniffed type and a server-generated key, ignoring the client filename and type', async () => {
    const { storage, puts } = memoryStorage();
    const file = new File([PNG], '../../evil.html', { type: 'text/html' });

    const result = await uploadImageFile(storage, 'user-1', file);

    expect(result.source).toBe('r2');
    expect(puts[0].contentType).toBe('image/png');
    expect(puts[0].key).toMatch(/^products\/user-1\/[0-9a-f-]{36}\.png$/);
  });

  it('refuses an HTML file disguised as an image', async () => {
    const { storage } = memoryStorage();
    const file = new File([HTML], 'photo.jpg', { type: 'image/jpeg' });
    await expect(uploadImageFile(storage, 'user-1', file)).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});

describe('cacheRemoteImage', () => {
  it.each([
    'http://169.254.169.254/latest/meta-data/',
    'https://internal.service.local/secret.png',
    'file:///etc/passwd',
    'https://tiktokcdn.com.attacker.net/x.png',
  ])('refuses non-TikTok CDN URL %s without fetching', async (url) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { storage } = memoryStorage();
    await expect(cacheRemoteImage(storage, 'user-1', url)).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('fetches TikTok CDN images with redirects disabled', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JPEG, { status: 200, headers: { 'content-type': 'image/jpeg' } }));
    const { storage, puts } = memoryStorage();

    const result = await cacheRemoteImage(storage, 'user-1', 'https://p16-sign.tiktokcdn.com/a.jpeg');

    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ redirect: 'error' });
    expect(result.url).toMatch(/^https:\/\/media\.example\/products\/user-1\//);
    expect(puts[0].contentType).toBe('image/jpeg');
    fetchSpy.mockRestore();
  });
});
