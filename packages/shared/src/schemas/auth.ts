import { z } from 'zod';

/**
 * Register schema
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Geçerli bir email adresi giriniz')
    .max(255),
  username: z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalı')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'
    ),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli'
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Verify email schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token gerekli'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

/**
 * Resend verification schema
 */
export const resendVerificationSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Update profile schema (displayName, about, avatarUrl)
 */
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .max(100, 'Görünen ad en fazla 100 karakter olabilir')
    .optional()
    .nullable(),
  about: z
    .string()
    .max(500, 'Hakkında en fazla 500 karakter olabilir')
    .optional()
    .nullable(),
  avatarUrl: z
    .preprocess(
      (v) => (v === '' ? null : v),
      z.union([
        z.string().url('Geçerli bir URL giriniz').max(2000),
        z.null(),
      ]).optional()
    ),
  socialLinks: z
    .record(z.string().url('Geçerli bir URL giriniz').max(2000).or(z.literal('')))
    .optional()
    .nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli'
    ),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Delete account schema
 */
export const deleteAccountSchema = z.object({
  password: z.string().optional(), // Optional for OAuth users
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'Hesabı silmeyi onaylamalısınız' }),
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// Legacy alias for backward compatibility
export const deactivateAccountSchema = deleteAccountSchema;
export type DeactivateAccountInput = DeleteAccountInput;

