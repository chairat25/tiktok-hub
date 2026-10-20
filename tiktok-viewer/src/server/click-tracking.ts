import { z } from 'zod';
import { parseInput, validationError } from '@tiktok/auth';
import { isTikTokLink, logger } from '@tiktok/server';

const clickSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  creatorId: z.string().trim().min(1).max(64),
  targetUrl: z.string().trim().max(2048),
});

export interface ClickResult {
  redirectUrl: string;
}

/**
 * Records a purchase click and returns where to send the viewer.
 * Products are not yet served from the database, so the destination is
 * validated against the TikTok domain allowlist instead of being looked up.
 * Once products live in the DB, resolve the URL from `productId` instead.
 */
export function trackPurchaseClick(rawInput: unknown, viewerId: string): ClickResult {
  const input = parseInput(clickSchema, rawInput);
  if (!isTikTokLink(input.targetUrl)) {
    throw validationError('ลิงก์สินค้าไม่ถูกต้อง');
  }

  logger.info('viewer.purchase_click', {
    viewerId,
    productId: input.productId,
    creatorId: input.creatorId,
  });
  return { redirectUrl: input.targetUrl };
}
