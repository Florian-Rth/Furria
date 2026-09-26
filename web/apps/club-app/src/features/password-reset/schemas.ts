import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 12;

export const ResetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Dein Passwort braucht mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`),
});
export type ResetPasswordForm = z.infer<typeof ResetPasswordFormSchema>;
