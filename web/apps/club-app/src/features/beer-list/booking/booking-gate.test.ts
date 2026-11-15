import { describe, expect, it } from 'vitest';
import type { BeerListStanding } from '../beer-list-standing';
import type { OpenBeerPot } from '../schemas';
import type { BeerBookingGate, BeerBookingPhase } from './booking-gate';
import { bookingGateOf, bookingPhaseOf } from './booking-gate';

describe('bookingGateOf', () => {
  it.each<[BeerListStanding, OpenBeerPot | null, BeerBookingGate]>([
    [
      'taker',
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          { beerDrinkId: 1, name: 'Bier', cratePriceCents: 1800, hasStock: true, isDefault: false },
        ],
      },
      'open',
    ],
    ['taker', null, 'noPot'],
    [
      'keeper',
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          { beerDrinkId: 1, name: 'Bier', cratePriceCents: 1800, hasStock: true, isDefault: false },
        ],
      },
      'keeper',
    ],
    ['former', null, 'former'],
    [
      'none',
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          { beerDrinkId: 1, name: 'Bier', cratePriceCents: 1800, hasStock: true, isDefault: false },
        ],
      },
      'enroll',
    ],
  ])('%s with pot %# opens %s', (standing, pot, expected) => {
    expect(bookingGateOf(standing, pot)).toBe(expected);
  });
});

describe('bookingPhaseOf', () => {
  it.each<[string, boolean, OpenBeerPot | null, BeerBookingPhase]>([
    [
      'a crate is left',
      false,
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          { beerDrinkId: 1, name: 'Bier', cratePriceCents: 1800, hasStock: true, isDefault: false },
        ],
      },
      'choose',
    ],
    [
      'the stock is empty',
      false,
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          {
            beerDrinkId: 1,
            name: 'Bier',
            cratePriceCents: 1800,
            hasStock: false,
            isDefault: false,
          },
        ],
      },
      'empty',
    ],
    [
      'one of several drinks is left',
      false,
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          {
            beerDrinkId: 1,
            name: 'Veltins',
            cratePriceCents: 1800,
            hasStock: false,
            isDefault: false,
          },
          {
            beerDrinkId: 2,
            name: 'Radler',
            cratePriceCents: 1500,
            hasStock: true,
            isDefault: false,
          },
        ],
      },
      'choose',
    ],
    [
      'no drink is listed',
      false,
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [],
      },
      'empty',
    ],
    ['no pot is open', false, null, 'choose'],
    [
      'the last crate was just booked',
      true,
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          {
            beerDrinkId: 1,
            name: 'Bier',
            cratePriceCents: 1800,
            hasStock: false,
            isDefault: false,
          },
        ],
      },
      'undo',
    ],
    [
      'a crate was just booked',
      true,
      {
        beerPotId: 2,
        owner: null,
        paymentLink: null,
        openedAt: '2026-09-01T10:00:00Z',
        drinks: [
          { beerDrinkId: 1, name: 'Bier', cratePriceCents: 1800, hasStock: true, isDefault: false },
        ],
      },
      'undo',
    ],
  ])('offers %s as %s', (_label, isUndoOpen, pot, expected) => {
    expect(bookingPhaseOf(isUndoOpen, pot)).toBe(expected);
  });
});
