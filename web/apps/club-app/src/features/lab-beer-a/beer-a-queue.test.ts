import { describe, expect, it } from 'vitest';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { queueCountsOf, queueOf, settledOf, stockViewOf } from './beer-a-queue';

const NOW = '2026-11-04T18:40:00.000Z';

const person = (id: number) => ({ id, firstName: 'P', lastName: String(id), initials: 'PP' });

const crate = (id: number, personId: number, bookedAt: string) => ({
  id,
  personId,
  priceCents: 1800,
  enteredById: personId,
  bookedAt,
  undoneAt: null,
});

const world: LabBeerWorld = {
  now: NOW,
  pot: {
    id: 1,
    ownerId: 1,
    priceCents: 1800,
    paymentLink: null,
    paymentNote: null,
    openedAt: '2026-09-01T18:00:00.000Z',
    bookingPath: '/beer-list/book',
  },
  persons: [person(3), person(4), person(5), person(6), person(10)],
  operatorIds: [1],
  enrollments: [
    { personId: 3, startedAt: '2026-09-01T18:00:00.000Z', endedAt: null, endedById: null },
    { personId: 4, startedAt: '2026-09-01T18:00:00.000Z', endedAt: null, endedById: null },
    { personId: 5, startedAt: '2026-09-01T18:00:00.000Z', endedAt: null, endedById: null },
    {
      personId: 10,
      startedAt: '2026-09-01T18:00:00.000Z',
      endedAt: '2026-10-25T18:00:00.000Z',
      endedById: 2,
    },
  ],
  crates: [
    crate(1, 3, '2026-11-02T18:00:00.000Z'),
    crate(2, 4, '2026-10-01T18:00:00.000Z'),
    crate(3, 4, '2026-10-02T18:00:00.000Z'),
    crate(4, 5, '2026-10-05T18:00:00.000Z'),
    crate(5, 10, '2026-10-20T18:00:00.000Z'),
  ],
  payments: [
    { id: 1, personId: 5, crateCount: 1, bookedById: 1, bookedAt: '2026-10-30T18:00:00.000Z' },
  ],
  movements: [
    {
      id: 1,
      kind: 'delivery',
      count: 8,
      reason: null,
      bookedById: 1,
      bookedAt: '2026-10-01T10:00:00.000Z',
    },
  ],
};

describe('queueOf', () => {
  it('orders open tabs by their oldest open crate', () => {
    expect(queueOf(world, NOW, 'open').map((row) => [row.personId, row.overdue])).toEqual([
      [4, true],
      [10, true],
      [3, false],
    ]);
  });

  it('keeps former enrollees with open crates and marks them', () => {
    expect(queueOf(world, NOW, 'open').find((row) => row.personId === 10)?.enrolled).toBe(false);
  });

  it('filters to overdue tabs', () => {
    expect(queueOf(world, NOW, 'overdue').map((row) => row.personId)).toEqual([4, 10]);
  });
});

describe('queueCountsOf', () => {
  it('counts open tabs, overdue tabs and the open sum', () => {
    expect(queueCountsOf(world, NOW)).toEqual({ open: 3, overdue: 2, cents: 7200 });
  });
});

describe('settledOf', () => {
  it('lists fully paid tabs', () => {
    expect(settledOf(world)).toEqual([
      { personId: 5, paidCount: 1, lastPaidAt: '2026-10-30T18:00:00.000Z' },
    ]);
  });
});

describe('stockViewOf', () => {
  it('derives stock and the days until it runs empty', () => {
    const view = stockViewOf(world, NOW);

    expect(view.stock).toBe(3);
    expect(view.daysLeft).toBeCloseTo(3 / (2 / 21), 5);
    expect(view.warns).toBe(false);
  });
});
