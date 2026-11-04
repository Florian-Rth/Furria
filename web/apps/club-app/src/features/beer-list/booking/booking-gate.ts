import type { BeerListStanding } from '../beer-list-standing';
import type { OpenBeerPot } from '../schemas';

export type BeerBookingGate = 'open' | 'noPot' | 'keeper' | 'former' | 'enroll';

export const bookingGateOf = (
  standing: BeerListStanding,
  pot: OpenBeerPot | null,
): BeerBookingGate => {
  switch (standing) {
    case 'former':
      return 'former';
    case 'keeper':
      return 'keeper';
    case 'none':
      return 'enroll';
    default:
      return pot === null ? 'noPot' : 'open';
  }
};
