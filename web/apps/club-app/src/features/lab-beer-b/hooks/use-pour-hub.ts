import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { useState } from 'react';
import type { LabBeerOutcome } from '@/features/lab-beer/beer-lab-actions';
import {
  bookCorrection,
  bookCrates,
  bookDelivery,
  bookPayment,
  endEnrollment,
} from '@/features/lab-beer/beer-lab-actions';
import { LAB_BEER_VIEWERS } from '@/features/lab-beer/beer-lab-fixture';
import type { LabBeerCorrectionReason, LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { useLabBeerWorld } from '@/features/lab-beer/use-lab-beer-world';
import { refusalText } from '../pour-copy';
import type { PourFocus, PourHubSummary, PourPotSettings, PourRosterRow } from '../pour-hub';
import { hubSummaryOf, rosterInFocus, rosterOf, withPotSettings } from '../pour-hub';
import type { PourJournalDay, PourKindFilter } from '../pour-journal';
import { filteredJournalOf, journalDaysOf, journalOf } from '../pour-journal';
import { dayKeyOf } from '../pour-time';
import type { PourViewer } from '../schemas';
import { operatorsTextOf } from './use-pour-member-list';

export type PourFormKind = 'payment' | 'crate' | 'delivery' | 'correction';

export type PourNoticeKind = 'payment' | 'crate' | 'delivery' | 'correction' | 'ended' | 'settings';

export interface PourNotice {
  kind: PourNoticeKind;
  personId: number | null;
  count: number;
}

export type PourSettingsTab = 'settings' | 'code' | 'handover';

export type PourSide =
  | { kind: 'person'; personId: number }
  | { kind: 'form'; form: PourFormKind; personId: number | null }
  | { kind: 'settings'; tab: PourSettingsTab };

export interface PourHub {
  world: LabBeerWorld;
  actorId: number;
  isWide: boolean;
  summary: PourHubSummary;
  roster: readonly PourRosterRow[];
  focusRoster: readonly PourRosterRow[];
  focus: PourFocus;
  chooseFocus: (focus: PourFocus) => void;
  kind: PourKindFilter;
  chooseKind: (kind: PourKindFilter) => void;
  personFilter: number | null;
  choosePerson: (personId: number | null) => void;
  filterPerson: (personId: number) => void;
  days: readonly PourJournalDay[];
  shownCount: number;
  todayKey: string;
  side: PourSide | null;
  openSide: (side: PourSide) => void;
  closeSide: () => void;
  notice: PourNotice | null;
  refusal: string | null;
  payment: (personId: number, crateCount: number) => boolean;
  crate: (personId: number, count: number) => boolean;
  delivery: (count: number) => boolean;
  correction: (delta: number, reason: LabBeerCorrectionReason) => boolean;
  endFor: (personId: number) => boolean;
  saveSettings: (settings: PourPotSettings) => boolean;
}

export const usePourHub = (viewer: PourViewer): PourHub => {
  const lab = useLabBeerWorld();
  const isWide = useIsWideScreen();
  const actorId = LAB_BEER_VIEWERS[viewer];
  const [focus, setFocus] = useState<PourFocus>('all');
  const [kind, setKind] = useState<PourKindFilter>('all');
  const [personFilter, setPersonFilter] = useState<number | null>(null);
  const [side, setSide] = useState<PourSide | null>(null);
  const [notice, setNotice] = useState<PourNotice | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const roster = rosterOf(lab.world);
  const focusRoster = rosterInFocus(roster, focus);
  const journal = journalOf(lab.world);
  const shown = filteredJournalOf(journal, {
    kind,
    personId: personFilter,
    focus,
    focusPersonIds: new Set(focusRoster.map((row) => row.personId)),
  });

  const run = (
    change: (world: LabBeerWorld, at: string) => LabBeerOutcome,
    done: PourNotice,
  ): boolean => {
    const refused = lab.apply(change);

    if (refused !== null) {
      setRefusal(refusalText(refused, operatorsTextOf(lab.world)));
      return false;
    }

    setRefusal(null);
    setNotice(done);
    return true;
  };

  return {
    world: lab.world,
    actorId,
    isWide,
    summary: hubSummaryOf(lab.world),
    roster,
    focusRoster,
    focus,
    chooseFocus: (next) => {
      setFocus(next === focus ? 'all' : next);
    },
    kind,
    chooseKind: setKind,
    personFilter,
    choosePerson: setPersonFilter,
    filterPerson: (personId) => {
      setPersonFilter(personId);

      if (!isWide) {
        setSide(null);
      }
    },
    days: journalDaysOf(shown),
    shownCount: shown.length,
    todayKey: dayKeyOf(lab.world.now),
    side,
    openSide: (next) => {
      setRefusal(null);
      setSide(next);
    },
    closeSide: () => {
      setRefusal(null);
      setSide(null);
    },
    notice,
    refusal,
    payment: (personId, crateCount) =>
      run((world, at) => bookPayment(world, personId, crateCount, actorId, at), {
        kind: 'payment',
        personId,
        count: crateCount,
      }),
    crate: (personId, count) =>
      run((world, at) => bookCrates(world, personId, count, actorId, at), {
        kind: 'crate',
        personId,
        count,
      }),
    delivery: (count) =>
      run((world, at) => bookDelivery(world, count, actorId, at), {
        kind: 'delivery',
        personId: null,
        count,
      }),
    correction: (delta, reason) =>
      run((world, at) => bookCorrection(world, delta, reason, actorId, at), {
        kind: 'correction',
        personId: null,
        count: delta,
      }),
    endFor: (personId) =>
      run((world, at) => endEnrollment(world, personId, actorId, at), {
        kind: 'ended',
        personId,
        count: 0,
      }),
    saveSettings: (settings) =>
      run((world) => ({ kind: 'done', world: withPotSettings(world, settings) }), {
        kind: 'settings',
        personId: null,
        count: 0,
      }),
  };
};
