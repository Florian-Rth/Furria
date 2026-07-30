import { z } from 'zod';
import { deriveMembership } from './membership-derivation';

export const MembershipApplicationFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Bitte trag deinen Vornamen ein.'),
  lastName: z.string().trim().min(1, 'Bitte trag deinen Nachnamen ein.'),
  birthDate: z.string().trim().min(1, 'Bitte trag dein Geburtsdatum ein.'),
  street: z.string().trim().min(1, 'Bitte trag Straße und Hausnummer ein.'),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Bitte trag eine fünfstellige Postleitzahl ein.'),
  city: z.string().trim().min(1, 'Bitte trag deinen Ort ein.'),
  email: z
    .string()
    .trim()
    .pipe(z.email('Bitte trag eine E-Mail-Adresse ein, unter der wir dich erreichen.')),
  phone: z.string().trim(),
  groupInterests: z.array(z.string().min(1)),
  guardianName: z.string().trim(),
  guardianEmail: z.union([
    z.literal(''),
    z.string().trim().pipe(z.email('Bitte prüf die E-Mail-Adresse.')),
  ]),
  guardianPhone: z.string().trim(),
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
  groupInterests: [],
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  consent: false,
  honeypot: '',
};

export const buildMembershipApplicationFormSchema = (
  today: Date,
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

    if (!derived.requiresGuardian) {
      return;
    }

    if (ctx.value.guardianName.length === 0) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.guardianName,
        path: ['guardianName'],
        message: 'Bitte trag den Namen einer erwachsenen Person ein, die zustimmt.',
        continue: true,
      });
    }

    if (ctx.value.guardianEmail.length === 0 && ctx.value.guardianPhone.length === 0) {
      ctx.issues.push({
        code: 'custom',
        input: ctx.value.guardianEmail,
        path: ['guardianEmail'],
        message: 'Bitte trag E-Mail oder Telefon der erwachsenen Person ein.',
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
  groupInterests: z.array(z.string()),
  guardian: z
    .object({
      name: z.string(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
    })
    .nullable(),
  consentAccepted: z.boolean(),
});

export type MembershipApplicationPayload = z.infer<typeof MembershipApplicationPayloadSchema>;

export const MembershipApplicationResponseSchema = z.object({});

export type MembershipApplicationResponse = z.infer<typeof MembershipApplicationResponseSchema>;
