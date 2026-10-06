import { z } from 'zod';
import { buildBelowAgeOfConsentMessage } from './apply-content';
import { deriveMembership } from './membership-derivation';

export const NAME_MAX_LENGTH = 80;

export const STREET_MAX_LENGTH = 120;

export const EMAIL_MAX_LENGTH = 254;

export const PHONE_PATTERN = /^[+0][\d\s()/.-]{5,30}$/;

export const GERMAN_POSTAL_CODE_PATTERN = /^(?:0[1-9]|[1-9]\d)\d{3}$/;

const optionalPhone = (message: string) =>
  z.union([z.literal(''), z.string().trim().regex(PHONE_PATTERN, message)]);

export const MembershipApplicationFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Bitte trag deinen Vornamen ein.')
    .max(NAME_MAX_LENGTH, 'Das sind mehr Zeichen, als wir speichern können.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Bitte trag deinen Nachnamen ein.')
    .max(NAME_MAX_LENGTH, 'Das sind mehr Zeichen, als wir speichern können.'),
  birthDate: z.string().trim().min(1, 'Bitte trag dein Geburtsdatum ein.'),
  street: z
    .string()
    .trim()
    .min(1, 'Bitte trag Straße und Hausnummer ein.')
    .max(STREET_MAX_LENGTH, 'Das sind mehr Zeichen, als wir speichern können.'),
  postalCode: z
    .string()
    .trim()
    .regex(GERMAN_POSTAL_CODE_PATTERN, 'Bitte trag eine fünfstellige Postleitzahl ein.'),
  city: z
    .string()
    .trim()
    .min(1, 'Bitte trag deinen Ort ein.')
    .max(NAME_MAX_LENGTH, 'Das sind mehr Zeichen, als wir speichern können.'),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX_LENGTH, 'Das sind mehr Zeichen, als eine E-Mail-Adresse haben darf.')
    .pipe(z.email('Bitte trag eine E-Mail-Adresse ein, unter der wir dich erreichen.')),
  phone: optionalPhone('Bitte trag eine Telefonnummer ein, unter der wir dich erreichen.'),
  consent: z
    .boolean()
    .refine((given) => given, 'Ohne diese Einwilligung dürfen wir den Antrag nicht annehmen.'),
  honeypot: z.string(),
});

export type MembershipApplicationForm = z.infer<typeof MembershipApplicationFormSchema>;

export const EMPTY_MEMBERSHIP_APPLICATION: MembershipApplicationForm = {
  firstName: '',
  lastName: '',
  birthDate: '',
  street: '',
  postalCode: '',
  city: '',
  email: '',
  phone: '',
  consent: false,
  honeypot: '',
};

export const buildMembershipApplicationFormSchema = (
  today: Date,
  ageOfConsent: number | null,
): typeof MembershipApplicationFormSchema =>
  MembershipApplicationFormSchema.check((ctx) => {
    if (ctx.value.birthDate.length === 0) {
      return;
    }

    const derived = deriveMembership(ctx.value.birthDate, today);

    if (derived === null) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.birthDate,
        path: ['birthDate'],
        message: 'Bitte prüf das Geburtsdatum — so kann es nicht stimmen.',
      });
      return;
    }

    if (ageOfConsent !== null && derived.age < ageOfConsent) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.birthDate,
        path: ['birthDate'],
        message: buildBelowAgeOfConsentMessage(ageOfConsent),
      });
    }
  });

export const MembershipApplicationPayloadSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  consentAccepted: z.boolean(),
  altcha: z.string(),
});

export type MembershipApplicationPayload = z.infer<typeof MembershipApplicationPayloadSchema>;

export const MembershipApplicationResponseSchema = z.object({});

export type MembershipApplicationResponse = z.infer<typeof MembershipApplicationResponseSchema>;

export const AltchaChallengeSchema = z.object({
  parameters: z.object({
    algorithm: z.string(),
    cost: z.number().int().positive(),
    expiresAt: z.number().int().positive(),
    keyLength: z.number().int().positive(),
    keyPrefix: z.string(),
    keySignature: z.string(),
    nonce: z.string(),
    salt: z.string(),
  }),
  signature: z.string(),
});

export type AltchaChallenge = z.infer<typeof AltchaChallengeSchema>;

export const ConfirmationOutcomeSchema = z.enum(['confirmed', 'alreadyConfirmed', 'expired']);

export type ConfirmationOutcome = z.infer<typeof ConfirmationOutcomeSchema>;

export const MembershipApplicationConfirmationResponseSchema = z.object({
  outcome: ConfirmationOutcomeSchema.exclude(['expired']),
});

export type MembershipApplicationConfirmationResponse = z.infer<
  typeof MembershipApplicationConfirmationResponseSchema
>;
