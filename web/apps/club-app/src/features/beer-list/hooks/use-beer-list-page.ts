import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import { useMeQuery } from '@/features/session/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { isForbiddenError, toQueryErrorMessage } from '@/lib/query-error';
import { useMinuteNow } from '@/lib/use-minute-now';
import { useBeerGiversQuery } from '../api';
import { BEER_LIST_ERROR_MESSAGES } from '../beer-list-copy';
import { beerListStandingOf, readsWholeBeerList } from '../beer-list-standing';
import type { BeerHistoryGroup, BeerPayee, BeerTabTotals } from '../beer-tab';
import { historyGroupsOf, payeesOf } from '../beer-tab';
import type { BeerBookingGate } from '../booking/booking-gate';
import { bookingGateOf } from '../booking/booking-gate';
import type { BeerBooking } from '../booking/use-beer-booking';
import { useBeerTabBooking } from '../booking/use-beer-tab-booking';
import type { BeerGiver } from '../schemas';

export type BeerListLoadState = 'loading' | 'failed' | 'denied' | 'ready';

export interface BeerListLoad {
  state: BeerListLoadState;
  failure: string | null;
  retrying: boolean;
  retry: () => void;
}

export interface BeerListPage {
  load: BeerListLoad;
  gate: BeerBookingGate;
  now: number;
  myPersonId: number | null;
  totals: BeerTabTotals;
  strokes: readonly KkTabStrokeState[];
  history: readonly BeerHistoryGroup[];
  payees: readonly BeerPayee[];
  givers: readonly BeerGiver[] | null;
  booking: BeerBooking;
}

const loadStateOf = (
  loaded: boolean,
  error: Error | null,
  tabError: Error | null,
): BeerListLoadState => {
  if (isForbiddenError(tabError)) {
    return 'denied';
  }

  if (loaded) {
    return 'ready';
  }

  return error === null ? 'loading' : 'failed';
};

export const useBeerListPage = (): BeerListPage => {
  const { keys } = usePermissions();
  const me = useMeQuery();
  const now = useMinuteNow().getTime();
  const standing = beerListStandingOf(keys, true);
  const readsAll = readsWholeBeerList(standing);
  const tabBooking = useBeerTabBooking(readsAll, now);
  const givers = useBeerGiversQuery(readsAll);
  const { tabQuery, potQuery, pots } = tabBooking;
  const loaded =
    tabQuery.data !== undefined &&
    (!readsAll || (potQuery.data !== undefined && givers.data !== undefined));
  const error = tabQuery.error ?? potQuery.error ?? givers.error;

  const retry = (): void => {
    void tabQuery.refetch();

    if (readsAll) {
      void potQuery.refetch();
      void givers.refetch();
    }
  };

  return {
    load: {
      state: loadStateOf(loaded, error, tabQuery.error),
      failure: toQueryErrorMessage(error, BEER_LIST_ERROR_MESSAGES),
      retrying: tabQuery.isRefetching || potQuery.isRefetching || givers.isRefetching,
      retry,
    },
    gate: bookingGateOf(standing, tabBooking.pot),
    now,
    myPersonId: me.data?.person?.id ?? null,
    totals: tabBooking.totals,
    strokes: tabBooking.strokes,
    history: historyGroupsOf(pots),
    payees: payeesOf(pots),
    givers: readsAll ? (givers.data?.givers ?? []) : null,
    booking: tabBooking.booking,
  };
};
