import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import { useState } from 'react';
import { useEveningMutations } from '@/features/act-studio/evening-api';
import { castTilesOf } from '@/features/acts/act-cast';
import { dancerToggleOf } from '@/features/acts/act-evenings';
import { toShortName } from '@/features/acts/acts-copy';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import { GUEST_BADGE, toTileStateLabel } from '../season-b-copy';
import type { ColumnLine } from '../season-columns';

export interface SeasonLineCast {
  tiles: KkCastTile[];
  outNames: string[];
  inNames: string[];
  toggle: (personId: number) => void;
  isAdding: boolean;
  openAdding: () => void;
  closeAdding: () => void;
  addPerson: (person: PersonRef) => void;
  busy: boolean;
}

export const useSeasonLineCast = (
  line: ColumnLine,
  catalogueAct: CatalogueAct | null,
  eventId: number,
): SeasonLineCast => {
  const [isAdding, setIsAdding] = useState(false);
  const mutations = useEveningMutations(line.act.actId);
  const castTiles = castTilesOf(
    catalogueAct?.cast ?? [],
    {
      removedIds: line.appearance.removed.map((person) => person.personId),
      added: line.appearance.added,
    },
    true,
  );

  return {
    tiles: castTiles.map(({ person, state }) => ({
      id: person.personId,
      name: toShortName(person.firstName, person.lastName),
      initials: toInitials(person.firstName, person.lastName),
      portrait: toImageSource(person.portrait, 'portrait'),
      state,
      badge: state === 'guest' ? GUEST_BADGE : null,
      stateLabel: toTileStateLabel(state),
    })),
    outNames: line.appearance.removed.map((person) =>
      toShortName(person.firstName, person.lastName),
    ),
    inNames: line.appearance.added.map((person) => toShortName(person.firstName, person.lastName)),
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
    busy: mutations.dancer.isPending,
  };
};
