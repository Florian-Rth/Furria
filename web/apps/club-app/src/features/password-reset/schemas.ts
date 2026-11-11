import { z } from 'zod';

export const ResetPasswordFormSchema = z.object({
  password: z.string().min(1, 'Bitte gib ein Passwort ein.'),
});
export type ResetPasswordForm = z.infer<typeof ResetPasswordFormSchema>;
