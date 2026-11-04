import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import { useState } from 'react';
import { useMeQuery } from '@/features/session/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { formatEuroCents } from '@/lib/money';
import { toQueryErrorMessage } from '@/lib/query-error';
import { useMinuteNow } from '@/lib/use-minute-now';
import { useBeerListJoin } from '../api';
import { BOOK_ERROR_MESSAGES, doneDetail, JOIN_ERROR_MESSAGES, potLine } from '../beer-book-copy';
import { BEER_LIST_TITLE } from '../beer-list-copy';
import { personNameOf } from '../beer-list-format';
import { beerListStandingOf, readsWholeBeerList } from '../beer-list-standing';
import type { BeerTabTotals } from '../beer-tab';
import { bookingGateOf } from '../booking/booking-gate';
import type { BeerBookedCrates } from '../booking/booking-overlay';
import type { BeerBookPageStage } from '../booking/booking-page';
import { bookPageStageOf, isBookingDone } from '../booking/booking-page';
import type { BeerBooking } from '../booking/use-beer-booking';
import { useBeerTabBooking } from '../booking/use-beer-tab-booking';

export interface BeerBookJoin {
  owner: string | null;
  join: () => void;
  isJoining: boolean;
  failure: string | null;
}

export interface BeerBookLoad {
  failure: string;
  retrying: boolean;
  retry: () => void;
}

export interface BeerBookDone {
  isDone: boolean;
  line: string;
  again: () => void;
}

export interface BeerBookTally {
  totals: BeerTabTotals;
  hasCrates: boolean;
  strokes: readonly KkTabStrokeState[];
}

export interface BeerBookView {
  stage: BeerBookPageStage;
  caption: string;
  title: string;
  load: BeerBookLoad;
  joining: BeerBookJoin;
  tally: BeerBookTally;
  booking: BeerBooking;
  done: BeerBookDone;
}

export const useBeerBookPage = (): BeerBookView => {
  const me = useMeQuery();
  const { keys, isAffiliated } = usePermissions();
  const now = useMinuteNow().getTime();
  const standing = beerListStandingOf(keys, false);
  const takes = standing === 'taker';
  const tabBooking = useBeerTabBooking(readsWholeBeerList(standing), now, takes);
  const joining = useBeerListJoin();
  const [dismissed, setDismissed] = useState<BeerBookedCrates | null>(null);
  const { tabQuery, potQuery, pot, totals, booking } = tabBooking;
  const readsError = takes ? (tabQuery.error ?? potQuery.error) : null;
  const error = me.error ?? readsError;
  const person = me.data?.person ?? null;
  const ownerName = personNameOf(pot?.owner ?? null);
  const lapsed = booking.phase === 'undo' ? null : booking.lapsed;

  const retry = (): void => {
    void me.refetch();

    if (takes) {
      void tabQuery.refetch();
      void potQuery.refetch();
    }
  };

  const join = (): void => {
    joining.mutate();
  };

  const bookAgain = (): void => {
    setDismissed(lapsed);
  };

  return {
    stage: bookPageStageOf({
      gate: me.data === undefined ? null : bookingGateOf(standing, pot),
      isAffiliated,
      loaded: tabQuery.data !== undefined && potQuery.data !== undefined,
      failed: error !== null,
    }),
    caption: potLine(ownerName),
    title:
      person === null
        ? (me.data?.email ?? BEER_LIST_TITLE)
        : `${person.firstName} ${person.lastName}`,
    load: {
      failure: toQueryErrorMessage(error, BOOK_ERROR_MESSAGES) ?? BOOK_ERROR_MESSAGES.unexpected,
      retrying: me.isRefetching || tabQuery.isRefetching || potQuery.isRefetching,
      retry,
    },
    joining: {
      owner: ownerName,
      join,
      isJoining: joining.isPending,
      failure: toQueryErrorMessage(joining.error, JOIN_ERROR_MESSAGES),
    },
    tally: {
      totals,
      hasCrates: totals.openCount + totals.paidCount > 0,
      strokes: tabBooking.strokes,
    },
    booking,
    done: {
      isDone: isBookingDone(lapsed, dismissed),
      line: doneDetail(lapsed?.crateIds.length ?? 0, formatEuroCents(totals.openCents)),
      again: bookAgain,
    },
  };
};
