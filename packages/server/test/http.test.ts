import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { AppError } from '@tiktok/auth';
import { buildContentSecurityPolicy } from '../src/edge';
import { assertSameOrigin, readJson } from '../src/http/request';
import { errorResponse } from '../src/http/response';
import { isTikTokCdnUrl, isTikTokLink } from '../src/http/url-policy';

const ORIGIN = 'https://backoffice.example.com';

function request(method: string, headers: Record<string, string> = {}, body?: string) {
  return new NextRequest(`${ORIGIN}/api/x`, { method, headers, body });
}

describe('assertSameOrigin', () => {
  it('allows safe methods without an Origin header', () => {
    expect(() => assertSameOrigin(request('GET'), ORIGIN)).not.toThrow();
  });

  it('allows a same-origin POST', () => {
    const req = request('POST', { origin: ORIGIN, 'sec-fetch-site': 'same-origin' });
    expect(() => assertSameOrigin(req, ORIGIN)).not.toThrow();
  });

  it.each([
    ['missing origin', {}],
    ['foreign origin', { origin: 'https://evil.example' }],
    ['cross-site fetch metadata', { origin: ORIGIN, 'sec-fetch-site': 'cross-site' }],
    ['same-site sibling', { origin: 'https://shop.example.com', 'sec-fetch-site': 'same-site' }],
  ])('rejects a POST with %s', (_label, headers) => {
    expect(() => assertSameOrigin(request('POST', headers), ORIGIN)).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN' })
    );
  });
});

describe('readJson', () => {
  it('rejects non-JSON content types (blocks simple-request CSRF bodies)', async () => {
    await expect(readJson(request('POST', { 'content-type': 'text/plain' }, '{}'))).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    });
  });

  it('rejects oversized bodies', async () => {
    const big = JSON.stringify({ a: 'x'.repeat(20_000) });
    await expect(
      readJson(request('POST', { 'content-type': 'application/json' }, big))
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });

  it('parses valid JSON', async () => {
    const req = request('POST', { 'content-type': 'application/json' }, '{"a":1}');
    expect(await readJson(req)).toEqual({ a: 1 });
  });
});

describe('errorResponse', () => {
  it('exposes AppError messages with their status', async () => {
    const res = errorResponse(new AppError('RATE_LIMITED', 'slow down', { retryAfterSeconds: 30 }), 'test');
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
    expect(await res.json()).toMatchObject({ success: false, error: 'slow down', code: 'RATE_LIMITED' });
  });

  it('hides internal error details', async () => {
    const res = errorResponse(new Error('relation "users" does not exist'), 'test');
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('relation');
  });
});

describe('url policy', () => {
  it.each([
    ['https://www.tiktok.com/@a/video/1', true],
    ['https://shop.tiktok.com/view/product/1', true],
    ['https://tiktok.com.evil.com/x', false],
    ['https://eviltiktok.com/x', false],
    ['http://www.tiktok.com/x', false],
    ['https://user:pw@www.tiktok.com/x', false],
    ['javascript:alert(1)', false],
  ])('isTikTokLink(%s) === %s', (url, expected) => {
    expect(isTikTokLink(url)).toBe(expected);
  });

  it.each([
    ['https://p16-sign-sg.tiktokcdn.com/a.jpeg', true],
    ['https://p16.ibyteimg.com/a.jpeg', true],
    ['https://169.254.169.254/latest/meta-data', false],
    ['https://localhost/a.png', false],
    ['https://tiktokcdn.com.attacker.net/a.png', false],
  ])('isTikTokCdnUrl(%s) === %s', (url, expected) => {
    expect(isTikTokCdnUrl(url)).toBe(expected);
  });
});

describe('buildContentSecurityPolicy', () => {
  it('uses the nonce and forbids inline/eval scripts and framing in production', () => {
    const csp = buildContentSecurityPolicy({ nonce: 'abc', isDev: false });
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });
});
