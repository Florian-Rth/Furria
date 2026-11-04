import { useIsMediumScreen } from '@furria/ui/use-is-medium-screen';
import { useState } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import {
  bookCorrection,
  bookCrates,
  bookDelivery,
  bookPayment,
  endEnrollment,
  undoCrates,
} from '@/features/lab-beer/beer-lab-actions';
import { LAB_BEER_VIEWERS } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerCorrectionReason, LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import type { BeerAPotDraft } from '../beer-a-access';
import { bookedIdsOf, withPotSettings } from '../beer-a-access';
import type { BeerAQueueFilter } from '../beer-a-queue';
import type { BeerAHubViewer } from '../schemas';

export type BeerAPaneKind = 'stock' | 'enrollments' | 'crateFor' | 'settings' | 'handover';

export type BeerASelection = { kind: 'payment'; personId: number } | { kind: BeerAPaneKind };

const PANE_KINDS: readonly BeerAPaneKind[] = [
  'stock',
  'enrollments',
  'crateFor',
  'settings',
  'handover',
];

const DEFAULT_WIDE_SELECTION: BeerASelection = { kind: 'stock' };

export interface BeerAHubActions {
  pay: (personId: number, count: number) => LabBeerRefusal | null;
  deliver: (count: number) => LabBeerRefusal | null;
  correct: (count: number, reason: LabBeerCorrectionReason) => LabBeerRefusal | null;
  end: (personId: number) => LabBeerRefusal | null;
  bookFor: (personId: number, count: number) => readonly number[] | LabBeerRefusal;
  undo: (crateIds: readonly number[]) => LabBeerRefusal | null;
  saveSettings: (draft: BeerAPotDraft) => LabBeerRefusal | null;
}

export interface BeerAHub {
  world: LabBeerWorld;
  now: string;
  operatorId: number;
  isWide: boolean;
  filter: BeerAQueueFilter;
  selection: BeerASelection | null;
  chooseFilter: (filter: string) => void;
  select: (selection: BeerASelection) => void;
  openPane: (id: string) => void;
  close: () => void;
  actions: BeerAHubActions;
}

export const useBeerHubA = (viewer: BeerAHubViewer): BeerAHub => {
  const lab = useLabBeerWorld();
  const isWide = useIsMediumScreen();
  const [filter, setFilter] = useState<BeerAQueueFilter>('open');
  const [chosen, setChosen] = useState<BeerASelection | null>(null);
  const operatorId = LAB_BEER_VIEWERS[viewer];
  const selection = chosen ?? (isWide ? DEFAULT_WIDE_SELECTION : null);

  const chooseFilter = (next: string): void => {
    setFilter(next === 'overdue' ? 'overdue' : 'open');
  };

  const openPane = (id: string): void => {
    const kind = PANE_KINDS.find((known) => known === id);

    if (kind !== undefined) {
      setChosen({ kind });
    }
  };

  const close = (): void => {
    setChosen(null);
  };

  const pay = (personId: number, count: number): LabBeerRefusal | null => {
    const refused = lab.apply((world, at) => bookPayment(world, personId, count, operatorId, at));

    if (refused === null) {
      setChosen(null);
    }

    return refused;
  };

  const bookFor = (personId: number, count: number): readonly number[] | LabBeerRefusal => {
    const crateIds = bookedIdsOf(lab.world, count);
    const refused = lab.apply((world, at) => bookCrates(world, personId, count, operatorId, at));

    return refused ?? crateIds;
  };

  const actions: BeerAHubActions = {
    pay,
    deliver: (count) => lab.apply((world, at) => bookDelivery(world, count, operatorId, at)),
    correct: (count, reason) =>
      lab.apply((world, at) => bookCorrection(world, count, reason, operatorId, at)),
    end: (personId) => lab.apply((world, at) => endEnrollment(world, personId, operatorId, at)),
    bookFor,
    undo: (crateIds) => lab.apply((world, at) => undoCrates(world, crateIds, operatorId, at)),
    saveSettings: (draft) => lab.apply((world) => withPotSettings(world, draft)),
  };

  return {
    world: lab.world,
    now: lab.world.now,
    operatorId,
    isWide,
    filter,
    selection,
    chooseFilter,
    select: setChosen,
    openPane,
    close,
    actions,
  };
};
