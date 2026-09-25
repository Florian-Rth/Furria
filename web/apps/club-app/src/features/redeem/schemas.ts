import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 12;

const LiveLookupSchema = z.object({
  status: z.literal('live'),
  firstName: z.string(),
  loginEmail: z.string(),
});

const DeadLookupSchema = z.object({
  status: z.literal('dead'),
  firstName: z.null(),
  loginEmail: z.null(),
});

export const InvitationLookupSchema = z.discriminatedUnion('status', [
  LiveLookupSchema,
  DeadLookupSchema,
]);
export type InvitationLookup = z.infer<typeof InvitationLookupSchema>;

export const RedeemFormSchema = z.object({
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Dein Passwort braucht mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`),
});
export type RedeemForm = z.infer<typeof RedeemFormSchema>;
