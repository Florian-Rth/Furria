import type { KkTabFigureRoll } from '@furria/ui/KkTabFigure';
import { useState } from 'react';
import { formatEuroCents } from '@/lib/money';
import { toQueryErrorKind, toQueryErrorMessage } from '@/lib/query-error';
import { useNow } from '@/lib/use-now';
import { useBeerCratesBooking, useBeerCratesUndo } from '../api';
import { personNameOf } from '../beer-list-format';
import type { OpenBeerPot } from '../schemas';
import { BOOKING_ERROR_MESSAGES, bookedStamp, UNDO_ERROR_MESSAGES } from './booking-copy';
import { bookingPhaseOf } from './booking-gate';
import type { BeerBookedCrates, BeerBookingPending } from './booking-overlay';
import { NO_PENDING_BOOKING } from './booking-overlay';
import { UNDO_WINDOW_MS, undoRemainingMsOf } from './booking-window';

const TICK_MS = 200;
const NO_CRATE_IDS: readonly number[] = [];

export type BeerBookingCelebration = KkTabFigureRoll;

interface BeerBookingShared {
  ownerName: string | null;
  priceCents: number;
  failure: string | null;
  pending: BeerBookingPending;
  freshCrateIds: readonly number[];
  celebration: BeerBookingCelebration;
}

export interface BeerBookingChoosing extends BeerBookingShared {
  phase: 'choose';
  lapsed: BeerBookedCrates | null;
  count: number;
  isBooking: boolean;
  chooseCount: (count: number) => void;
  book: () => void;
}

export interface BeerBookingUndoing extends BeerBookingShared {
  phase: 'undo';
  lastCount: number;
  lastCents: number;
  remainingMs: number;
  isUndoing: boolean;
  undo: () => void;
}

export interface BeerBookingStockOut extends BeerBookingShared {
  phase: 'empty';
  lapsed: BeerBookedCrates | null;
}

export type BeerBooking = BeerBookingChoosing | BeerBookingUndoing | BeerBookingStockOut;

interface UndoDeadline {
  booked: BeerBookedCrates;
  endsAt: number;
}

export const useBeerBooking = (pot: OpenBeerPot | null): BeerBooking => {
  const booking = useBeerCratesBooking();
  const undoing = useBeerCratesUndo();
  const [count, setCount] = useState(1);
  const [pending, setPending] = useState<BeerBookingPending>(NO_PENDING_BOOKING);
  const [deadline, setDeadline] = useState<UndoDeadline | null>(null);
  const [spin, setSpin] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [isTicking, setIsTicking] = useState(false);
  const now = useNow(TICK_MS, isTicking).getTime();
  const priceCents = pot?.cratePriceCents ?? 0;
  const remainingMs = deadline === null ? 0 : undoRemainingMsOf(deadline.endsAt, now);
  const live = deadline !== null && (remainingMs > 0 || undoing.isPending) ? deadline : null;
  const phase = bookingPhaseOf(live !== null, pot);

  if (isTicking && live === null) {
    setIsTicking(false);
  }

  const book = (): void => {
    if (pot === null || booking.isPending) {
      return;
    }

    const sentAt = Date.now();

    undoing.reset();
    booking.mutate(count, {
      onSuccess: (result) => {
        const booked: BeerBookedCrates = {
          crateIds: result.crateIds,
          priceCents,
          bookedAt: new Date(sentAt).toISOString(),
        };

        setPending((current) => ({ booked, undoneIds: current.undoneIds }));
        setDeadline({ booked, endsAt: sentAt + UNDO_WINDOW_MS });
        setIsTicking(true);
        setSpin((value) => value + 1);
        setBurstKey((value) => value + 1);
      },
    });
  };

  const undo = (): void => {
    if (live === null || undoing.isPending) {
      return;
    }

    const { crateIds } = live.booked;

    booking.reset();
    undoing.mutate(crateIds, {
      onSuccess: () => {
        setPending((current) => ({
          ...current,
          undoneIds: [...current.undoneIds, ...crateIds],
        }));
        setDeadline(null);
        setSpin((value) => value + 1);
      },
      onError: (error) => {
        if (toQueryErrorKind(error) === 'rejected') {
          setDeadline(null);
        }
      },
    });
  };

  const shared: BeerBookingShared = {
    ownerName: pot === null ? null : personNameOf(pot.owner),
    priceCents,
    failure:
      toQueryErrorMessage(undoing.error, UNDO_ERROR_MESSAGES) ??
      toQueryErrorMessage(booking.error, BOOKING_ERROR_MESSAGES),
    pending,
    freshCrateIds: live?.booked.crateIds ?? NO_CRATE_IDS,
    celebration: { spin, burstKey, stamp: null },
  };

  const lapsed = deadline?.booked ?? null;

  if (phase === 'empty') {
    return { ...shared, phase, lapsed };
  }

  if (phase === 'choose' || live === null) {
    return {
      ...shared,
      phase: 'choose',
      lapsed,
      count,
      isBooking: booking.isPending,
      chooseCount: setCount,
      book,
    };
  }

  const lastCount = live.booked.crateIds.length;
  const lastCents = lastCount * live.booked.priceCents;

  return {
    ...shared,
    celebration: { spin, burstKey, stamp: bookedStamp(formatEuroCents(lastCents)) },
    phase: 'undo',
    lastCount,
    lastCents,
    remainingMs,
    isUndoing: undoing.isPending,
    undo,
  };
};
