import type { BeerBookingGate } from './booking-gate';
import type { BeerBookedCrates } from './booking-overlay';

export type BeerBookPageStage = 'loading' | 'failed' | 'unaffiliated' | 'enroll' | 'noPot' | 'book';

export interface BeerBookPageReads {
  gate: BeerBookingGate | null;
  isAffiliated: boolean;
  loaded: boolean;
  failed: boolean;
}

const pendingStageOf = (failed: boolean): BeerBookPageStage => (failed ? 'failed' : 'loading');

export const bookPageStageOf = ({
  gate,
  isAffiliated,
  loaded,
  failed,
}: BeerBookPageReads): BeerBookPageStage => {
  if (gate === null) {
    return pendingStageOf(failed);
  }

  if (gate !== 'open' && gate !== 'noPot') {
    return isAffiliated ? 'enroll' : 'unaffiliated';
  }

  if (!loaded) {
    return pendingStageOf(failed);
  }

  return gate === 'open' ? 'book' : 'noPot';
};

export const isBookingDone = (
  lapsed: BeerBookedCrates | null,
  dismissed: BeerBookedCrates | null,
): boolean => lapsed !== null && lapsed !== dismissed;
