import { describe, expect, it } from 'vitest';
import type { EventFacts } from './events';
import {
  buildCancelledEvent,
  buildEvent,
  EventSchema,
  EventsSchema,
  SEED_SNAPSHOT_AT,
  SEEDED_EVENTS,
} from './events';

const midPresale = new Date('2026-12-01T12:00');

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 100,
};

const beforeSaleFacts: EventFacts = {
  ...baseFacts,
  priceCents: null,
  capacity: null,
  presaleStartsAt: null,
  freeCount: null,
};

describe('buildEvent', () => {
  it('derives announced when no presale date is known yet', () => {
    const event = buildEvent(beforeSaleFacts, midPresale);

    expect(event.salesStatus).toBe('announced');
    expect(event.freeCount).toBeNull();
  });

  it('derives presaleScheduled while the presale start lies ahead', () => {
    const facts = { ...beforeSaleFacts, presaleStartsAt: '2027-01-10T10:00' };

    expect(buildEvent(facts, midPresale).salesStatus).toBe('presaleScheduled');
  });

  it('derives onSale while plenty of seats are free', () => {
    expect(buildEvent(baseFacts, midPresale).salesStatus).toBe('onSale');
  });

  it('derives almostSoldOut at ten percent of capacity or fewer seats', () => {
    const scarce = { ...baseFacts, freeCount: 26 };

    expect(buildEvent(scarce, midPresale).salesStatus).toBe('almostSoldOut');
  });

  it('keeps onSale just above the ten percent threshold', () => {
    const justAbove = { ...baseFacts, freeCount: 27 };

    expect(buildEvent(justAbove, midPresale).salesStatus).toBe('onSale');
  });

  it('derives soldOut at zero free seats', () => {
    const full = { ...baseFacts, freeCount: 0 };

    expect(buildEvent(full, midPresale).salesStatus).toBe('soldOut');
  });

  it('derives salesClosed once the presale window has ended', () => {
    const closed = { ...baseFacts, presaleEndsAt: '2026-11-30T23:59' };

    expect(buildEvent(closed, midPresale).salesStatus).toBe('salesClosed');
  });

  it('rejects a freeCount stated before sales have started', () => {
    const contradictory = { ...beforeSaleFacts, freeCount: 100 };

    expect(() => buildEvent(contradictory, midPresale)).toThrow(/freeCount before sales/);
  });

  it('rejects an on-sale event without capacity or freeCount', () => {
    expect(() => buildEvent({ ...baseFacts, capacity: null }, midPresale)).toThrow(
      /misses capacity or freeCount/,
    );
    expect(() => buildEvent({ ...baseFacts, freeCount: null }, midPresale)).toThrow(
      /misses capacity or freeCount/,
    );
  });

  it('rejects more free seats than capacity', () => {
    const impossible = { ...baseFacts, freeCount: 261 };

    expect(() => buildEvent(impossible, midPresale)).toThrow(/more free seats/);
  });

  it('rejects a presale end without a presale start', () => {
    const dangling = { ...beforeSaleFacts, presaleEndsAt: '2026-11-30T23:59' };

    expect(() => buildEvent(dangling, midPresale)).toThrow(/presale end without/);
  });
});

describe('buildCancelledEvent', () => {
  it('derives cancelled and drops the counts', () => {
    const event = buildCancelledEvent(baseFacts);

    expect(event.salesStatus).toBe('cancelled');
    expect(event.freeCount).toBeNull();
  });
});

describe('EventSchema', () => {
  const payload = buildEvent(baseFacts, midPresale);

  it('parses a valid payload unchanged', () => {
    expect(EventSchema.parse(payload)).toEqual(payload);
  });

  it('drops fields the future endpoint may add', () => {
    expect(EventSchema.parse({ ...payload, seatingPlan: [] })).toEqual(payload);
  });

  it('rejects a sales status outside the public lifecycle', () => {
    expect(() => EventSchema.parse({ ...payload, salesStatus: 'notPublished' })).toThrow();
  });

  it('rejects timestamps that are not local minute precision', () => {
    expect(() => EventSchema.parse({ ...payload, startsAt: '23.01.2027 19:11' })).toThrow();
    expect(() => EventSchema.parse({ ...payload, startsAt: '2027-01-23' })).toThrow();
  });

  it('rejects a negative free count and a zero price', () => {
    expect(() => EventSchema.parse({ ...payload, freeCount: -1 })).toThrow();
    expect(() => EventSchema.parse({ ...payload, priceCents: 0 })).toThrow();
  });

  it('requires unknown optionals to be stated as null', () => {
    const { ageHint, ...withoutAgeHint } = payload;

    expect(ageHint).not.toBeUndefined();
    expect(() => EventSchema.parse(withoutAgeHint)).toThrow();
  });
});

describe('SEEDED_EVENTS', () => {
  it('parses as the future endpoint payload', () => {
    expect(EventsSchema.parse(SEEDED_EVENTS)).toEqual(SEEDED_EVENTS);
  });

  it('seeds the six evenings of the usual season in chronological order', () => {
    expect(SEEDED_EVENTS.map((event) => event.title)).toEqual([
      '1. Prunksitzung',
      '2. Prunksitzung',
      'Weiberfasching',
      'Jugendfasching',
      'Rentnerfasching',
      'Kinderfasching',
    ]);

    const startTimes = SEEDED_EVENTS.map((event) => event.startsAt);
    expect([...startTimes].sort()).toEqual(startTimes);
  });

  it('shows a mid-presale mix and never asserts a cancellation', () => {
    const statuses = new Set(SEEDED_EVENTS.map((event) => event.salesStatus));

    expect(statuses).toContain('presaleScheduled');
    expect(statuses).toContain('onSale');
    expect(statuses).toContain('almostSoldOut');
    expect(statuses).toContain('soldOut');
    expect(statuses).not.toContain('cancelled');
    expect(statuses).not.toContain('announced');
    expect(statuses).not.toContain('salesClosed');
  });

  it('lies entirely ahead of the seed snapshot moment', () => {
    for (const event of SEEDED_EVENTS) {
      expect(new Date(event.startsAt).getTime()).toBeGreaterThan(SEED_SNAPSHOT_AT.getTime());
    }
  });

  it('keeps every evening in the one confirmed venue', () => {
    for (const event of SEEDED_EVENTS) {
      expect(event.venue).toBe('Dorfgemeindehaus Großfurra');
    }
  });

  it('gives every evening a unique German-domain-word-plus-year slug', () => {
    const ids = SEEDED_EVENTS.map((event) => event.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*-2027$/);
    }
  });

  it('prices genuinely differently between events', () => {
    const prices = SEEDED_EVENTS.map((event) => event.priceCents).filter((price) => price !== null);

    expect(new Set(prices).size).toBeGreaterThan(1);
  });

  it('never lists the Rosenmontagsumzug — Veranstaltungen are ticketed evenings only', () => {
    for (const event of SEEDED_EVENTS) {
      expect(event.title).not.toMatch(/umzug/i);
    }
  });
});
