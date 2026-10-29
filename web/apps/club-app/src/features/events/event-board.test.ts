import { describe, expect, it } from 'vitest';
import {
  cellOf,
  defaultPaneOf,
  filterCountsOf,
  filterEvents,
  isDueSoonEvent,
  isOverdueEvent,
  leadRemainingOf,
  nextDeadlineOf,
  sessionTallyOf,
} from './event-board';
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
  review: { publishedAlbums: 0, publishedNews: 0 },
  steps: [
    { step: 'details', state: 'done', dueOn: '2026-10-18', opensOn: null },
    { step: 'tickets', state: 'open', dueOn: '2026-11-17', opensOn: null },
    { step: 'review', state: 'waiting', dueOn: '2027-01-30', opensOn: '2027-01-17' },
  ],
  currentStep: 'tickets',
  ...overrides,
});

describe('cellOf website', () => {
  it.each([
    { name: 'published', overrides: {}, state: 'done', fact: 'online' },
    {
      name: 'ready to publish',
      overrides: { publishedAt: null, detailsMissing: ['published' as const] },
      state: 'current',
      fact: 'publishReady',
    },
    {
      name: 'blocked',
      overrides: { publishedAt: null, detailsMissing: ['picture' as const, 'published' as const] },
      state: 'open',
      fact: 'blocked',
    },
    {
      name: 'blocked behind an overdue Eckdaten step',
      overrides: {
        publishedAt: null,
        detailsMissing: ['picture' as const, 'published' as const],
        steps: [
          {
            step: 'details' as const,
            state: 'overdue' as const,
            dueOn: '2026-10-10',
            opensOn: null,
          },
        ],
      },
      state: 'overdue',
      fact: 'blocked',
    },
    {
      name: 'never published and over',
      overrides: { publishedAt: null, isOver: true },
      state: 'off',
      fact: 'neverPublished',
    },
    {
      name: 'cancelled',
      overrides: { status: 'cancelled' as const },
      state: 'off',
      fact: 'cancelled',
    },
  ])('$name', ({ overrides, state, fact }) => {
    const cell = cellOf(planned(overrides), 'website', TODAY);

    expect(cell.state).toBe(state);
    expect(cell.fact.kind).toBe(fact);
  });
});

describe('cellOf steps', () => {
  it('marks the current step as current', () => {
    expect(cellOf(planned(), 'tickets', TODAY).state).toBe('current');
  });

  it('keeps a done step done', () => {
    expect(cellOf(planned(), 'details', TODAY).state).toBe('done');
  });

  it('names missing facts on Eckdaten', () => {
    const cell = cellOf(planned({ detailsMissing: ['doorsOpenAt', 'picture'] }), 'details', TODAY);

    expect(cell.fact).toEqual({ kind: 'factsMissing', details: ['doorsOpenAt', 'picture'] });
  });

  it('names missing ticket facts before the sales status', () => {
    const cell = cellOf(planned({ priceCents: null }), 'tickets', TODAY);

    expect(cell.fact).toEqual({ kind: 'ticketFactsMissing', facts: ['price'] });
  });

  it('names a missing presale place once price and presale are set but the step is open', () => {
    const cell = cellOf(planned(), 'tickets', TODAY);

    expect(cell.fact).toEqual({ kind: 'ticketFactsMissing', facts: ['places'] });
  });

  it('shows the sales status once the tickets step is done', () => {
    const cell = cellOf(
      planned({
        steps: [{ step: 'tickets', state: 'done', dueOn: '2026-11-17', opensOn: null }],
      }),
      'tickets',
      TODAY,
    );

    expect(cell.fact.kind).toBe('sales');
  });

  it('shows a sold-out evening as sales even without a price', () => {
    const cell = cellOf(planned({ priceCents: null, status: 'soldOut' }), 'tickets', TODAY);

    expect(cell.fact).toEqual({
      kind: 'sales',
      status: 'soldOut',
      priceCents: null,
      presaleStartsAt: '2026-11-14T10:00:00Z',
    });
  });

  it('shows the review opening day while nothing is published', () => {
    const cell = cellOf(planned(), 'review', TODAY);

    expect(cell.fact).toEqual({ kind: 'reviewOpens', opensOn: '2027-01-17' });
    expect(cell.state).toBe('waiting');
  });
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

  it('takes the nearest open step', () => {
    expect(nextDeadlineOf(planned())?.step).toBe('tickets');
  });

  it('is empty when every step is done', () => {
    const event = planned({
      steps: [{ step: 'details', state: 'done', dueOn: '2026-10-01', opensOn: null }],
    });

    expect(nextDeadlineOf(event)).toBeNull();
  });

  it('counts the days to the deadline in the cell', () => {
    const cell = cellOf(planned(), 'deadline', TODAY);

    expect(cell.fact).toEqual({
      kind: 'deadline',
      step: 'tickets',
      dueOn: '2026-11-17',
      daysLeft: 29,
    });
    expect(cell.pane).toBe('tickets');
  });
});

