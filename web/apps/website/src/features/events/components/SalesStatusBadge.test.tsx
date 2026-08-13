import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/seed/events';
import { EventSchema } from '@/lib/seed/events';
import { renderWithProviders } from '@/test/render';
import { SalesStatusBadge } from './SalesStatusBadge';

const buildBadgeEvent = (overrides: Partial<Event>): Event =>
  EventSchema.parse({
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
    freeCount: 74,
    salesStatus: 'onSale',
    ...overrides,
  });

describe('SalesStatusBadge', () => {
  it.each([
    [
      'announced',
      buildBadgeEvent({
        salesStatus: 'announced',
        presaleStartsAt: null,
        freeCount: null,
        capacity: null,
      }),
      'Vorverkauf folgt',
    ],
    [
      'presaleScheduled',
      buildBadgeEvent({ salesStatus: 'presaleScheduled', freeCount: null }),
      'Vorverkauf ab 11.11.2026',
    ],
    ['onSale', buildBadgeEvent({ salesStatus: 'onSale' }), '74 von 260 frei'],
    [
      'almostSoldOut',
      buildBadgeEvent({ salesStatus: 'almostSoldOut', freeCount: 18 }),
      '18 von 260 frei',
    ],
    ['soldOut', buildBadgeEvent({ salesStatus: 'soldOut', freeCount: 0 }), 'Ausverkauft'],
    ['salesClosed', buildBadgeEvent({ salesStatus: 'salesClosed' }), 'Vorverkauf beendet'],
    ['cancelled', buildBadgeEvent({ salesStatus: 'cancelled', freeCount: null }), 'Abgesagt'],
  ])('labels the %s state honestly', (_status, event, expectedLabel) => {
    renderWithProviders(<SalesStatusBadge event={event} />);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
  });
});
