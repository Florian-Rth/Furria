import { useEffect, useState } from 'react';
import { bookCrates, enroll, undoCrates } from '@/features/lab-beer/beer-lab-actions';
import { euroOf, stockOf, tabOf, UNDO_WINDOW_MS } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import type { BookingStance } from '../ledger-booking';
import {
  bookedIdsOf,
  bookingPreviewOf,
  bookingStanceOf,
  clampCount,
  countLimitOf,
  secondsLeftOf,
} from '../ledger-booking';
import { REFUSALS } from '../ledger-copy';
import { timeOf } from '../ledger-format';

const TICK_MS = 250;

type BookingPhase = 'idle' | 'undo' | 'done';

interface LastBooking {
  ids: readonly number[];
  at: string;
  count: number;
  sumCents: number;
  afterCents: number;
}

export interface LedgerUndo {
  count: number;
  sum: string;
  after: string;
  seconds: number;
  startKey: number;
}

export interface LedgerDone {
  count: number;
  sum: string;
  after: string;
  time: string;
}

export interface LedgerBooking {
  tab: LabBeerTab;
  stance: BookingStance;
  count: number;
  limit: number;
  price: string;
  sum: string;
  open: string;
  after: string;
  spin: number;
  stamp: string | null;
  undo: LedgerUndo | null;
  done: LedgerDone | null;
  freshIds: readonly number[];
  refusal: string | null;
  setCount: (count: number) => void;
  book: () => boolean;
  undoBooking: () => void;
  join: () => void;
  again: () => void;
}

export const useLedgerBooking = (beer: LabBeerWorldState, personId: number): LedgerBooking => {
  const { world } = beer;
  const [wanted, setWanted] = useState(1);
  const [phase, setPhase] = useState<BookingPhase>('idle');
  const [last, setLast] = useState<LastBooking | null>(null);
  const [nowIso, setNowIso] = useState(world.now);
  const [spin, setSpin] = useState(0);
  const [refusal, setRefusal] = useState<string | null>(null);
  const tab = tabOf(personId, world.crates, world.payments);
  const limit = countLimitOf(stockOf(world.movements, world.crates));
  const count = clampCount(wanted, limit);
  const preview = bookingPreviewOf(world.pot.priceCents, count, tab.openCents);
  const lastAt = last?.at ?? null;
  const ticking = phase === 'undo' && lastAt !== null;

  useEffect(() => {
    if (!ticking || lastAt === null) {
      return;
    }

    const timer = window.setInterval(() => {
      const current = beer.now();

      setNowIso(current);

      if (secondsLeftOf(lastAt, current, UNDO_WINDOW_MS) === 0) {
        setPhase('done');
      }
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [ticking, lastAt, beer]);

  const book = (): boolean => {
    const ids = bookedIdsOf(world, count);
    const at = beer.now();
    const refused = beer.apply((current, when) =>
      bookCrates(current, personId, count, personId, when),
    );

    if (refused !== null) {
      setRefusal(REFUSALS[refused] ?? null);

      return false;
    }

    setRefusal(null);
    setLast({ ids, at, count, sumCents: preview.sumCents, afterCents: preview.afterCents });
    setNowIso(at);
    setPhase('undo');
    setSpin((value) => value + 1);

    return true;
  };

  const undoBooking = (): void => {
    if (last === null) {
      return;
    }

    const refused = beer.apply((current, when) => undoCrates(current, last.ids, personId, when));

    if (refused !== null) {
      setRefusal(REFUSALS[refused] ?? null);
      setPhase('done');

      return;
    }

    setRefusal(null);
    setLast(null);
    setPhase('idle');
    setSpin((value) => value + 1);
  };

  const join = (): void => {
    beer.apply((current, when) => enroll(current, personId, when));
  };

  const again = (): void => {
    setPhase('idle');
    setLast(null);
  };

  const undo: LedgerUndo | null =
    phase === 'undo' && last !== null
      ? {
          count: last.count,
          sum: euroOf(last.sumCents),
          after: euroOf(last.afterCents),
          seconds: secondsLeftOf(last.at, nowIso, UNDO_WINDOW_MS),
          startKey: spin,
        }
      : null;
  const done: LedgerDone | null =
    phase === 'done' && last !== null
      ? {
          count: last.count,
          sum: euroOf(last.sumCents),
          after: euroOf(last.afterCents),
          time: timeOf(last.at),
        }
      : null;
  const stamp = last === null || phase !== 'undo' ? null : `+${euroOf(last.sumCents)}`;

  return {
    tab,
    stance: bookingStanceOf(world, personId),
    count,
    limit,
    price: euroOf(world.pot.priceCents),
    sum: euroOf(preview.sumCents),
    open: euroOf(tab.openCents),
    after: euroOf(preview.afterCents),
    spin,
    stamp,
    undo,
    done,
    freshIds: phase === 'idle' || last === null ? [] : last.ids,
    refusal,
    setCount: setWanted,
    book,
    undoBooking,
    join,
    again,
  };
};
