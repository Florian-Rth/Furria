import { useState } from 'react';
import { bookCrates, undoCrates } from '@/features/lab-beer/beer-lab-actions';
import { LAB_BEER_VIEWERS, labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import { firstNameOf, namesList, refusalText } from '../pour-copy';
import type { PourMember } from '../pour-member';
import { bookedCrateIdsOf, MAX_CRATES_PER_BOOKING, memberOf, openAfterOf } from '../pour-member';
import type { PourDay, PourFilter } from '../pour-stream';
import { streamOf } from '../pour-stream';
import { dayKeyOf } from '../pour-time';
import type { PourViewer } from '../schemas';
import type { PourPendingUndo } from './use-pour-undo';
import { usePourUndo } from './use-pour-undo';

export interface PourMemberList {
  world: LabBeerWorld;
  viewerId: number;
  member: PourMember;
  filter: PourFilter;
  chooseFilter: (filter: PourFilter) => void;
  days: readonly PourDay[];
  hiddenDays: number;
  showOlder: () => void;
  todayKey: string;
  count: number;
  chooseCount: (count: number) => void;
  openAfterCents: number;
  message: string | null;
  pending: PourPendingUndo | null;
  freshIds: ReadonlySet<number>;
  confettiKey: number;
  payOpen: boolean;
  openPay: () => void;
  closePay: () => void;
  book: () => void;
  undo: () => void;
}

const DAY_PAGE = 8;

export const operatorsTextOf = (world: LabBeerWorld): string =>
  namesList(world.operatorIds.map((id) => firstNameOf(labBeerPersonOf(id))));

export const usePourMemberList = (viewer: PourViewer): PourMemberList => {
  const lab = useLabBeerWorld();
  const undoControl = usePourUndo();
  const viewerId = LAB_BEER_VIEWERS[viewer];
  const [filter, setFilter] = useState<PourFilter>('all');
  const [chosenCount, setChosenCount] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [dayLimit, setDayLimit] = useState(DAY_PAGE);
  const [freshIds, setFreshIds] = useState<ReadonlySet<number>>(new Set());
  const member = memberOf(lab.world, viewerId);
  const allDays = streamOf(lab.world, viewerId, filter);
  const count = Math.max(1, Math.min(chosenCount, member.maxCount, MAX_CRATES_PER_BOOKING));

  const book = (): void => {
    const outcome = bookCrates(lab.world, viewerId, count, viewerId, lab.now());

    if (outcome.kind === 'refused') {
      setMessage(refusalText(outcome.refusal, operatorsTextOf(lab.world)));
      return;
    }

    const booked = bookedCrateIdsOf(lab.world, outcome.world);
    lab.apply(() => outcome);
    undoControl.start(booked);
    setFreshIds(new Set(booked));
    setConfettiKey(confettiKey + 1);
    setMessage(null);
  };

  const undo = (): void => {
    const pending = undoControl.pending;

    if (pending === null) {
      return;
    }

    const refusal = lab.apply((current, at) => undoCrates(current, pending.crateIds, viewerId, at));
    undoControl.clear();
    setMessage(refusal === null ? null : refusalText(refusal, operatorsTextOf(lab.world)));
  };

  return {
    world: lab.world,
    viewerId,
    member,
    filter,
    chooseFilter: setFilter,
    days: allDays.slice(0, dayLimit),
    hiddenDays: Math.max(0, allDays.length - dayLimit),
    showOlder: () => {
      setDayLimit(dayLimit + DAY_PAGE);
    },
    todayKey: dayKeyOf(lab.world.now),
    count,
    chooseCount: setChosenCount,
    openAfterCents: openAfterOf(member, count, lab.world.pot.priceCents),
    message,
    pending: undoControl.pending,
    freshIds,
    confettiKey,
    payOpen,
    openPay: () => {
      setPayOpen(true);
    },
    closePay: () => {
      setPayOpen(false);
    },
    book,
    undo,
  };
};
