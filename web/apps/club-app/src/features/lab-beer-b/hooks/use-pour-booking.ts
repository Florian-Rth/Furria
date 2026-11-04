import { useState } from 'react';
import { bookCrates, undoCrates } from '@/features/lab-beer/beer-lab-actions';
import { LAB_BEER_VIEWERS } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import { refusalText } from '../pour-copy';
import type { PourBookingStage, PourMember } from '../pour-member';
import {
  bookedCrateIdsOf,
  bookingStageOf,
  enrollAndBook,
  memberOf,
  openAfterOf,
  withEmptyStock,
} from '../pour-member';
import type { PourViewer } from '../schemas';
import { operatorsTextOf } from './use-pour-member-list';
import type { PourPendingUndo } from './use-pour-undo';
import { usePourUndo } from './use-pour-undo';

export type PourBookingPhase = 'pick' | 'booked' | 'done';

export interface PourBooking {
  world: LabBeerWorld;
  viewerId: number;
  member: PourMember;
  stage: PourBookingStage;
  phase: PourBookingPhase;
  count: number;
  chooseCount: (count: number) => void;
  bookedCount: number;
  openAfterCents: number;
  message: string | null;
  pending: PourPendingUndo | null;
  confettiKey: number;
  book: () => void;
  undo: () => void;
  again: () => void;
}

const phaseOf = (undoable: boolean, bookedCount: number): PourBookingPhase => {
  if (undoable) {
    return 'booked';
  }

  return bookedCount > 0 ? 'done' : 'pick';
};

export const usePourBooking = (viewerKey: PourViewer, empty: boolean): PourBooking => {
  const lab = useLabBeerWorld();
  const undoControl = usePourUndo();
  const viewerId = LAB_BEER_VIEWERS[viewerKey];
  const [chosenCount, setChosenCount] = useState(1);
  const [bookedCount, setBookedCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const world = empty ? withEmptyStock(lab.world) : lab.world;
  const member = memberOf(world, viewerId);
  const stage = bookingStageOf(member);
  const count = Math.max(1, Math.min(chosenCount, member.maxCount));
  const phase = phaseOf(undoControl.pending !== null, bookedCount);

  const book = (): void => {
    const at = lab.now();
    const outcome =
      stage === 'declare'
        ? enrollAndBook(world, viewerId, count, at)
        : bookCrates(world, viewerId, count, viewerId, at);

    if (outcome.kind === 'refused') {
      setMessage(refusalText(outcome.refusal, operatorsTextOf(world)));
      return;
    }

    const booked = bookedCrateIdsOf(world, outcome.world);
    lab.apply(() => outcome);
    undoControl.start(booked);
    setBookedCount(booked.length);
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
    setBookedCount(0);
    setMessage(refusal === null ? null : refusalText(refusal, operatorsTextOf(world)));
  };

  return {
    world,
    viewerId,
    member,
    stage,
    phase,
    count,
    chooseCount: setChosenCount,
    bookedCount,
    openAfterCents: openAfterOf(member, count, world.pot.priceCents),
    message,
    pending: undoControl.pending,
    confettiKey,
    book,
    undo,
    again: () => {
      setBookedCount(0);
    },
  };
};
