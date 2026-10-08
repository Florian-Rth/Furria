import { describe, expect, it } from 'vitest';
import { formatEuros } from '@/lib/money';
import type { EventDetail, EventVenue } from '@/lib/public-events/schemas';
import type { VenueFact } from './event-detail-display';
import {
  deriveEventIntroParagraphs,
  deriveEventStats,
  deriveVenueFacts,
} from './event-detail-display';

const eveningWith = (overrides: Partial<EventDetail>): EventDetail => ({
  eventId: 1,
  title: '1. Prunksitzung',
  startsAt: '2027-01-23T19:11',
  endsAt: null,
  doorsOpenAt: '2027-01-23T18:11',
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
  teaser: 'Ein voller Abend.',
  description: ['Erster Absatz.', 'Zweiter Absatz.'],
  ageHint: 'ab 12 Jahren',
  priceCents: 1400,
  presaleStartsAt: '2026-11-11T11:11',
  status: 'available',
  ...overrides,
});

describe('deriveEventStats', () => {
  it('states the date, doors, start, price and age hint — never an end time', () => {
    expect(deriveEventStats(eveningWith({ endsAt: '2027-01-24T01:00' }))).toEqual([
      { value: '23. Januar 2027', label: 'Termin' },
      { value: '18:11 Uhr', label: 'Einlass' },
      { value: '19:11 Uhr', label: 'Beginn' },
      { value: formatEuros(1400), label: 'pro Karte' },
      { value: 'ab 12 Jahren', label: 'Alter' },
    ]);
  });

  it('omits doors, price and age hint while they are unknown', () => {
    const sparse = eveningWith({ doorsOpenAt: null, priceCents: null, ageHint: null });

    expect(deriveEventStats(sparse).map((stat) => stat.label)).toEqual(['Termin', 'Beginn']);
  });
});

describe('deriveEventIntroParagraphs', () => {
  it('prints the description when one exists', () => {
    expect(deriveEventIntroParagraphs(eveningWith({}))).toEqual([
      'Erster Absatz.',
      'Zweiter Absatz.',
    ]);
  });

  it('falls back to the teaser so the page still reads complete', () => {
    expect(deriveEventIntroParagraphs(eveningWith({ description: null }))).toEqual([
      'Ein voller Abend.',
    ]);
  });
});

describe('deriveVenueFacts', () => {
  it.each<[EventVenue, VenueFact[]]>([
    [
      {
        name: 'Dorfgemeindehaus',
        street: 'Schulstraße 4',
        zip: '99713',
        city: 'Großfurra',
        hint: 'Eingang über den Hof',
      },
      [
        { label: 'ADRESSE', value: 'Schulstraße 4, 99713 Großfurra' },
        { label: 'HINWEIS', value: 'Eingang über den Hof' },
      ],
    ],
    [
      { name: 'Festplatz', street: '', zip: '', city: 'Großfurra', hint: null },
      [{ label: 'ADRESSE', value: 'Großfurra' }],
    ],
    [{ name: 'Irgendwo', street: '', zip: '', city: '', hint: null }, []],
  ])('lists the facts of %j', (venue, facts) => {
    expect(deriveVenueFacts(venue)).toEqual(facts);
  });
});
