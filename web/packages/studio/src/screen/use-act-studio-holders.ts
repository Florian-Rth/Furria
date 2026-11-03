import type { DragEndEvent } from '@dnd-kit/react';
import {
  holderChipTextOf,
  holderMoveLabelOf,
  STUDIO_HOLDERS_FREE,
  spotDeskTitleOf,
} from '@furria/studio/studio-copy';
import type { DragNames } from '@furria/studio/studio-drag-copy';
import { studioDragPluginsOf } from '@furria/studio/studio-drag-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { SpotPerson } from '@furria/studio/studio-spots';
import { byNameOf, holderMovesOf, spotPersonOf } from '@furria/studio/studio-spots';

export const FREE_PLACE_ID = 'free';

export interface ActStudioHolder {
  personId: number;
  text: string;
  label: string;
}

export interface ActStudioHolderPlace {
  spotId: number;
  label: string;
  holder: ActStudioHolder | null;
}

export interface ActStudioHolders {
  places: ActStudioHolderPlace[];
  free: ActStudioHolder[];
  dragPlugins: ReturnType<typeof studioDragPluginsOf>;
  onDragEnd: (event: DragEndEvent) => void;
}

const holderOf = (person: SpotPerson): ActStudioHolder => ({
  personId: person.personId,
  text: holderChipTextOf(person.firstName, person.lastName),
  label: holderMoveLabelOf(person.firstName, person.lastName),
});

export const useActStudioHolders = (screen: StudioScreen): ActStudioHolders => {
  const { studio, cast, stageDocument } = screen;
  const spots = [...studio.spots].sort((left, right) => left.number - right.number);
  const holding = spots.flatMap((spot) => (spot.person === null ? [] : [spot.person]));
  const held = new Set(holding.map((person) => person.personId));
  const unheld = cast.filter((person) => !held.has(person.personId)).sort(byNameOf);
  const people = [...holding, ...unheld];
  const names: DragNames = {
    itemOf: (id) => {
      const person = people.find((candidate) => candidate.personId === id);

      return person === undefined
        ? String(id)
        : holderChipTextOf(person.firstName, person.lastName);
    },
    targetOf: (id) => {
      const spot = spots.find((candidate) => candidate.spotId === id);

      return spot === undefined ? STUDIO_HOLDERS_FREE : spotDeskTitleOf(spot.number);
    },
  };
  const move = (personId: number, toSpotId: number | null): void => {
    const person = people.find((candidate) => candidate.personId === personId);
    const moves = person === undefined ? [] : holderMovesOf(spots, person, toSpotId);
    if (moves.length === 0) {
      return;
    }
    stageDocument.startGesture();
    for (const { spotId, person: holder } of moves) {
      stageDocument.change({
        kind: 'spotAssign',
        spotId,
        person: holder === null ? null : spotPersonOf(holder),
      });
    }
    stageDocument.endGesture();
  };

  return {
    places: spots.map((spot) => ({
      spotId: spot.spotId,
      label: spotDeskTitleOf(spot.number),
      holder: spot.person === null ? null : holderOf(spot.person),
    })),
    free: unheld.map(holderOf),
    dragPlugins: studioDragPluginsOf(names),
    onDragEnd: (event) => {
      const personId = event.operation.source?.id;
      const target = event.operation.target?.id;
      if (event.canceled || typeof personId !== 'number') {
        return;
      }
      if (target === FREE_PLACE_ID) {
        move(personId, null);
      } else if (typeof target === 'number') {
        move(personId, target);
      }
    },
  };
};
