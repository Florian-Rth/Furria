import { describe, expect, it } from 'vitest';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import type { PourJournalFilter } from './pour-journal';
import { filteredJournalOf, journalDaysOf, journalOf } from './pour-journal';

const world: LabBeerWorld = {
  now: '2026-11-04T19:00:00.000Z',
  pot: {
    id: 1,
    ownerId: 1,
    priceCents: 1800,
    paymentLink: null,
    paymentNote: null,
    openedAt: '2026-10-01T18:00:00.000Z',
    bookingPath: '/b',
  },
  persons: [],
  operatorIds: [1],
  enrollments: [
    {
      personId: 3,
      startedAt: '2026-11-01T10:00:00.000Z',
      endedAt: '2026-11-04T10:00:00.000Z',
      endedById: 1,
    },
  ],
  crates: [
    {
      id: 1,
      personId: 3,
      priceCents: 1700,
      enteredById: 3,
      bookedAt: '2026-11-02T19:00:00.000Z',
      undoneAt: null,
    },
    {
      id: 2,
      personId: 3,
      priceCents: 1800,
      enteredById: 3,
      bookedAt: '2026-11-02T19:00:00.000Z',
      undoneAt: null,
    },
    {
      id: 3,
      personId: 3,
      priceCents: 1800,
      enteredById: 3,
      bookedAt: '2026-11-03T19:00:00.000Z',
      undoneAt: '2026-11-03T19:00:04.000Z',
    },
  ],
  payments: [
    { id: 1, personId: 3, crateCount: 1, bookedById: 1, bookedAt: '2026-11-03T20:00:00.000Z' },
  ],
  movements: [
    {
      id: 1,
      kind: 'delivery',
      count: 20,
      reason: null,
      bookedById: 1,
      bookedAt: '2026-11-01T12:00:00.000Z',
    },
    {
      id: 2,
      kind: 'correction',
      count: -2,
      reason: 'breakage',
      bookedById: 1,
      bookedAt: '2026-11-03T12:00:00.000Z',
    },
  ],
};

const filterOf = (patch: Partial<PourJournalFilter>): PourJournalFilter => ({
  kind: 'all',
  personId: null,
  focus: 'all',
  focusPersonIds: new Set(),
  ...patch,
});

describe('journalOf', () => {
  it('lists every movement newest first with its stock effect', () => {
    expect(journalOf(world).map((entry) => [entry.kind, entry.count, entry.stockDelta])).toEqual([
      ['ended', 0, 0],
      ['payment', 1, 0],
      ['crate', 1, 0],
      ['correction', 2, -2],
      ['crate', 2, -2],
      ['delivery', 20, 20],
      ['enrolled', 0, 0],
    ]);
  });

  it('prices a payment by the crates it settled and marks undone crates', () => {
    const entries = journalOf(world);

    expect(entries.find((entry) => entry.kind === 'payment')?.cents).toBe(1700);
    expect(entries.filter((entry) => entry.undone).map((entry) => entry.at)).toEqual([
      '2026-11-03T19:00:00.000Z',
    ]);
  });
});

describe('filteredJournalOf', () => {
  it.each([
    [filterOf({ kind: 'stock' }), ['crate', 'correction', 'crate', 'delivery']],
    [filterOf({ kind: 'enrollment' }), ['ended', 'enrolled']],
    [filterOf({ focus: 'stock' }), ['correction', 'crate', 'delivery']],
    [
      filterOf({ focus: 'open', focusPersonIds: new Set([3]) }),
      ['ended', 'payment', 'crate', 'crate', 'enrolled'],
    ],
    [filterOf({ personId: 4 }), []],
  ])('narrows the journal (%#)', (filter, kinds) => {
    expect(filteredJournalOf(journalOf(world), filter).map((entry) => entry.kind)).toEqual(kinds);
  });
});

describe('journalDaysOf', () => {
  it('groups entries by Berlin day', () => {
    expect(journalDaysOf(journalOf(world)).map((day) => day.entries.length)).toEqual([1, 3, 1, 2]);
  });
});
