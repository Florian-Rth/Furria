import { useState } from 'react';
import { castChoiceTextOf, spotDeskTitleOf } from '../studio-copy';
import type { ActStudioStage } from './use-act-studio-stage';
import type { StudioScreen } from './use-studio-screen';

export interface SpotDeskChoice {
  key: string;
  text: string;
  current: boolean;
  press: () => void;
}

export interface SpotDesk {
  title: string;
  choices: SpotDeskChoice[];
  open: boolean;
  free: () => void;
  removing: boolean;
  remove: () => void;
}

export const useActStudioSpotDesk = (
  screen: StudioScreen,
  editor: ActStudioStage,
): SpotDesk | null => {
  const { studio, cast, stageWrites } = screen;
  const [removingId, setRemovingId] = useState<number | null>(null);
  const spotId = editor.selected.length === 1 ? (editor.selected[0] ?? null) : null;
  const spot = studio.spots.find((candidate) => candidate.spotId === spotId) ?? null;
  if (removingId !== null && removingId !== spotId) {
    setRemovingId(null);
  }

  if (spot === null) {
    return null;
  }

  const spotNumberOf = (personId: number): number | null =>
    studio.spots.find((candidate) => candidate.person?.personId === personId)?.number ?? null;

  return {
    title: spotDeskTitleOf(spot.number),
    choices: [...cast]
      .sort(
        (left, right) =>
          left.firstName.localeCompare(right.firstName) ||
          left.lastName.localeCompare(right.lastName),
      )
      .map((person) => {
        const number = spotNumberOf(person.personId);

        return {
          key: String(person.personId),
          text: castChoiceTextOf(
            person.firstName,
            person.lastName,
            number === spot.number ? null : number,
          ),
          current: spot.person?.personId === person.personId,
          press: () => {
            stageWrites.assign.mutate({
              spotId: spot.spotId,
              person: {
                personId: person.personId,
                firstName: person.firstName,
                lastName: person.lastName,
                portrait: person.portrait,
              },
            });
          },
        };
      }),
    open: spot.person === null,
    free: () => {
      stageWrites.assign.mutate({ spotId: spot.spotId, person: null });
    },
    removing: removingId === spot.spotId,
    remove: () => {
      if (removingId !== spot.spotId) {
        setRemovingId(spot.spotId);
        return;
      }
      setRemovingId(null);
      editor.forget(spot.spotId);
      stageWrites.removeSpot.mutate(spot.spotId);
    },
  };
};