describe('event filters', () => {
  it.each([
    { name: 'a calm evening', overrides: {}, overdue: false, dueSoon: false },
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

describe('filterEvents', () => {
  const coming = planned({ eventId: 1, startsAt: '2026-12-01T18:00:00Z' });
  const sooner = planned({ eventId: 2, startsAt: '2026-11-11T18:00:00Z', publishedAt: null });
  const past = planned({ eventId: 3, startsAt: '2026-02-01T18:00:00Z', isOver: true });
  const older = planned({ eventId: 4, startsAt: '2025-11-11T18:00:00Z', isOver: true });
  const urgent = planned({
    eventId: 5,
    startsAt: '2027-02-01T18:00:00Z',
    steps: [{ step: 'details', state: 'overdue', dueOn: '2026-10-02', opensOn: null }],
  });
  const events = [past, coming, older, sooner, urgent];
  const ids = (list: readonly PlannedEvent[]): number[] => list.map((event) => event.eventId);

  it.each([
    { filter: 'all' as const, expected: [2, 1, 5, 3, 4] },
    { filter: 'offline' as const, expected: [2] },
    { filter: 'past' as const, expected: [3, 4] },
  ])('$filter orders as $expected', ({ filter, expected }) => {
    expect(ids(filterEvents(events, filter, TODAY))).toEqual(expected);
  });

  it('orders the due-soon list by its most pressing day', () => {
    const later = planned({
      eventId: 6,
      startsAt: '2026-11-20T18:00:00Z',
      steps: [{ step: 'tickets', state: 'open', dueOn: '2026-10-30', opensOn: null }],
    });
    const sooner = planned({
      eventId: 7,
      startsAt: '2026-12-20T18:00:00Z',
      steps: [{ step: 'tickets', state: 'open', dueOn: '2026-10-25', opensOn: null }],
    });

    expect(ids(filterEvents([later, sooner, coming], 'dueSoon', TODAY))).toEqual([7, 6]);
  });

  it('counts every filter', () => {
    expect(filterCountsOf(events, TODAY)).toEqual({
      all: 5,
      overdue: 1,
      dueSoon: 0,
      offline: 1,
      past: 2,
    });
  });
});

describe('sessionTallyOf', () => {
  it('sums the visible step states of coming live evenings', () => {
    const late = planned({
      eventId: 2,
      publishedAt: null,
      detailsMissing: ['picture', 'published'],
      steps: [
        { step: 'details', state: 'overdue', dueOn: '2026-10-10', opensOn: null },
        { step: 'tickets', state: 'open', dueOn: '2026-10-25', opensOn: null },
        { step: 'review', state: 'waiting', dueOn: '2027-01-30', opensOn: '2027-01-17' },
      ],
      currentStep: 'details',
    });
    const cancelled = planned({ eventId: 3, status: 'cancelled' });
    const past = planned({ eventId: 4, isOver: true });

    expect(sessionTallyOf([planned(), late, cancelled, past], TODAY)).toEqual({
      counts: { done: 2, overdue: 2, current: 1, open: 1, waiting: 2 },
      total: 8,
    });
  });
});

describe('leadRemainingOf', () => {
  it.each([
    { name: 'half the lead time left', overrides: {}, expected: 0.5 },
    { name: 'past evenings', overrides: { isOver: true }, expected: null },
    { name: 'cancelled evenings', overrides: { status: 'cancelled' as const }, expected: null },
  ])('$name', ({ overrides, expected }) => {
    const event = planned({
      createdAt: '2026-10-01T00:00:00Z',
      startsAt: '2026-11-01T00:00:00Z',
      ...overrides,
    });

    expect(leadRemainingOf(event, new Date('2026-10-16T12:00:00Z'))).toBe(expected);
  });
});

describe('defaultPaneOf', () => {
  it.each([
    { name: 'the current step', overrides: {}, expected: 'tickets' },
    {
      name: 'publishing when ready',
      overrides: { publishedAt: null, detailsMissing: ['published' as const] },
      expected: 'website',
    },
    {
      name: 'the website when nothing is current',
      overrides: { currentStep: null },
      expected: 'website',
    },
  ])('$name', ({ overrides, expected }) => {
    expect(defaultPaneOf(planned(overrides))).toBe(expected);
  });
});
