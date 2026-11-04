import { describe, expect, it } from 'vitest';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import {
  fillShareOf,
  hubHealthOf,
  peopleOf,
  rowStateOf,
  stockLinesOf,
  tableOf,
} from './ledger-hub';

const person = (id: number, firstName: string, lastName: string) => ({
  id,
  firstName,
  lastName,
  initials: `${firstName[0]}${lastName[0]}`,
});

const crate = (id: number, personId: number, bookedAt: string) => ({
  id,
  personId,
  priceCents: 1800,
  enteredById: personId,
  bookedAt,
  undoneAt: null,
});

const world: LabBeerWorld = {
  now: '2026-11-04T18:00:00.000Z',
  pot: {
    id: 1,
    ownerId: 1,
    priceCents: 1800,
    paymentLink: null,
    paymentNote: null,
    openedAt: '2026-09-01T18:00:00.000Z',
    bookingPath: '/beer-list/book',
  },
  persons: [
    person(1, 'Sabine', 'Roth'),
    person(3, 'Lena', 'Brandt'),
    person(4, 'Kevin', 'Maurer'),
    person(10, 'Dieter', 'Wolf'),
    person(13, 'Nina', 'Hartmann'),
  ],
  operatorIds: [1],
  enrollments: [
    { personId: 1, startedAt: '2026-09-01T18:00:00.000Z', endedAt: null, endedById: null },
    { personId: 3, startedAt: '2026-09-01T18:00:00.000Z', endedAt: null, endedById: null },
    { personId: 4, startedAt: '2026-09-01T18:00:00.000Z', endedAt: null, endedById: null },
    {
      personId: 10,
      startedAt: '2026-09-01T18:00:00.000Z',
      endedAt: '2026-10-25T18:00:00.000Z',
      endedById: 1,
    },
  ],
  crates: [
    crate(1, 4, '2026-09-20T18:00:00.000Z'),
    crate(2, 4, '2026-10-30T18:00:00.000Z'),
    crate(3, 3, '2026-11-01T18:00:00.000Z'),
    crate(4, 10, '2026-10-01T18:00:00.000Z'),
    crate(5, 1, '2026-10-02T18:00:00.000Z'),
  ],
  payments: [
    {
      id: 1,
      personId: 1,
      crateCount: 1,
      bookedById: 1,
      bookedAt: '2026-10-03T18:00:00.000Z',
    },
  ],
  movements: [
    {
      id: 1,
      kind: 'delivery',
      count: 10,
      reason: null,
      bookedById: 1,
      bookedAt: '2026-09-01T18:00:00.000Z',
    },
    {
      id: 2,
      kind: 'correction',
      count: -1,
      reason: 'breakage',
      bookedById: 1,
      bookedAt: '2026-10-15T18:00:00.000Z',
    },
  ],
};

describe('peopleOf', () => {
  it('keeps everyone with an enrollment or crates and reads participation', () => {
    expect(peopleOf(world).map((line) => [line.person.id, line.participation])).toEqual([
      [1, 'running'],
      [3, 'running'],
      [4, 'running'],
      [10, 'ended'],
    ]);
  });
});

describe('tableOf', () => {
  const lines = peopleOf(world);
  const ids = (filter: Parameters<typeof tableOf>[1], sort: Parameters<typeof tableOf>[2]) =>
    tableOf(lines, filter, sort).map((line) => line.person.id);

  it.each([
    ['all', 'open', [4, 10, 3, 1]],
    ['all', 'oldest', [4, 10, 3, 1]],
    ['all', 'name', [3, 4, 1, 10]],
    ['open', 'name', [3, 4, 10]],
    ['overdue', 'open', [4, 10]],
    ['running', 'name', [3, 4, 1]],
  ] as const)('filters %s sorted by %s', (filter, sort, expected) => {
    expect(ids(filter, sort)).toEqual(expected);
  });
});

describe('stock', () => {
  it('runs the stock after every movement, newest first', () => {
    expect(stockLinesOf(world).map((line) => [line.movement.id, line.stockAfter])).toEqual([
      [2, 6],
      [1, 10],
    ]);
  });

  it('measures the fill against the stock right after the last delivery', () => {
    expect(fillShareOf(world, 5)).toBe(0.5);
  });

  it('sums the health of the pot', () => {
    expect(hubHealthOf(world)).toMatchObject({
      stock: 4,
      windowCrates: 2,
      openCents: 7200,
      openPeople: 3,
      overdueCount: 2,
      runningCount: 3,
      endedCount: 1,
    });
  });
});

describe('rowStateOf', () => {
  const base = {
    person: { id: 1, firstName: 'A', lastName: 'B', initials: 'AB' },
    participation: 'running' as const,
    openCount: 0,
    openCents: 0,
    paidCount: 0,
    oldestOpenAt: null,
    openDays: null,
    overdue: false,
  };

  it.each([
    [{ ...base, participation: 'ended' as const, openCount: 2, overdue: true }, 'ended'],
    [{ ...base, openCount: 2, overdue: true }, 'overdue'],
    [{ ...base, openCount: 2 }, 'open'],
    [{ ...base, paidCount: 3 }, 'clear'],
    [base, 'fresh'],
  ])('reads row %#', (line, state) => {
    expect(rowStateOf(line)).toBe(state);
  });
});
