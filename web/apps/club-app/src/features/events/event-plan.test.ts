import { describe, expect, it } from 'vitest';
import type { PlannedEvent } from './event-plan';
import { boardStateOf, daysBetween, leadShareOf, publishStateOf } from './event-plan';

const planned = (overrides: Partial<PlannedEvent> = {}): PlannedEvent => ({
  eventId: 1,
  startsAt: '2027-01-16T18:11:00Z',
  status: 'presaleScheduled',
  isOver: false,
  publishedAt: '2026-10-01T10:00:00Z',
  createdAt: '2026-10-01T10:00:00Z',
  priceCents: 1900,
  presaleStartsAt: '2026-11-14T10:00:00Z',
  detailsMissing: [],
  ticketRequests: { open: 0, cards: 0, oldestRequestedAt: null },
  review: { publishedAlbums: 0, publishedNews: 0 },
  steps: [
    { step: 'details', state: 'done', dueOn: '2026-10-18', opensOn: null },
    { step: 'tickets', state: 'open', dueOn: '2026-11-17', opensOn: null },
    { step: 'review', state: 'waiting', dueOn: '2027-01-30', opensOn: '2027-01-17' },
  ],
  currentStep: 'tickets',
  ...overrides,
});

describe('daysBetween', () => {
  it.each([
    ['2026-10-17', '2026-10-17', 0],
    ['2026-10-17', '2026-11-11', 25],
    ['2026-10-17', '2026-10-10', -7],
    ['2027-03-27', '2027-03-29', 2],
  ])('counts from %s to %s as %i days', (from, to, days) => {
    expect(daysBetween(from, to)).toBe(days);
  });
});

describe('boardStateOf', () => {
  it.each([
    ['done', 'details', 'details', 'done'],
    ['overdue', 'tickets', 'tickets', 'overdue'],
    ['open', 'tickets', 'tickets', 'current'],
    ['open', 'tickets', 'details', 'open'],
    ['waiting', 'review', null, 'waiting'],
  ] as const)('shows a %s %s step with current %s as %s', (state, step, current, shown) => {
    expect(boardStateOf(state, step, current)).toBe(shown);
  });
});

describe('leadShareOf', () => {
  it.each([
    ['before it was created', '2026-09-01T00:00:00Z', 0],
    ['halfway through the lead time', '2026-10-11T00:00:00Z', 0.5],
    ['after the evening', '2026-12-01T00:00:00Z', 1],
  ])('places the cursor %s', (_label, now, share) => {
    const event = planned({ createdAt: '2026-10-01T00:00:00Z', startsAt: '2026-10-21T00:00:00Z' });

    expect(leadShareOf(event, new Date(now))).toBeCloseTo(share);
  });

  it('fills the lead time when the evening starts before it was created', () => {
    const event = planned({ createdAt: '2026-10-21T00:00:00Z', startsAt: '2026-10-01T00:00:00Z' });

    expect(leadShareOf(event, new Date('2026-10-10T00:00:00Z'))).toBe(1);
  });
});

describe('publishStateOf', () => {
  it.each([
    ['a published evening', planned(), 'published'],
    ['a complete evening', planned({ publishedAt: null, detailsMissing: ['published'] }), 'ready'],
    [
      'an evening missing facts',
      planned({ publishedAt: null, detailsMissing: ['description', 'published'] }),
      'blocked',
    ],
    ['a cancelled evening', planned({ publishedAt: null, status: 'cancelled' }), 'closed'],
    ['a past evening', planned({ publishedAt: null, isOver: true }), 'closed'],
  ])('reads %s as %s', (_label, event, state) => {
    expect(publishStateOf(event)).toBe(state);
  });
});
