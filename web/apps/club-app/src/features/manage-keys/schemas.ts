import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';
import { requiredDay, requiredPerson } from '@/lib/required-fields';

export const KeyHoldingSchema = PersonRefSchema.extend({
  keyHoldingId: z.number().int(),
  sinceOn: z.iso.date(),
  untilOn: z.iso.date().nullable(),
});
export type KeyHolding = z.infer<typeof KeyHoldingSchema>;

export const KeyVenueSchema = z.object({
  venueId: z.number().int(),
  name: z.string(),
  archivedOn: z.iso.date().nullable(),
  holdings: z.array(KeyHoldingSchema),
});
export type KeyVenue = z.infer<typeof KeyVenueSchema>;

export const KeyHoldingsResponseSchema = z.object({
  venues: z.array(KeyVenueSchema),
});
export type KeyHoldingsResponse = z.infer<typeof KeyHoldingsResponseSchema>;

export const CreatedKeyHoldingSchema = z.object({ keyHoldingId: z.number().int() });
export type CreatedKeyHolding = z.infer<typeof CreatedKeyHoldingSchema>;

export const KeyHandoutFormSchema = z.object({
  person: requiredPerson('Wähle die Person, die den Schlüssel bekommt.'),
  sinceOn: requiredDay('Der Tag der Übergabe fehlt.'),
});

export const KeyReturnFormSchema = z.object({
  untilOn: requiredDay('Der Tag der Rückgabe fehlt.'),
});
