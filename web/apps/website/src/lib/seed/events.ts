import { z } from 'zod';

export const SalesStatusSchema = z.enum([
  'announced',
  'presaleScheduled',
  'onSale',
  'almostSoldOut',
  'soldOut',
  'salesClosed',
  'cancelled',
]);

export type SalesStatus = z.infer<typeof SalesStatusSchema>;

const LocalDateTimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

export const EventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.string().min(1),
  venue: z.string().min(1),
  startsAt: LocalDateTimeSchema,
  doorsOpenAt: LocalDateTimeSchema.nullable(),
  teaser: z.string().min(1),
  ageHint: z.string().min(1).nullable(),
  priceCents: z.number().int().positive().nullable(),
  capacity: z.number().int().positive().nullable(),
  presaleStartsAt: LocalDateTimeSchema.nullable(),
  freeCount: z.number().int().nonnegative().nullable(),
  salesStatus: SalesStatusSchema,
});

export type Event = z.infer<typeof EventSchema>;

export const EventsSchema = z.array(EventSchema);

export interface EventFacts {
  id: string;
  title: string;
  type: string;
  venue: string;
  startsAt: string;
  doorsOpenAt: string | null;
  teaser: string;
  ageHint: string | null;
  priceCents: number | null;
  capacity: number | null;
  presaleStartsAt: string | null;
  presaleEndsAt: string | null;
  freeCount: number | null;
}

const ALMOST_SOLD_OUT_RATIO = 0.1;

const almostSoldOutThreshold = (capacity: number): number =>
  Math.ceil(capacity * ALMOST_SOLD_OUT_RATIO);

const deriveStatusBeforeSale = (facts: EventFacts): SalesStatus => {
  if (facts.freeCount !== null) {
    throw new Error(`Seed "${facts.id}" states a freeCount before sales have started`);
  }
  return facts.presaleStartsAt === null ? 'announced' : 'presaleScheduled';
};

const deriveStatusDuringSale = (facts: EventFacts, at: Date): SalesStatus => {
  const { capacity, freeCount } = facts;
  if (capacity === null || freeCount === null) {
    throw new Error(`Seed "${facts.id}" is on sale but misses capacity or freeCount`);
  }
  if (freeCount > capacity) {
    throw new Error(`Seed "${facts.id}" states more free seats than its capacity`);
  }
  if (facts.presaleEndsAt !== null && at >= new Date(facts.presaleEndsAt)) {
    return 'salesClosed';
  }
  if (freeCount === 0) {
    return 'soldOut';
  }
  if (freeCount <= almostSoldOutThreshold(capacity)) {
    return 'almostSoldOut';
  }
  return 'onSale';
};

const deriveSalesStatus = (facts: EventFacts, at: Date): SalesStatus => {
  if (facts.presaleEndsAt !== null && facts.presaleStartsAt === null) {
    throw new Error(`Seed "${facts.id}" states a presale end without a presale start`);
  }
  const saleHasStarted = facts.presaleStartsAt !== null && at >= new Date(facts.presaleStartsAt);

  return saleHasStarted ? deriveStatusDuringSale(facts, at) : deriveStatusBeforeSale(facts);
};

const toEventPayload = (
  facts: EventFacts,
  salesStatus: SalesStatus,
  freeCount: number | null,
): Event =>
  EventSchema.parse({
    id: facts.id,
    title: facts.title,
    type: facts.type,
    venue: facts.venue,
    startsAt: facts.startsAt,
    doorsOpenAt: facts.doorsOpenAt,
    teaser: facts.teaser,
    ageHint: facts.ageHint,
    priceCents: facts.priceCents,
    capacity: facts.capacity,
    presaleStartsAt: facts.presaleStartsAt,
    freeCount,
    salesStatus,
  });

export const buildEvent = (facts: EventFacts, at: Date): Event =>
  toEventPayload(facts, deriveSalesStatus(facts, at), facts.freeCount);

export const buildCancelledEvent = (facts: EventFacts): Event =>
  toEventPayload(facts, 'cancelled', null);

export const SEED_SNAPSHOT_AT = new Date('2026-12-01T12:00');

const DORFGEMEINDEHAUS = 'Dorfgemeindehaus Großfurra';

