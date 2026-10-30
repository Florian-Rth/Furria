import type { KkFocusCardsEight } from '@furria/ui/KkFocusCards';
import { shownStepNameOf } from '@/features/act-player/step-names';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { cardMetaOf, countLabelOf, eightTextOf, stepLabelOf } from '../focus-copy';
import type { CountCell } from '../focus-counts';
import { countCellsOf, countEightsOf } from '../focus-counts';

export interface FocusCard {
  key: string;
  number: number;
  name: string;
  label: string;
  meta: string;
  current: boolean;
  cells: CountCell[];
  eights: KkFocusCardsEight[];
  seek: (index: number) => void;
}

export interface FocusCards {
  index: number;
  cards: FocusCard[];
}

export const useFocusCards = (screen: StudioScreen): FocusCards => {
  const { playback, practice } = screen;
  const { steps, countMarks, player } = playback;
  const index = Math.max(
    0,
    steps.findIndex((step) => step.stepId === practice.step?.stepId),
  );

  return {
    index,
    cards: steps.map((step, position) => {
      const cells = countCellsOf(countMarks, {
        start: step.startSeconds ?? 0,
        end: step.endSeconds ?? 0,
      });
      const eights = countEightsOf(cells);
      const number = position + 1;

      return {
        key: String(step.stepId),
        number,
        name: shownStepNameOf(step.name, number),
        label: stepLabelOf(number, step.name),
        meta: cardMetaOf(number, steps.length, eights.length),
        current: position === index,
        cells,
        eights: eights.map((eight) => ({
          key: eight.key,
          text: eightTextOf(eight.number),
          counts: eight.cells.map((cell) => ({
            key: cell.key,
            index: cell.index,
            count: cell.count,
            label: countLabelOf(eight.number, cell.count),
          })),
        })),
        seek: (cellIndex) => {
          const target = cells[cellIndex];
          if (target !== undefined) {
            player.seek(target.seconds);
          }
        },
      };
    }),
  };
};
