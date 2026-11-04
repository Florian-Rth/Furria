import { describe, expect, it } from 'vitest';
import type { LabBeerTab, LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import {
  bookedIdsOf,
  bookingPreviewOf,
  bookingStanceOf,
  clampCount,
  countLimitOf,
  secondsLeftOf,
  settlementOf,
} from './ledger-booking';

const worldWith = (stock: number): LabBeerWorld => ({
  now: '2026-11-04T18:40:00.000Z',
  pot: {
    id: 1,
    ownerId: 1,
    priceCents: 1800,
    paymentLink: null,
    paymentNote: null,
    openedAt: '2026-09-01T18:00:00.000Z',
    bookingPath: '/beer-list/book',
  },
  persons: [],
  operatorIds: [1],
  enrollments: [
    { personId: 3, startedAt: '2026-09-01T18:00:00.000Z', endedAt: null, endedById: null },
    {
      personId: 10,
      startedAt: '2026-09-01T18:00:00.000Z',
      endedAt: '2026-10-25T18:00:00.000Z',
      endedById: 2,
    },
  ],
  crates: [
    {
      id: 41,
      personId: 3,
      priceCents: 1800,
      enteredById: 3,
      bookedAt: '2026-11-01T18:00:00.000Z',
      undoneAt: null,
    },
  ],
  payments: [],
  movements: [
    {
      id: 1,
      kind: 'delivery',
      count: stock + 1,
      reason: null,
      bookedById: 1,
      bookedAt: '2026-09-01T18:00:00.000Z',
    },
  ],
});

describe('bookingStanceOf', () => {
  it.each([
    [3, 5, 'book'],
    [3, 0, 'empty'],
    [10, 5, 'former'],
    [13, 5, 'declare'],
  ])('person %i with stock %i gets %s', (personId, stock, stance) => {
    expect(bookingStanceOf(worldWith(stock), personId)).toBe(stance);
  });
});

describe('counts', () => {
  it.each([
    [9, 3],
    [2, 2],
    [0, 0],
  ])('stock %i allows %i crates', (stock, limit) => {
    expect(countLimitOf(stock)).toBe(limit);
  });

  it.each([
    [0, 3, 1],
    [5, 3, 3],
    [3, 2, 2],
    [2, 0, 0],
  ])('clamps %i within %i to %i', (count, limit, clamped) => {
    expect(clampCount(count, limit)).toBe(clamped);
  });
});

describe('bookingPreviewOf', () => {
  it('adds the sum to the open amount', () => {
    expect(bookingPreviewOf(1800, 2, 5400)).toEqual({ sumCents: 3600, afterCents: 9000 });
  });
});

describe('bookedIdsOf', () => {
  it('predicts the ids the next booking takes', () => {
    expect(bookedIdsOf(worldWith(5), 2)).toEqual([42, 43]);
  });
});

describe('settlementOf', () => {
  const tab: LabBeerTab = {
    personId: 4,
    crates: [
      {
        crate: {
          id: 1,
          personId: 4,
          priceCents: 1700,
          enteredById: 4,
          bookedAt: '2026-09-10T18:00:00.000Z',
          undoneAt: null,
        },
        paidBy: null,
      },
      {
        crate: {
          id: 2,
          personId: 4,
          priceCents: 1800,
          enteredById: 4,
          bookedAt: '2026-10-10T18:00:00.000Z',
          undoneAt: null,
        },
        paidBy: null,
      },
    ],
    openCount: 2,
    openCents: 3500,
    paidCount: 0,
    oldestOpenAt: '2026-09-10T18:00:00.000Z',
  };

  it.each([
    [1, [1], 1700, 1],
    [2, [1, 2], 3500, 0],
  ])('settles %i crates oldest first', (count, ids, cents, remaining) => {
    const settlement = settlementOf(tab, count);

    expect([settlement.crates.map((entry) => entry.crate.id), settlement.cents]).toEqual([
      ids,
      cents,
    ]);
    expect(settlement.remainingCount).toBe(remaining);
  });
});

describe('secondsLeftOf', () => {
  it.each([
    ['2026-11-04T18:40:00.000Z', 10],
    ['2026-11-04T18:40:03.200Z', 7],
    ['2026-11-04T18:40:12.000Z', 0],
  ])('at %s leaves %i seconds', (now, seconds) => {
    expect(secondsLeftOf('2026-11-04T18:40:00.000Z', now, 10_000)).toBe(seconds);
  });
});
