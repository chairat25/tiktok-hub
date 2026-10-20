import { z } from 'zod';
import { validationError } from '../domain/errors';
import { PASSWORD_MAX_BYTES, PASSWORD_MIN_LENGTH, passwordByteLength } from '../security/password';

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const HANDLE_BODY = /^[a-z0-9._]{2,24}$/;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email('รูปแบบอีเมลไม่ถูกต้อง');

/** Passwords are never trimmed: whitespace is part of the secret. */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `รหัสผ่านต้องมีอย่างน้อย ${PASSWORD_MIN_LENGTH} ตัวอักษร`)
  .refine((value) => passwordByteLength(value) <= PASSWORD_MAX_BYTES, 'รหัสผ่านยาวเกินไป');

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'กรุณาระบุชื่อที่แสดง')
  .max(80, 'ชื่อที่แสดงยาวเกินไป')
  .refine((value) => !CONTROL_CHARS.test(value), 'ชื่อที่แสดงมีอักขระไม่ถูกต้อง');

/** Accepts "pond" or "@Pond" and normalizes to "@pond". */
export const creatorHandleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replace(/^@/, ''))
  .refine((value) => HANDLE_BODY.test(value), 'Handle ต้องเป็น a-z, 0-9, จุด หรือ _ ความยาว 2-24 ตัว')
  .transform((value) => `@${value}`);

/** Only absolute https URLs; blocks javascript:, data:, and plain http links. */
export const httpsUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .url('URL ไม่ถูกต้อง')
  .refine((value) => new URL(value).protocol === 'https:', 'URL ต้องขึ้นต้นด้วย https://');

/** Empty string clears the field; anything else must be a valid https URL. */
const optionalHttpsUrl = z
  .union([z.literal(''), httpsUrlSchema, z.null()])
  .transform((value) => (value ? value : null));

export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(1024),
});

export const registerInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  creatorHandle: creatorHandleSchema,
});

export const creatorSettingsInputSchema = z
  .object({
    displayName: displayNameSchema.optional(),
    creatorHandle: creatorHandleSchema.optional(),
    tiktokShopUrl: optionalHttpsUrl.optional(),
    avatarUrl: optionalHttpsUrl.optional(),
  })
  .strict();

export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type CreatorSettingsInput = z.infer<typeof creatorSettingsInputSchema>;

/** Parses untrusted input, converting the first schema issue into a user-safe AppError. */
export function parseInput<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw validationError(firstIssue?.message ?? 'ข้อมูลไม่ถูกต้อง');
  }
  return result.data;
}
