import { describe, expect, it } from 'vitest';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import {
  bookedIdsOf,
  bookingStateOf,
  centsFromInput,
  countChoicesOf,
  emptiedWorldOf,
  fittingCountOf,
  inputFromCents,
  standingOf,
  withPotSettings,
} from './beer-a-access';

const AT = '2026-11-04T18:40:00.000Z';

const worldOf = (stock: number): LabBeerWorld => ({
  now: AT,
  pot: {
    id: 1,
    ownerId: 1,
    priceCents: 1800,
    paymentLink: 'https://paypal.me/x',
    paymentNote: 'IBAN',
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
      id: 7,
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

describe('standingOf', () => {
  it.each([
    [3, 'enrolled'],
    [10, 'former'],
    [13, 'outsider'],
  ])('sees person %i as %s', (personId, standing) => {
    expect(standingOf(worldOf(5), personId)).toBe(standing);
  });
});

describe('bookingStateOf', () => {
  it.each([
    [5, 3, 'book'],
    [5, 13, 'declare'],
    [5, 10, 'declare'],
    [0, 3, 'empty'],
    [0, 13, 'empty'],
  ])('with stock %i shows person %i the %s state', (stock, personId, state) => {
    expect(bookingStateOf(worldOf(stock), personId)).toBe(state);
  });
});

describe('countChoicesOf', () => {
  it('disables counts above the stock', () => {
    expect(countChoicesOf(2)).toEqual([
      { value: 1, disabled: false },
      { value: 2, disabled: false },
      { value: 3, disabled: true },
    ]);
  });
});

describe('fittingCountOf', () => {
  it.each([
    [3, 2, 2],
    [2, 9, 2],
    [3, 0, 1],
  ])('fits %i crates into stock %i as %i', (count, stock, fitted) => {
    expect(fittingCountOf(count, stock)).toBe(fitted);
  });
});

describe('bookedIdsOf', () => {
  it('continues after the highest crate id', () => {
    expect(bookedIdsOf(worldOf(5), 3)).toEqual([8, 9, 10]);
  });
});

describe('emptiedWorldOf', () => {
  it('corrects the stock down to zero', () => {
    const emptied = emptiedWorldOf(worldOf(4), AT);

    expect(bookingStateOf(emptied, 3)).toBe('empty');
  });
});

describe('withPotSettings', () => {
  it('stores blank payment details as absent', () => {
    const outcome = withPotSettings(worldOf(1), {
      priceCents: 1900,
      paymentLink: '  ',
      paymentNote: ' IBAN DE00 ',
    });

    expect(outcome.kind === 'done' ? outcome.world.pot : null).toMatchObject({
      priceCents: 1900,
      paymentLink: null,
      paymentNote: 'IBAN DE00',
    });
  });
});

describe('centsFromInput', () => {
  it.each([
    ['18,00', 1800],
    ['18', 1800],
    ['17.5', 1750],
    ['19,90 €', 1990],
    ['0', null],
    ['abc', null],
    ['', null],
  ])('reads %s as %s', (input, cents) => {
    expect(centsFromInput(input)).toBe(cents);
  });
});

describe('inputFromCents', () => {
  it.each([
    [1800, '18,00'],
    [1705, '17,05'],
  ])('writes %i as %s', (cents, input) => {
    expect(inputFromCents(cents)).toBe(input);
  });
});
