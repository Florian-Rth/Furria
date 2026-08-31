import { describe, expect, it } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import {
  deriveOrderFlowAction,
  deriveOrderFlowAvailabilityLabel,
  deriveOrderFlowCapacity,
  deriveOrderFlowNotice,
  deriveOrderFlowPriceLine,
} from './order-flow-display';

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  description: null,
  performers: null,
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 18,
};

const midPresale = new Date('2026-12-01T12:00');

const onSale = buildEvent(baseFacts, midPresale);

const withoutPrice = buildEvent({ ...baseFacts, priceCents: null }, midPresale);

const notScarce = buildEvent({ ...baseFacts, freeCount: 120 }, midPresale);

const scarceWithoutFreeCount: Event = { ...onSale, freeCount: null };

const announced = buildEvent({ ...baseFacts, freeCount: null, presaleStartsAt: null }, midPresale);

const presaleScheduled = buildEvent(
  { ...baseFacts, freeCount: null, presaleStartsAt: '2027-01-10T10:00' },
  midPresale,
);

const soldOut = buildEvent({ ...baseFacts, freeCount: 0 }, midPresale);

const salesClosed = buildEvent({ ...baseFacts, presaleEndsAt: '2026-11-20T18:00' }, midPresale);

const cancelled = buildCancelledEvent(baseFacts);

describe('deriveOrderFlowAction', () => {
  it('walks the flow forward and sends a deep link without buyer data back', () => {
    expect(deriveOrderFlowAction(1, false)).toMatchObject({ kind: 'step', step: 2 });
    expect(deriveOrderFlowAction(2, false)).toMatchObject({ kind: 'submit' });
    expect(deriveOrderFlowAction(3, true)).toMatchObject({ kind: 'pending' });
    expect(deriveOrderFlowAction(3, false)).toMatchObject({ kind: 'step', step: 2 });
  });
});

describe('deriveOrderFlowPriceLine', () => {
  it('prices a Karte, and stays silent for an evening without a price', () => {
    expect(deriveOrderFlowPriceLine(onSale)).toBe('14 € pro Karte');
    expect(deriveOrderFlowPriceLine(withoutPrice)).toBeNull();
  });
});

describe('deriveOrderFlowAvailabilityLabel', () => {
  it('drops the half it cannot state instead of inventing it', () => {
    expect(deriveOrderFlowAvailabilityLabel(onSale)).toBe('14 € pro Karte · 18 von 260 frei');
    expect(deriveOrderFlowAvailabilityLabel(withoutPrice)).toBe('18 von 260 frei');
    expect(deriveOrderFlowAvailabilityLabel(scarceWithoutFreeCount)).toBe(
      '14 € pro Karte · Vorverkauf läuft',
    );
  });
});

describe('deriveOrderFlowCapacity', () => {
  it('narrows both counts of a running sale', () => {
    expect(deriveOrderFlowCapacity(onSale)).toEqual({ freeCount: 18, capacity: 260 });
  });

  it('stays silent without a free count and outside the sale window', () => {
    expect(deriveOrderFlowCapacity(scarceWithoutFreeCount)).toBeNull();
    expect(deriveOrderFlowCapacity(presaleScheduled)).toBeNull();
    expect(deriveOrderFlowCapacity(salesClosed)).toBeNull();
  });
});

describe('deriveOrderFlowNotice', () => {
  it('lets a running sale through to the Kartenwahl', () => {
    expect(deriveOrderFlowNotice(onSale)).toBeNull();
    expect(deriveOrderFlowNotice(notScarce)).toBeNull();
  });

  it('routes a sold-out evening to the Kartenbörse and every other blocked one back', () => {
    expect(deriveOrderFlowNotice(soldOut)?.cta.to).toBe('/events/exchange');

    for (const event of [announced, presaleScheduled, salesClosed, cancelled]) {
      expect(deriveOrderFlowNotice(event)?.cta.to).toBe('/events/prunksitzung-1-2027');
    }
  });

  it('explains every blocked state in its own words', () => {
    const bodies = [announced, presaleScheduled, soldOut, salesClosed, cancelled].map(
      (event) => deriveOrderFlowNotice(event)?.body,
    );

    expect(bodies.every((body) => body !== undefined && body.length > 0)).toBe(true);
    expect(new Set(bodies).size).toBe(bodies.length);
  });
});
