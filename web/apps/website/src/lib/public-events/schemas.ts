import { OpeningSlotSchema } from '@furria/api-client/opening-hours';
import { z } from 'zod';
import { PictureSchema } from '@/lib/api/schemas';
import { WallClockSchema } from '@/lib/api/wall-clock';
import { toParagraphs } from '@/lib/paragraphs';

export const SALES_STATUSES = [
  'announced',
  'presaleScheduled',
  'available',
  'fewLeft',
  'soldOut',
  'cancelled',
] as const;

export const SalesStatusSchema = z.enum(SALES_STATUSES);

export type SalesStatus = z.infer<typeof SalesStatusSchema>;

export const EventVenueSchema = z.object({
  name: z.string().min(1),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  hint: z.string().nullable(),
});

export type EventVenue = z.infer<typeof EventVenueSchema>;

export const PresalePlaceSchema = EventVenueSchema.extend({
  openingHours: z.array(OpeningSlotSchema),
});

export type PresalePlace = z.infer<typeof PresalePlaceSchema>;

export const EventPictureSchema = PictureSchema.extend({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type EventPicture = z.infer<typeof EventPictureSchema>;

export const EventSchema = z.object({
  eventId: z.number().int().positive(),
  title: z.string().min(1),
  startsAt: WallClockSchema,
  endsAt: WallClockSchema.nullable(),
  doorsOpenAt: WallClockSchema.nullable(),
  venue: EventVenueSchema,
  teaser: z.string().min(1),
  ageHint: z.string().nullable(),
  priceCents: z.number().int().nonnegative().nullable(),
  presaleStartsAt: WallClockSchema.nullable(),
  status: SalesStatusSchema,
  picture: EventPictureSchema.nullable(),
});

export type Event = z.infer<typeof EventSchema>;

export const EventsResponseSchema = z.object({
  events: z.array(EventSchema),
});

export const EventDetailSchema = EventSchema.extend({
  description: z.string().nullable().transform(toParagraphs),
  presalePlaces: z.array(PresalePlaceSchema),
});

export type EventDetail = z.infer<typeof EventDetailSchema>;
