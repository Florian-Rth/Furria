import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import { useState } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import { bookCrates, enroll, undoCrates } from '@/features/lab-beer/beer-lab-actions';
import { LAB_BEER_VIEWERS, labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { giversOf, stockOf, tabOf } from '@/features/lab-beer/beer-lab-ledger';
import type {
  LabBeerGiver,
  LabBeerPerson,
  LabBeerPot,
  LabBeerTab,
  LabBeerWorld,
} from '@/features/lab-beer/beer-lab-types';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import type { BeerABookingState, BeerACountChoice, BeerAMemberStanding } from '../beer-a-access';
import {
  bookedIdsOf,
  bookingStateOf,
  countChoicesOf,
  emptiedWorldOf,
  fittingCountOf,
  standingOf,
} from '../beer-a-access';
import { tabStrokesOf } from '../beer-a-tab';
import type { BeerAMemberViewer } from '../schemas';
import type { BeerAUndoWindow } from './use-undo-window';
import { useUndoWindow } from './use-undo-window';

export type BeerABookingPhase = 'idle' | 'undo' | 'done';

export interface BeerAGiverLine {
  giver: LabBeerGiver;
  person: LabBeerPerson | null;
  own: boolean;
}

export interface BeerAMember {
  now: string;
  me: LabBeerPerson | null;
  owner: LabBeerPerson | null;
  pot: LabBeerPot;
  tab: LabBeerTab;
  strokes: readonly KkTabStrokeState[];
  standing: BeerAMemberStanding;
  bookingState: BeerABookingState;
  stock: number;
  count: number;
  countChoices: readonly BeerACountChoice[];
  phase: BeerABookingPhase;
  lastCount: number;
  drawKey: number;
  undo: BeerAUndoWindow;
  refusal: LabBeerRefusal | null;
  givers: readonly BeerAGiverLine[];
  chooseCount: (count: number) => void;
  book: () => void;
  undoBooking: () => void;
  bookAgain: () => void;
  join: () => void;
}

export const useBeerMemberA = (viewer: BeerAMemberViewer, emptyStock: boolean): BeerAMember => {
  const lab = useLabBeerWorld();
  const [emptiedAt] = useState(() => lab.now());
  const [chosenCount, setChosenCount] = useState(1);
  const [phase, setPhase] = useState<BeerABookingPhase>('idle');
  const [lastCount, setLastCount] = useState(0);
  const [drawKey, setDrawKey] = useState(0);
  const [refusal, setRefusal] = useState<LabBeerRefusal | null>(null);
  const lapse = (): void => {
    setPhase('done');
  };
  const undo = useUndoWindow(lapse);

  const prepared = (world: LabBeerWorld): LabBeerWorld =>
    emptyStock ? emptiedWorldOf(world, emptiedAt) : world;
  const world = prepared(lab.world);
  const personId = LAB_BEER_VIEWERS[viewer];
  const now = world.now;
  const tab = tabOf(personId, world.crates, world.payments);
  const stock = stockOf(world.movements, world.crates);
  const count = fittingCountOf(chosenCount, stock);
  const freshIds = undo.entry?.crateIds ?? [];

  const book = (): void => {
    const crateIds = bookedIdsOf(world, count);
    const refused = lab.apply((current, at) =>
      bookCrates(prepared(current), personId, count, personId, at),
    );

    setRefusal(refused);

    if (refused === null) {
      setLastCount(count);
      setDrawKey((key) => key + 1);
      setPhase('undo');
      undo.open(crateIds);
    }
  };

  const undoBooking = (): void => {
    const crateIds = undo.entry?.crateIds ?? [];
    const refused = lab.apply((current, at) => undoCrates(current, crateIds, personId, at));

    setRefusal(refused);
    undo.close();
    setPhase('idle');
  };

  const bookAgain = (): void => {
    setPhase('idle');
  };

  const join = (): void => {
    setRefusal(lab.apply((current, at) => enroll(current, personId, at)));
  };

  const givers = giversOf(world.crates).map((giver) => ({
    giver,
    person: labBeerPersonOf(giver.personId),
    own: giver.personId === personId,
  }));

  return {
    now,
    me: labBeerPersonOf(personId),
    owner: labBeerPersonOf(world.pot.ownerId),
    pot: world.pot,
    tab,
    strokes: tabStrokesOf(tab, now, freshIds),
    standing: standingOf(world, personId),
    bookingState: bookingStateOf(world, personId),
    stock,
    count,
    countChoices: countChoicesOf(stock),
    phase,
    lastCount,
    drawKey,
    undo,
    refusal,
    givers,
    chooseCount: setChosenCount,
    book,
    undoBooking,
    bookAgain,
    join,
  };
};
