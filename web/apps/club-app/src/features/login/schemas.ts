import { z } from 'zod';

const EMAIL_MESSAGE = 'Bitte gib eine gültige E-Mail-Adresse ein.';
const PASSWORD_MESSAGE = 'Bitte gib dein Passwort ein.';

export const LoginFormSchema = z.object({
  email: z.string().trim().pipe(z.email(EMAIL_MESSAGE)),
  password: z.string().min(1, PASSWORD_MESSAGE),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

const ExpiredMarkerSchema = z
  .union([z.literal(1), z.literal('1'), z.literal(true)])
  .optional()
  .transform((marker) => marker !== undefined);

export const LoginSearchSchema = z.object({
  returnTo: z.string().optional(),
  expired: ExpiredMarkerSchema,
});
export type LoginSearch = z.infer<typeof LoginSearchSchema>;
