/** Hostnames (and their subdomains) that TikTok product and video links may point at. */
const TIKTOK_LINK_DOMAINS = ['tiktok.com'] as const;

/** CDN domains that serve TikTok thumbnails; the only hosts the server will fetch images from. */
const TIKTOK_CDN_DOMAINS = ['tiktokcdn.com', 'tiktokcdn-us.com', 'tiktokcdn-eu.com', 'ibyteimg.com', 'byteimg.com'] as const;

function matchesDomain(hostname: string, domains: readonly string[]): boolean {
  const host = hostname.toLowerCase();
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function parseHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    return url;
  } catch {
    return null;
  }
}

export function isTikTokLink(value: string): boolean {
  const url = parseHttpsUrl(value);
  return url !== null && matchesDomain(url.hostname, TIKTOK_LINK_DOMAINS);
}

export function isTikTokCdnUrl(value: string): boolean {
  const url = parseHttpsUrl(value);
  return url !== null && matchesDomain(url.hostname, TIKTOK_CDN_DOMAINS);
}
