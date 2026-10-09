import { z } from 'zod';
import { toBerlinWallClock } from '@/lib/date';
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

const WallClockSchema = z.iso.datetime({ offset: true }).transform(toBerlinWallClock);

export const EventVenueSchema = z.object({
  name: z.string().min(1),
  street: z.string(),
  zip: z.string(),
  city: z.string(),
  hint: z.string().nullable(),
});

export type EventVenue = z.infer<typeof EventVenueSchema>;

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
});

export type Event = z.infer<typeof EventSchema>;

export const EventsResponseSchema = z.object({
  events: z.array(EventSchema),
});

export const EventDetailSchema = EventSchema.extend({
  description: z.string().nullable().transform(toParagraphs),
});

export type EventDetail = z.infer<typeof EventDetailSchema>;
