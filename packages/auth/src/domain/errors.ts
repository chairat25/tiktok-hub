/**
 * Application errors carry a stable machine code, an HTTP-friendly status, and a
 * message that is always safe to show to end users. Anything that is not an
 * AppError is treated as an internal failure and never exposed to clients.
 */
export type AppErrorCode =
  | 'VALIDATION_FAILED'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'OAUTH_FAILED'
  | 'SERVICE_UNAVAILABLE';

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  VALIDATION_FAILED: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  OAUTH_FAILED: 400,
  SERVICE_UNAVAILABLE: 503,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(code: AppErrorCode, message: string, options: { retryAfterSeconds?: number } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export const validationError = (message: string) => new AppError('VALIDATION_FAILED', message);
export const unauthenticated = (message = 'กรุณาเข้าสู่ระบบ') => new AppError('UNAUTHENTICATED', message);
export const forbidden = (message = 'ไม่มีสิทธิ์ดำเนินการนี้') => new AppError('FORBIDDEN', message);
export const notFound = (message = 'ไม่พบข้อมูล') => new AppError('NOT_FOUND', message);
export const conflict = (message: string) => new AppError('CONFLICT', message);
export const oauthFailed = (message = 'เชื่อมต่อ TikTok ไม่สำเร็จ') => new AppError('OAUTH_FAILED', message);
export const serviceUnavailable = (message = 'บริการไม่พร้อมใช้งานชั่วคราว') =>
  new AppError('SERVICE_UNAVAILABLE', message);
export const rateLimited = (retryAfterSeconds: number) =>
  new AppError('RATE_LIMITED', 'มีการเรียกใช้งานถี่เกินไป กรุณาลองใหม่ภายหลัง', { retryAfterSeconds });

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
