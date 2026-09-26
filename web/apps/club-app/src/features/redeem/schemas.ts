import { z } from 'zod';
import { SessionTokensSchema } from '@/lib/api/schemas';

export const PASSWORD_MIN_LENGTH = 12;
export const CONFIRMATION_CODE_LENGTH = 6;

const EMAIL_MESSAGE = 'Bitte gib eine gültige E-Mail-Adresse ein.';
const CONFIRMATION_CODE_MESSAGE = `Der Code hat ${CONFIRMATION_CODE_LENGTH} Ziffern.`;

const LiveLookupSchema = z.object({
  status: z.literal('live'),
  firstName: z.string(),
  loginEmail: z.string().nullable(),
  contactEmailTaken: z.boolean(),
  purpose: z.enum(['onboarding', 'recovery']),
  claimableLoginEmail: z.string().nullable(),
});

const DeadLookupSchema = z.object({
  status: z.literal('dead'),
  firstName: z.null(),
  loginEmail: z.null(),
  contactEmailTaken: z.null(),
  purpose: z.null(),
  claimableLoginEmail: z.null(),
});

export const InvitationLookupSchema = z.discriminatedUnion('status', [
  LiveLookupSchema,
  DeadLookupSchema,
]);
export type InvitationLookup = z.infer<typeof InvitationLookupSchema>;

const RedeemedSchema = z.object({
  outcome: z.literal('redeemed'),
  session: SessionTokensSchema,
  confirmationExpiresAt: z.null(),
});

const ConfirmationRequiredSchema = z.object({
  outcome: z.literal('confirmationRequired'),
  session: z.null(),
  confirmationExpiresAt: z.iso.datetime({ offset: true }),
});

const ClaimRequiredSchema = z.object({
  outcome: z.literal('claimRequired'),
  session: z.null(),
  confirmationExpiresAt: z.null(),
});

export const RedemptionSchema = z.discriminatedUnion('outcome', [
  RedeemedSchema,
  ConfirmationRequiredSchema,
  ClaimRequiredSchema,
]);
export type Redemption = z.infer<typeof RedemptionSchema>;

export const RedeemFormSchema = z.object({
  loginEmail: z.string().trim().pipe(z.email(EMAIL_MESSAGE)),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Dein Passwort braucht mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`),
  updateContactEmail: z.boolean(),
});
export type RedeemForm = z.infer<typeof RedeemFormSchema>;

export const toConfirmationDigits = (typed: string): string => typed.replace(/\D/g, '');

export const ConfirmationFormSchema = z.object({
  code: z
    .string()
    .refine(
      (typed) => toConfirmationDigits(typed).length === CONFIRMATION_CODE_LENGTH,
      CONFIRMATION_CODE_MESSAGE,
    ),
});
export type ConfirmationForm = z.infer<typeof ConfirmationFormSchema>;

export const ClaimFormSchema = z.object({
  claimPassword: z.string().min(1, 'Gib das Passwort dieses Zugangs ein.'),
});
export type ClaimForm = z.infer<typeof ClaimFormSchema>;
