import { describe, expect, it } from 'vitest';
import type { BeerListStanding } from '../beer-list-standing';
import type { OpenBeerPot } from '../schemas';
import type { BeerBookingGate } from './booking-gate';
import { bookingGateOf } from './booking-gate';

const POT: OpenBeerPot = {
  beerPotId: 2,
  owner: null,
  cratePriceCents: 1800,
  paymentLink: null,
  paymentNote: null,
  openedAt: '2026-09-01T10:00:00Z',
};

describe('bookingGateOf', () => {
  it.each<[BeerListStanding, OpenBeerPot | null, BeerBookingGate]>([
    ['taker', POT, 'open'],
    ['taker', null, 'noPot'],
    ['keeper', POT, 'keeper'],
    ['former', null, 'former'],
    ['none', POT, 'enroll'],
  ])('%s with pot %# opens %s', (standing, pot, expected) => {
    expect(bookingGateOf(standing, pot)).toBe(expected);
  });
});
