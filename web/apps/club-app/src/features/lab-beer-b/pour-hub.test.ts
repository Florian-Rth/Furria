import { describe, expect, it } from 'vitest';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import {
  centsOfPriceText,
  correctionDeltaOf,
  countOfText,
  hubSummaryOf,
  paymentPreviewOf,
  pourPersonOf,
  rosterInFocus,
  rosterOf,
  stockSeriesOf,
} from './pour-hub';

const crateAt = (id: number, personId: number, bookedAt: string, priceCents = 1800) => ({
  id,
  personId,
  priceCents,
  enteredById: personId,
  bookedAt,
  undoneAt: null,
});

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
    { personId: 3, startedAt: '2026-10-01T18:00:00.000Z', endedAt: null, endedById: null },
    { personId: 4, startedAt: '2026-10-01T18:00:00.000Z', endedAt: null, endedById: null },
    { personId: 5, startedAt: '2026-10-01T18:00:00.000Z', endedAt: null, endedById: null },
    {
      personId: 10,
      startedAt: '2026-10-01T18:00:00.000Z',
      endedAt: '2026-10-20T18:00:00.000Z',
      endedById: 1,
    },
    {
      personId: 11,
      startedAt: '2026-10-01T18:00:00.000Z',
      endedAt: '2026-10-20T18:00:00.000Z',
      endedById: 1,
    },
  ],
  crates: [
    crateAt(1, 3, '2026-11-03T19:00:00.000Z'),
    crateAt(2, 4, '2026-10-10T19:00:00.000Z', 1700),
    crateAt(3, 4, '2026-11-02T19:00:00.000Z'),
    crateAt(4, 10, '2026-10-05T19:00:00.000Z', 1700),
    crateAt(5, 5, '2026-11-01T19:00:00.000Z'),
  ],
  payments: [
    { id: 1, personId: 5, crateCount: 1, bookedById: 1, bookedAt: '2026-11-02T19:00:00.000Z' },
  ],
  movements: [
    {
      id: 1,
      kind: 'delivery',
      count: 10,
      reason: null,
      bookedById: 1,
      bookedAt: '2026-11-01T12:00:00.000Z',
    },
  ],
};

describe('rosterOf', () => {
  it('lists enrolled people and former ones with open crates, longest open first', () => {
    expect(rosterOf(world).map((row) => [row.personId, row.openDays, row.overdue])).toEqual([
      [10, 30, true],
      [4, 25, true],
      [3, 1, false],
      [5, null, false],
    ]);
  });

  it.each([
    ['all', [10, 4, 3, 5]],
    ['open', [10, 4, 3]],
    ['overdue', [10, 4]],
  ] as const)('narrows the roster to %s', (focus, expected) => {
    expect(rosterInFocus(rosterOf(world), focus).map((row) => row.personId)).toEqual(expected);
  });
});

describe('hubSummaryOf', () => {
  it('sums open tabs and counts the overdue ones', () => {
    expect(hubSummaryOf(world)).toMatchObject({
      stock: 5,
      openCents: 1800 + 3500 + 1700,
      openTabs: 3,
      overdue: 2,
    });
  });
});

describe('stockSeriesOf', () => {
  it('reports the stock at the end of each of the last days', () => {
    expect(stockSeriesOf(world, 5)).toEqual([-2, 7, 6, 5, 5]);
  });
});

describe('paymentPreviewOf', () => {
  it('settles the oldest open crates first at their own prices', () => {
    const tab = rosterOf(world).find((row) => row.personId === 4)?.tab;

    expect(tab && paymentPreviewOf(tab, 1)).toMatchObject({ cents: 1700 });
  });
});

describe('correctionDeltaOf', () => {
  it.each([
    ['shrinkage', 'more', 2, -2],
    ['breakage', 'less', 1, -1],
    ['miscount', 'more', 3, 3],
    ['miscount', 'less', 3, -3],
  ] as const)('books %s chosen %s × %i as %i', (reason, chosen, count, delta) => {
    expect(correctionDeltaOf(reason, chosen, count)).toBe(delta);
  });
});

describe('pourPersonOf', () => {
  it.each([
    [4, 'overdue', true],
    [3, 'open', true],
    [5, 'paid', true],
    [10, 'overdue', false],
  ] as const)('gives person %i the state %s', (personId, state, enrolled) => {
    expect(pourPersonOf(world, personId)).toMatchObject({ state, enrolled });
  });
});

describe('centsOfPriceText', () => {
  it.each([
    ['18,00', 1800],
    ['18', 1800],
    ['17,5', 1750],
    ['19.90 €', 1990],
    ['0', null],
    ['abc', null],
    ['18,999', null],
  ])('reads %s as %s', (text, cents) => {
    expect(centsOfPriceText(text)).toBe(cents);
  });
});

describe('countOfText', () => {
  it.each([
    ['12', 12],
    ['', 0],
    ['-3', 0],
    ['abc', 0],
  ])('reads %s as %i', (text, count) => {
    expect(countOfText(text)).toBe(count);
  });
});
