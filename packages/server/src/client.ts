/**
 * Browser-side helper for calling our own JSON APIs. Unwraps the standard
 * `{ success, data, error }` envelope and throws ApiError on failure.
 * Safe to import from client components: it has no server dependencies.
 */
import type { ApiResponse } from '@tiktok/types';
import type { PublicUser } from '@tiktok/auth';

export type PublicUserView = PublicUser;

export interface MeResponse {
  authenticated: boolean;
  user: PublicUserView | null;
}

const FALLBACK_ERROR = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { ...init, credentials: 'same-origin' });
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !body?.success) {
    throw new ApiError(body?.error ?? FALLBACK_ERROR, res.status, body?.code);
  }
  return body.data as T;
}

export function postJson<T>(path: string, payload: unknown, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  return apiRequest<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function errorMessage(error: unknown, fallback: string = FALLBACK_ERROR): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
