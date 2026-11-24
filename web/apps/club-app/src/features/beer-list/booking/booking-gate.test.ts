import { describe, expect, it } from 'vitest';
import type { BeerListStanding } from '../beer-list-standing';
import type { OpenBeerPot } from '../schemas';
import type { BeerBookingGate } from './booking-gate';
import { bookingGateOf } from './booking-gate';

describe('bookingGateOf', () => {
  it.each<[BeerListStanding, OpenBeerPot | null, BeerBookingGate]>([
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
