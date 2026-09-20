import { z } from 'zod';

export const VENUE_NAME_MAX_LENGTH = 80;
export const VENUE_STREET_MAX_LENGTH = 120;
export const VENUE_ZIP_MAX_LENGTH = 10;
export const VENUE_CITY_MAX_LENGTH = 80;
export const VENUE_HINT_MAX_LENGTH = 200;

export const ManagedVenueSchema = z.object({
  venueId: z.number().int(),
  name: z.string(),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  hint: z.string().nullable(),
  archivedOn: z.iso.date().nullable(),
});
export type ManagedVenue = z.infer<typeof ManagedVenueSchema>;

export const ManagedVenuesResponseSchema = z.object({
  venues: z.array(ManagedVenueSchema),
});
export type ManagedVenuesResponse = z.infer<typeof ManagedVenuesResponseSchema>;

export const CreatedVenueSchema = z.object({ venueId: z.number().int() });
export type CreatedVenue = z.infer<typeof CreatedVenueSchema>;

export const VenueFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Der Ort braucht einen Namen.')
    .max(VENUE_NAME_MAX_LENGTH, `Höchstens ${VENUE_NAME_MAX_LENGTH} Zeichen.`),
  street: z
    .string()
    .trim()
    .min(1, 'Ohne Straße und Hausnummer findet niemand hin.')
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
});
export type VenueForm = z.infer<typeof VenueFormSchema>;
