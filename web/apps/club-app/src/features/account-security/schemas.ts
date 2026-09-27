import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-rule';

export const CONFIRMATION_CODE_LENGTH = 6;

const EMAIL_MESSAGE = 'Bitte gib eine gültige E-Mail-Adresse ein.';
const CODE_MESSAGE = `Der Code hat ${CONFIRMATION_CODE_LENGTH} Ziffern.`;
const CURRENT_PASSWORD_MESSAGE = 'Bitte gib dein jetziges Passwort ein.';
const NEW_PASSWORD_MESSAGE = `Dein neues Passwort braucht mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`;
const PASSWORD_MESSAGE = 'Bitte gib dein Passwort ein.';

export const LoginEmailChangeSchema = z.object({
  confirmationExpiresAt: z.iso.datetime({ offset: true }),
});
export type LoginEmailChange = z.infer<typeof LoginEmailChangeSchema>;

export const LoginEmailFormSchema = z.object({
  loginEmail: z.string().trim().pipe(z.email(EMAIL_MESSAGE)),
  updateContactEmail: z.boolean(),
});
export type LoginEmailForm = z.infer<typeof LoginEmailFormSchema>;

export const toConfirmationDigits = (typed: string): string => typed.replace(/\D/g, '');

export const LoginEmailCodeFormSchema = z.object({
  code: z
    .string()
    .refine(
      (typed) => toConfirmationDigits(typed).length === CONFIRMATION_CODE_LENGTH,
      CODE_MESSAGE,
    ),
});
export type LoginEmailCodeForm = z.infer<typeof LoginEmailCodeFormSchema>;

export const PasswordFormSchema = z.object({
  currentPassword: z.string().min(1, CURRENT_PASSWORD_MESSAGE),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH, NEW_PASSWORD_MESSAGE),
});
export type PasswordForm = z.infer<typeof PasswordFormSchema>;

export const AccountDeletionFormSchema = z.object({
  password: z.string().min(1, PASSWORD_MESSAGE),
});
export type AccountDeletionForm = z.infer<typeof AccountDeletionFormSchema>;

export const LOGIN_EMAIL_FIELD_NAMES = ['loginEmail'] as const;
export const LOGIN_EMAIL_CODE_FIELD_NAMES = ['code', 'loginEmail'] as const;
export const PASSWORD_FIELD_NAMES = ['currentPassword', 'newPassword'] as const;
export const ACCOUNT_DELETION_FIELD_NAMES = ['password'] as const;
