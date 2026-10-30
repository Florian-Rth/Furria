import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import type { KkStepState } from '@furria/ui/step-state';
import { useState } from 'react';
import type { EveningMutations } from '@/features/act-studio/evening-api';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import type { EveningEntryState } from '../act-evenings';
import { dancerToggleOf, eveningEntryOf, eveningTilesOf } from '../act-evenings';
import {
  EVENING_FORMATION_RESET,
  EVENING_FORMATION_RESET_SURE,
  EVENING_LEAVE,
  EVENING_LEAVE_SURE,
  toEveningChangesLine,
  toEveningDay,
  toEveningLabel,
  toEveningMeta,
  toEveningStateLine,
  toFormationLine,
} from '../act-evenings-copy';
import { GUEST_BADGE, toShortName, toTileStateLabel } from '../acts-copy';
import type { ActStudioResponse, Studio, StudioEvening } from '../schemas';
import type { ActPageState } from './use-act-page';

type Confirming = 'reset' | 'leave' | null;

const STEP_STATES: Record<EveningEntryState, KkStepState> = {
  open: 'open',
  joined: 'waiting',
  placed: 'done',
};

export interface ActEveningPaneState {
  label: string;
  title: string;
  day: string;
  state: KkStepState;
  stateLabel: string;
  meta: string;
  changesLine: string | null;
  tiles: KkCastTile[];
  toggle: (personId: number) => void;
  isAdding: boolean;
  openAdding: () => void;
  closeAdding: () => void;
  addPerson: (person: PersonRef) => void;
  formationLine: string;
  hasCopy: boolean;
  resetText: string;
  reset: () => void;
  editFormation: () => void;
  practise: () => void;
  joined: boolean;
  join: () => void;
  placed: boolean;
  leaveText: string;
  leave: () => void;
  busy: boolean;
}

export const useActEveningPane = (
  page: ActPageState,
  data: ActStudioResponse,
  studio: Studio,
  evening: StudioEvening,
  mutations: EveningMutations,
): ActEveningPaneState => {
  const [isAdding, setIsAdding] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const entry = eveningEntryOf(evening, studio.choreography);
  const castTiles = eveningTilesOf(data.act.cast, evening);
  const eventId = evening.eventId;
  const busy =
    mutations.dancer.isPending ||
    mutations.dropCopy.isPending ||
    mutations.leave.isPending ||
    mutations.join.isPending;

  const confirm = (step: Exclude<Confirming, null>, act: () => void): void => {
    if (confirming !== step) {
      setConfirming(step);
      return;
    }
    setConfirming(null);
    act();
  };

  return {
    label: toEveningLabel(evening),
    title: evening.title,
    day: toEveningDay(evening.startsAt),
    state: STEP_STATES[entry.state],
    stateLabel: toEveningStateLine(entry.state),
    meta: toEveningMeta(evening, entry.state),
    changesLine: toEveningChangesLine(entry.changes),
    tiles: castTiles.map(({ person, state }) => ({
      id: person.personId,
      name: toShortName(person.firstName, person.lastName),
      initials: toInitials(person.firstName, person.lastName),
      portrait: toImageSource(person.portrait, 'portrait'),
      state,
      badge: state === 'guest' ? GUEST_BADGE : null,
      stateLabel: toTileStateLabel(state),
    })),
    toggle: (personId) => {
      const tile = castTiles.find((candidate) => candidate.person.personId === personId);
      if (tile !== undefined) {
        mutations.dancer.mutate({ eventId, ...dancerToggleOf(tile) });
      }
    },
    isAdding,
    openAdding: () => {
      setIsAdding(true);
    },
    closeAdding: () => {
      setIsAdding(false);
    },
    addPerson: (person) => {
      mutations.dancer.mutate({ eventId, person: { ...person, portrait: null }, dances: true });
    },
    formationLine: toFormationLine(entry.choreography),
    hasCopy: entry.choreography !== 'session',
    resetText: confirming === 'reset' ? EVENING_FORMATION_RESET_SURE : EVENING_FORMATION_RESET,
    reset: () => {
      confirm('reset', () => {
        mutations.dropCopy.mutate(eventId);
      });
    },
    editFormation: () => {
      page.practiseEvening(eventId, true);
    },
    practise: () => {
      page.practiseEvening(eventId, false);
    },
    joined: entry.state !== 'open',
    join: () => {
      mutations.join.mutate(eventId);
    },
    placed: entry.state === 'placed',
    leaveText: confirming === 'leave' ? EVENING_LEAVE_SURE : EVENING_LEAVE,
    leave: () => {
      confirm('leave', () => {
        mutations.leave.mutate(eventId);
        page.closeEvening();
      });
    },
    busy,
  };
};
