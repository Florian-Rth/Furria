import { describe, expect, it } from 'vitest';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import {
  bookingStageOf,
  enrollAndBook,
  maxCountOf,
  memberOf,
  openAfterOf,
  withEmptyStock,
} from './pour-member';

const worldWithStock = (stock: number): LabBeerWorld => ({
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
    { personId: 3, startedAt: '2026-10-01T18:00:00.000Z', endedAt: null, endedById: null },
    {
      personId: 10,
      startedAt: '2026-10-01T18:00:00.000Z',
      endedAt: '2026-10-20T18:00:00.000Z',
      endedById: 1,
    },
  ],
  crates: [
    {
      id: 1,
      personId: 3,
      priceCents: 1700,
      enteredById: 3,
      bookedAt: '2026-10-02T19:00:00.000Z',
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
      bookedAt: '2026-10-01T18:00:00.000Z',
    },
  ],
});

describe('memberOf', () => {
  it.each([
    [3, 'enrolled'],
    [10, 'former'],
    [13, 'outside'],
  ] as const)('gives person %i the standing %s', (personId, standing) => {
    expect(memberOf(worldWithStock(5), personId).standing).toBe(standing);
  });

  it('counts open days from the oldest open crate', () => {
    expect(memberOf(worldWithStock(5), 3)).toMatchObject({ openDays: 33, stock: 5, maxCount: 3 });
  });
});

describe('maxCountOf', () => {
  it.each([
    [0, 0],
    [2, 2],
    [9, 3],
  ])('caps stock %i at %i crates per booking', (stock, expected) => {
    expect(maxCountOf(stock)).toBe(expected);
  });
});

describe('bookingStageOf', () => {
  it.each([
    [3, 5, 'book'],
    [13, 5, 'declare'],
    [10, 5, 'declare'],
    [3, 0, 'empty'],
    [13, 0, 'empty'],
  ] as const)('person %i with stock %i gets %s', (personId, stock, stage) => {
    expect(bookingStageOf(memberOf(worldWithStock(stock), personId))).toBe(stage);
  });
});

describe('openAfterOf', () => {
  it('adds the booked crates at the current price to the open amount', () => {
    expect(openAfterOf(memberOf(worldWithStock(5), 3), 2, 1800)).toBe(5300);
  });
});

describe('withEmptyStock', () => {
  it.each([5, 0])('brings a stock of %i down to zero', (stock) => {
    expect(memberOf(withEmptyStock(worldWithStock(stock)), 3).stock).toBe(0);
  });
});

describe('enrollAndBook', () => {
  it('enrolls the person and books her crates in one step', () => {
    const outcome = enrollAndBook(worldWithStock(5), 13, 2, '2026-11-04T19:00:00.000Z');

    expect(outcome.kind === 'done' && memberOf(outcome.world, 13)).toMatchObject({
      standing: 'enrolled',
      tab: { openCount: 2, openCents: 3600 },
    });
  });

  it('refuses when the stock cannot cover the crates', () => {
    expect(enrollAndBook(worldWithStock(1), 13, 2, '2026-11-04T19:00:00.000Z')).toEqual({
      kind: 'refused',
      refusal: 'outOfStock',
    });
  });
});
