import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-rule';

export const ResetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Dein Passwort braucht mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`),
});
export type ResetPasswordForm = z.infer<typeof ResetPasswordFormSchema>;
