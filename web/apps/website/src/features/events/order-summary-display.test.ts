import { describe, expect, it } from 'vitest';
import type { EventFacts } from '@/lib/seed/events';
import { buildEvent } from '@/lib/seed/events';
import type { OrderBuyer } from '@/lib/seed/orders';
import { buildOrderDraftSummaryRows, deriveOrderDateLine } from './order-summary-display';

const facts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  description: null,
  performers: null,
  ageHint: null,
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 18,
};

const event = buildEvent(facts, new Date('2026-12-01T12:00'));

const buyer: OrderBuyer = {
  firstName: 'Lena',
  lastName: 'Brandt',
  email: 'lena.brandt@example.de',
};

describe('deriveOrderDateLine', () => {
  it('names the weekday, the day, the year and the time of the evening', () => {
    expect(deriveOrderDateLine('2027-01-23T19:11')).toBe('Sa., 23. Januar 2027 · 19:11 Uhr');
    expect(deriveOrderDateLine('2027-02-14T20:00')).toBe('So., 14. Februar 2027 · 20:00 Uhr');
  });
});

describe('buildOrderDraftSummaryRows', () => {
  it('summarises the evening and the buyer in order', () => {
    expect(buildOrderDraftSummaryRows(event, buyer)).toEqual([
      { label: 'Abend', value: '1. Prunksitzung' },
      { label: 'Termin', value: 'Sa., 23. Januar 2027 · 19:11 Uhr' },
      { label: 'Ort', value: 'Dorfgemeindehaus Großfurra' },
      { label: 'Bestellt von', value: 'Lena Brandt' },
      { label: 'E-Mail', value: 'lena.brandt@example.de' },
    ]);
  });

  it('invents no count, no sum and no total the selection cannot know yet', () => {
    for (const row of buildOrderDraftSummaryRows(event, buyer)) {
      expect(row.label).not.toMatch(/Karten|Summe|Gesamt/i);
      expect(row.value).not.toMatch(/€/);
    }
  });
});
