import { NextResponse } from 'next/server';
import { ApiResponse } from '@tiktok/types';
import { isAppError } from '@tiktok/auth';
import { logger } from './logger';

const NO_STORE = { 'Cache-Control': 'no-store' };
const GENERIC_ERROR = 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง';

export function ok<T>(data: T, init: { status?: number } = {}): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: init.status ?? 200, headers: NO_STORE });
}

/**
 * Converts any thrown value into the standard error envelope. Only AppError
 * messages reach the client; everything else is logged and replaced with a
 * generic message so internals (SQL, stack traces) never leak.
 */
export function errorResponse(error: unknown, context: string): NextResponse<ApiResponse<never>> {
  if (isAppError(error)) {
    const headers: Record<string, string> = { ...NO_STORE };
    if (error.retryAfterSeconds) headers['Retry-After'] = String(error.retryAfterSeconds);
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.status, headers }
    );
  }

  logger.error('api.unhandled_error', error, { context });
  return NextResponse.json(
    { success: false, error: GENERIC_ERROR, code: 'INTERNAL_ERROR' },
    { status: 500, headers: NO_STORE }
  );
}
