import { z } from 'zod';
import { ContactFieldsFormSchema } from '@/lib/contact-fields';

const NAME_MAX = 128;
const NAME_TOO_LONG_MESSAGE = `Höchstens ${NAME_MAX} Zeichen.`;
const ADDRESS_MISSING_MESSAGE = 'Als Mitglied brauchen wir deine Anschrift.';

export const IntakeLinkStateSchema = z.enum(['open', 'expired', 'used', 'discarded']);
export type IntakeLinkState = z.infer<typeof IntakeLinkStateSchema>;

export const IntakeLinkLookupSchema = z.object({
  clubName: z.string().nullable(),
  state: IntakeLinkStateSchema,
  addressRequired: z.boolean(),
});
export type IntakeLinkLookup = z.infer<typeof IntakeLinkLookupSchema>;

export const IntakeSubmittedSchema = z.object({
  invitationLink: z.string().nullable(),
});
export type IntakeSubmitted = z.infer<typeof IntakeSubmittedSchema>;

export const NewcomerFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Dein Vorname fehlt.').max(NAME_MAX, NAME_TOO_LONG_MESSAGE),
  lastName: z.string().trim().min(1, 'Dein Nachname fehlt.').max(NAME_MAX, NAME_TOO_LONG_MESSAGE),
  birthDate: z.iso
    .date()
    .nullable()
    .refine((day): boolean => day !== null, 'Dein Geburtsdatum fehlt.'),
  ...ContactFieldsFormSchema.shape,
  contactVisibleToMembers: z.boolean(),
});
export type NewcomerForm = z.infer<typeof NewcomerFormSchema>;

const ADDRESS_FIELDS = ['street', 'zip', 'city'] as const;

export const newcomerFormSchemaFor = (addressRequired: boolean): typeof NewcomerFormSchema =>
  addressRequired
    ? NewcomerFormSchema.superRefine((form, context) => {
        for (const field of ADDRESS_FIELDS) {
          if (form[field] === '') {
            context.addIssue({ code: 'custom', path: [field], message: ADDRESS_MISSING_MESSAGE });
          }
        }
      })
    : NewcomerFormSchema;
