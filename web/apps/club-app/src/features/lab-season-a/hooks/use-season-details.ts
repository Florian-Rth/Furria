import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import { useState } from 'react';
import { useEveningMutations } from '@/features/act-studio/evening-api';
import { dancerToggleOf } from '@/features/acts/act-evenings';
import { toShortName } from '@/features/acts/acts-copy';
import type { ReadinessCheck } from '@/features/season/schemas';
import type { SeasonCell } from '@/features/season/season-grid';
import { cellOf, readinessOf } from '@/features/season/season-grid';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import {
  GUEST_BADGE,
  GUEST_TILE,
  IN_TILE,
  OPEN_LINE,
  OUT_TILE,
  READY_LINE,
  toCastSummary,
  toCellState,
  toPaneMeta,
  toReadinessLabel,
  toReadinessText,
} from '../season-a-copy';
import { eveningCastOf } from '../season-raster';
import type { SeasonPick } from './use-season-a';

export interface ReadinessLine {
  check: ReadinessCheck;
  title: string;
  trailing: string;
  level: 'ok' | 'attention';
}

export interface SeasonDetails {
  title: string;
  meta: string;
  cell: SeasonCell;
  stateText: string;
  onEvening: boolean;
  readinessText: string;
  readiness: ReadinessLine[];
  castSummary: string;
  tiles: KkCastTile[];
  toggleDancer: (personId: number) => void;
  adding: boolean;
  openAdding: () => void;
  closeAdding: () => void;
  addPerson: (person: PersonRef) => void;
  busy: boolean;
}

const TILE_STATES = { in: IN_TILE, out: OUT_TILE, guest: GUEST_TILE, person: IN_TILE } as const;

export const useSeasonDetails = ({ act, evening, catalogue }: SeasonPick): SeasonDetails => {
  const [adding, setAdding] = useState(false);
  const mutations = useEveningMutations(act.actId);
  const cell = cellOf(act, evening.eventId);
  const cast = eveningCastOf(catalogue?.cast ?? [], cell.appearance);
  const readiness = readinessOf(act);

  return {
    title: act.name,
    meta: toPaneMeta(evening.title, evening.startsAt),
    cell,
    stateText: toCellState(cell),
    onEvening: cell.state !== 'none',
    readinessText: toReadinessText(readiness),
    readiness: act.readiness.map(({ check, done }) => ({
      check,
      title: toReadinessLabel(check),
      trailing: done ? READY_LINE : OPEN_LINE,
      level: done ? 'ok' : 'attention',
    })),
    castSummary: toCastSummary(cast.out, cast.standIns),
    tiles: cast.tiles.map(({ person, state }) => ({
      id: person.personId,
      name: toShortName(person.firstName, person.lastName),
      initials: toInitials(person.firstName, person.lastName),
      portrait: toImageSource(person.portrait, 'portrait'),
      state,
      badge: state === 'guest' ? GUEST_BADGE : null,
      stateLabel: TILE_STATES[state],
    })),
    toggleDancer: (personId) => {
      const tile = cast.tiles.find((candidate) => candidate.person.personId === personId);
      if (tile !== undefined) {
        mutations.dancer.mutate({ eventId: evening.eventId, ...dancerToggleOf(tile) });
      }
    },
    adding,
    openAdding: () => {
      setAdding(true);
    },
    closeAdding: () => {
      setAdding(false);
    },
    addPerson: (person) => {
      mutations.dancer.mutate({
        eventId: evening.eventId,
        person: { ...person, portrait: null },
        dances: true,
      });
    },
    busy: mutations.dancer.isPending,
  };
};
