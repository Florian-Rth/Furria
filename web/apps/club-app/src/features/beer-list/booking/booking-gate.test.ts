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
        cratePriceCents: 1800,
        paymentLink: null,
        paymentNote: null,
        openedAt: '2026-09-01T10:00:00Z',
        hasStock: true,
      },
      'open',
    ],
    ['taker', null, 'noPot'],
    [
      'keeper',
      {
        beerPotId: 2,
        owner: null,
        cratePriceCents: 1800,
        paymentLink: null,
        paymentNote: null,
        openedAt: '2026-09-01T10:00:00Z',
        hasStock: true,
      },
      'keeper',
    ],
    ['former', null, 'former'],
    [
      'none',
      {
        beerPotId: 2,
        owner: null,
        cratePriceCents: 1800,
        paymentLink: null,
        paymentNote: null,
        openedAt: '2026-09-01T10:00:00Z',
        hasStock: true,
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
        cratePriceCents: 1800,
        paymentLink: null,
        paymentNote: null,
        openedAt: '2026-09-01T10:00:00Z',
        hasStock: true,
      },
      'choose',
    ],
    [
      'the stock is empty',
      false,
      {
        beerPotId: 2,
        owner: null,
        cratePriceCents: 1800,
        paymentLink: null,
        paymentNote: null,
        openedAt: '2026-09-01T10:00:00Z',
        hasStock: false,
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
        cratePriceCents: 1800,
        paymentLink: null,
        paymentNote: null,
        openedAt: '2026-09-01T10:00:00Z',
        hasStock: false,
      },
      'undo',
    ],
    [
      'a crate was just booked',
      true,
      {
        beerPotId: 2,
        owner: null,
        cratePriceCents: 1800,
        paymentLink: null,
        paymentNote: null,
        openedAt: '2026-09-01T10:00:00Z',
        hasStock: true,
      },
      'undo',
    ],
  ])('offers %s as %s', (_label, isUndoOpen, pot, expected) => {
    expect(bookingPhaseOf(isUndoOpen, pot)).toBe(expected);
  });
});
