import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import type { UseQueryResult } from '@tanstack/react-query';
import { useMyBeerTabQuery, useOpenBeerPotQuery } from '../api';
import type { BeerTabTotals } from '../beer-tab';
import { tabStrokesOf, tabTotalsOf } from '../beer-tab';
import type { BeerTab, BeerTabPot, OpenBeerPot, OpenBeerPotResponse } from '../schemas';
import { pendingPotsOf } from './booking-overlay';
import type { BeerBooking } from './use-beer-booking';
import { useBeerBooking } from './use-beer-booking';

export interface BeerTabBooking {
  tabQuery: UseQueryResult<BeerTab, Error>;
  potQuery: UseQueryResult<OpenBeerPotResponse, Error>;
  pot: OpenBeerPot | null;
  pots: readonly BeerTabPot[];
  totals: BeerTabTotals;
  strokes: readonly KkTabStrokeState[];
  booking: BeerBooking;
}

export const useBeerTabBooking = (readsPot: boolean, now: number): BeerTabBooking => {
  const tabQuery = useMyBeerTabQuery();
  const potQuery = useOpenBeerPotQuery(readsPot);
  const pot = potQuery.data?.pot ?? null;
  const booking = useBeerBooking(pot);
  const pots = pendingPotsOf(tabQuery.data?.pots ?? [], pot, booking.pending);

  return {
    tabQuery,
    potQuery,
    pot,
    pots,
    totals: tabTotalsOf(pots),
    strokes: tabStrokesOf(pots, now, booking.freshCrateIds),
    booking,
  };
};
