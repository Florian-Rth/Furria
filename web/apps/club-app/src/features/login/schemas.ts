import { z } from 'zod';
import { toReturnToParam } from '@/lib/return-to';

const EMAIL_MESSAGE = 'Bitte gib eine gültige E-Mail-Adresse ein.';
const PASSWORD_MESSAGE = 'Bitte gib dein Passwort ein.';

export const LoginFormSchema = z.object({
  email: z.string().trim().pipe(z.email(EMAIL_MESSAGE)),
  password: z.string().min(1, PASSWORD_MESSAGE),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export const EXPIRED_FLAG = 1;

const ReturnToSchema = z.string().transform(toReturnToParam).catch(undefined).optional();

const ExpiredFlagSchema = z.literal(EXPIRED_FLAG).optional().catch(undefined);

export const LoginSearchSchema = z.object({
  returnTo: ReturnToSchema,
  expired: ExpiredFlagSchema,
});
export type LoginSearch = z.infer<typeof LoginSearchSchema>;
