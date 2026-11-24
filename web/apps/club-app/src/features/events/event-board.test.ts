import { describe, expect, it } from 'vitest';
import { isDueSoonEvent, isOverdueEvent, nextDeadlineOf } from './event-board';
import type { PlannedEvent } from './event-plan';

const TODAY = '2026-10-19';

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

describe('nextDeadlineOf', () => {
  it('prefers an overdue step over an earlier open one', () => {
    const event = planned({
      steps: [
        { step: 'details', state: 'open', dueOn: '2026-10-01', opensOn: null },
        { step: 'tickets', state: 'overdue', dueOn: '2026-10-12', opensOn: null },
      ],
    });

    expect(nextDeadlineOf(event)).toEqual({
      step: 'tickets',
      state: 'overdue',
      dueOn: '2026-10-12',
    });
  });
});

describe('event filters', () => {
  it.each([
    {
      name: 'an open step due within two weeks',
      overrides: {
        steps: [
          { step: 'tickets' as const, state: 'open' as const, dueOn: '2026-10-30', opensOn: null },
        ],
      },
      overdue: false,
      dueSoon: true,
    },
    {
      name: 'an overdue step',
      overrides: {
        steps: [
          {
            step: 'details' as const,
            state: 'overdue' as const,
            dueOn: '2026-10-01',
            opensOn: null,
          },
        ],
      },
      overdue: true,
      dueSoon: false,
    },
    {
      name: 'a cancelled evening with an overdue step',
      overrides: {
        status: 'cancelled' as const,
        steps: [
          {
            step: 'details' as const,
            state: 'overdue' as const,
            dueOn: '2026-10-01',
            opensOn: null,
          },
        ],
      },
      overdue: false,
      dueSoon: false,
    },
  ])('$name', ({ overrides, overdue, dueSoon }) => {
    const event = planned(overrides);

    expect([isOverdueEvent(event), isDueSoonEvent(event, TODAY)]).toEqual([overdue, dueSoon]);
  });
});
