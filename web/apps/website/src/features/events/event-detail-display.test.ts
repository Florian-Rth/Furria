import { describe, expect, it } from 'vitest';
import { formatEuros } from '@/lib/money';
import type { EventFacts } from '@/lib/seed/events';
import { buildEvent } from '@/lib/seed/events';
import {
  deriveEventIntroParagraphs,
  deriveEventLineup,
  deriveEventStats,
} from './event-detail-display';

const midPresale = new Date('2026-12-01T12:00');

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  description: ['Erster Absatz.', 'Zweiter Absatz.'],
  performers: null,
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 100,
};

const event = buildEvent(baseFacts, midPresale);

describe('deriveEventStats', () => {
  it('states Termin, Einlass, Beginn and price — never an end time', () => {
    expect(deriveEventStats(event)).toEqual([
      { value: '23. Januar 2027', label: 'Termin' },
      { value: '18:11 Uhr', label: 'Einlass' },
      { value: '19:11 Uhr', label: 'Beginn' },
      { value: formatEuros(1400), label: 'pro Karte' },
    ]);
  });

  it('omits Einlass and price while they are unknown', () => {
    const sparse = buildEvent(
      {
        ...baseFacts,
        doorsOpenAt: null,
        priceCents: null,
        capacity: null,
        presaleStartsAt: null,
        freeCount: null,
      },
      midPresale,
    );

    expect(deriveEventStats(sparse).map((stat) => stat.label)).toEqual(['Termin', 'Beginn']);
  });
});

describe('deriveEventIntroParagraphs', () => {
  it('prints the longer description when one exists', () => {
    expect(deriveEventIntroParagraphs(event)).toEqual(['Erster Absatz.', 'Zweiter Absatz.']);
  });

  it('falls back to the teaser so the page still reads complete', () => {
    const withoutDescription = buildEvent({ ...baseFacts, description: null }, midPresale);

    expect(deriveEventIntroParagraphs(withoutDescription)).toEqual(['Ein voller Abend.']);
  });
});

describe('deriveEventLineup', () => {
  it('numbers the acts in the order the Ablauf states them', () => {
    const withLineup = buildEvent(
      { ...baseFacts, performers: ['Elferrat', 'Tanzgarde', 'Büttenrede'] },
      midPresale,
    );

    expect(deriveEventLineup(withLineup)).toEqual([
      { position: '1', act: 'Elferrat' },
      { position: '2', act: 'Tanzgarde' },
      { position: '3', act: 'Büttenrede' },
    ]);
  });

  it('stays absent while no Ablauf has been assembled', () => {
    expect(
      deriveEventLineup(buildEvent({ ...baseFacts, performers: null }, midPresale)),
    ).toBeNull();
  });
});