export const SEEDED_EVENTS: Event[] = [
  buildEvent(
    {
      id: 'prunksitzung-1-2027',
      title: '1. Prunksitzung',
      type: 'Prunksitzung',
      venue: DORFGEMEINDEHAUS,
      startsAt: '2027-01-23T19:11',
      doorsOpenAt: '2027-01-23T18:11',
      teaser:
        'Der große Auftakt: ein voller Abend mit allen Gruppen des Vereins. Traditionell zuerst ausverkauft.',
      ageHint: 'ab 12 Jahren empfohlen',
      priceCents: 1400,
      capacity: 260,
      presaleStartsAt: '2026-11-11T11:11',
      presaleEndsAt: null,
      freeCount: 18,
    },
    SEED_SNAPSHOT_AT,
  ),
  buildEvent(
    {
      id: 'prunksitzung-2-2027',
      title: '2. Prunksitzung',
      type: 'Prunksitzung',
      venue: DORFGEMEINDEHAUS,
      startsAt: '2027-01-30T19:11',
      doorsOpenAt: '2027-01-30T18:11',
      teaser: 'Derselbe Abend in zweiter Auflage — und meist die letzte Chance auf Karten.',
      ageHint: 'ab 12 Jahren empfohlen',
      priceCents: 1400,
      capacity: 260,
      presaleStartsAt: '2026-11-11T11:11',
      presaleEndsAt: null,
      freeCount: 74,
    },
    SEED_SNAPSHOT_AT,
  ),
  buildEvent(
    {
      id: 'weiberfasching-2027',
      title: 'Weiberfasching',
      type: 'Weiberfasching',
      venue: DORFGEMEINDEHAUS,
      startsAt: '2027-02-04T19:11',
      doorsOpenAt: '2027-02-04T18:30',
      teaser: 'Der Abend der Frauen: kurze Bühne, lange Tanzfläche.',
      ageHint: 'ab 16 Jahren',
      priceCents: 1000,
      capacity: 220,
      presaleStartsAt: '2026-11-11T11:11',
      presaleEndsAt: null,
      freeCount: 0,
    },
    SEED_SNAPSHOT_AT,
  ),
  buildEvent(
    {
      id: 'jugendfasching-2027',
      title: 'Jugendfasching',
      type: 'Jugendfasching',
      venue: DORFGEMEINDEHAUS,
      startsAt: '2027-02-05T18:11',
      doorsOpenAt: '2027-02-05T17:30',
      teaser: 'Eigene Musik, eigene Bühne, alkoholfreie Theke — für alle zwischen 14 und 18.',
      ageHint: '14 bis 18 Jahre',
      priceCents: 500,
      capacity: 200,
      presaleStartsAt: '2026-11-25T18:00',
      presaleEndsAt: null,
      freeCount: 137,
    },
    SEED_SNAPSHOT_AT,
  ),
  buildEvent(
    {
      id: 'rentnerfasching-2027',
      title: 'Rentnerfasching',
      type: 'Rentnerfasching',
      venue: DORFGEMEINDEHAUS,
      startsAt: '2027-02-06T14:11',
      doorsOpenAt: null,
      teaser: 'Kaffee, Kuchen und Bühne bei Tageslicht — ruhiger, gemütlicher, genauso lustig.',
      ageHint: null,
      priceCents: null,
      capacity: null,
      presaleStartsAt: '2027-01-10T10:00',
      presaleEndsAt: null,
      freeCount: null,
    },
    SEED_SNAPSHOT_AT,
  ),
  buildEvent(
    {
      id: 'kinderfasching-2027',
      title: 'Kinderfasching',
      type: 'Kinderfasching',
      venue: DORFGEMEINDEHAUS,
      startsAt: '2027-02-07T14:11',
      doorsOpenAt: '2027-02-07T13:45',
      teaser: 'Kinderdisco, Krapfen und Konfetti — halbe Länge, doppelt so laut.',
      ageHint: 'ab 3 Jahren in Begleitung',
      priceCents: 300,
      capacity: 240,
      presaleStartsAt: '2026-12-15T10:00',
      presaleEndsAt: null,
      freeCount: null,
    },
    SEED_SNAPSHOT_AT,
  ),
];
