import { describe, expect, it } from 'vitest';
import type { PlannedEvent } from './event-plan';
import { daysBetween, publishStateOf } from './event-plan';

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
  steps: [
    { step: 'details', state: 'done', dueOn: '2026-10-18', opensOn: null },
    { step: 'tickets', state: 'open', dueOn: '2026-11-17', opensOn: null },
  ],
  currentStep: 'tickets',
  tablePlan: null,
  withoutTablePlan: false,
  ...overrides,
});

describe('daysBetween', () => {
  it.each([
    ['2026-10-17', '2026-10-10', -7],
    ['2027-03-27', '2027-03-29', 2],
  ])('counts from %s to %s as %i days', (from, to, days) => {
    expect(daysBetween(from, to)).toBe(days);
  });
});

describe('publishStateOf', () => {
  it.each([
    ['a complete evening', planned({ publishedAt: null, detailsMissing: ['published'] }), 'ready'],
    [
      'an evening missing facts',
      planned({ publishedAt: null, detailsMissing: ['description', 'published'] }),
      'blocked',
    ],
    ['a past evening', planned({ publishedAt: null, isOver: true }), 'closed'],
  ])('reads %s as %s', (_label, event, state) => {
    expect(publishStateOf(event)).toBe(state);
  });
});
