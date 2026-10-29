import { OpeningSlotSchema, OpeningWeekdaySchema } from '@furria/api-client/opening-hours';
import { z } from 'zod';
import { OPENING_SLOT_ISSUE_FIELDS, openingSlotIssuesOf } from './opening-hours-form';

export const VENUE_NAME_MAX_LENGTH = 80;
export const VENUE_STREET_MAX_LENGTH = 120;
export const VENUE_ZIP_MAX_LENGTH = 10;
export const VENUE_CITY_MAX_LENGTH = 80;
export const VENUE_HINT_MAX_LENGTH = 200;
export const VENUE_OPENING_SLOTS_MAX = 14;

export const ManagedVenueSchema = z.object({
  venueId: z.number().int(),
  name: z.string(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  hint: z.string().nullable(),
  archivedOn: z.iso.date().nullable(),
  openingHours: z.array(OpeningSlotSchema),
});
export type ManagedVenue = z.infer<typeof ManagedVenueSchema>;

export const ManagedVenuesResponseSchema = z.object({
  venues: z.array(ManagedVenueSchema),
});
export type ManagedVenuesResponse = z.infer<typeof ManagedVenuesResponseSchema>;

export const CreatedVenueSchema = z.object({ venueId: z.number().int() });
export type CreatedVenue = z.infer<typeof CreatedVenueSchema>;

const OPENING_SLOT_ISSUE_MESSAGES = {
  reversed: 'Das Ende muss nach dem Beginn liegen.',
  overlap: 'Überschneidet sich mit einer anderen Zeit an diesem Tag.',
} as const;

export const VenueOpeningSlotFormSchema = z.object({
  weekday: OpeningWeekdaySchema,
  opens: z.string().min(1, 'Der Beginn fehlt.'),
  closes: z.string().min(1, 'Das Ende fehlt.'),
});
export type VenueOpeningSlotForm = z.infer<typeof VenueOpeningSlotFormSchema>;

const VenueFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Der Ort braucht einen Namen.')
    .max(VENUE_NAME_MAX_LENGTH, `Höchstens ${VENUE_NAME_MAX_LENGTH} Zeichen.`),
  street: z
    .string()
    .trim()
    .min(1, 'Straße und Hausnummer fehlen.')
    .max(VENUE_STREET_MAX_LENGTH, `Höchstens ${VENUE_STREET_MAX_LENGTH} Zeichen.`),
  zip: z
    .string()
    .trim()
    .min(1, 'Die Postleitzahl fehlt.')
    .max(VENUE_ZIP_MAX_LENGTH, `Höchstens ${VENUE_ZIP_MAX_LENGTH} Zeichen.`),
  city: z
    .string()
    .trim()
    .min(1, 'Die Stadt fehlt.')
    .max(VENUE_CITY_MAX_LENGTH, `Höchstens ${VENUE_CITY_MAX_LENGTH} Zeichen.`),
  hint: z.string().trim().max(VENUE_HINT_MAX_LENGTH, `Höchstens ${VENUE_HINT_MAX_LENGTH} Zeichen.`),
  openingHours: z
    .array(VenueOpeningSlotFormSchema)
    .max(VENUE_OPENING_SLOTS_MAX, `Höchstens ${VENUE_OPENING_SLOTS_MAX} Zeiten.`),
});

export const VenueFormSchema = VenueFieldsSchema.superRefine((form, ctx) => {
  for (const issue of openingSlotIssuesOf(form.openingHours)) {
    ctx.addIssue({
      code: 'custom',
      message: OPENING_SLOT_ISSUE_MESSAGES[issue.kind],
      path: ['openingHours', issue.index, OPENING_SLOT_ISSUE_FIELDS[issue.kind]],
    });
  }
});
export type VenueForm = z.infer<typeof VenueFormSchema>;
