import { partOfStep } from '@/features/act-player/music-timeline';
import { eightsOfMarks, keyedCellsOf } from '../count-sheet';
import { cardLabelOf, cardMetaOf, countLabelOf, stepLeadOf, stripEyebrowOf } from '../eights-copy';
import type { EightsStudio } from './use-eights-studio';

const COUNTS_PER_EIGHT = 8;

export interface EightsCardCount {
  key: string;
  index: number;
  column: number;
  count: number;
  seconds: number;
  label: string;
  keyed: boolean;
}

export interface EightsCard {
  key: string;
  label: string;
  eyebrow: string;
  number: string;
  name: string;
  meta: string;
  start: number;
  current: boolean;
  counts: EightsCardCount[];
}

export interface EightsReel {
  cards: EightsCard[];
  index: number;
  choose: (index: number) => void;
  seek: (seconds: number) => void;
}

export const useEightsReel = (eights: EightsStudio): EightsReel => {
  const { screen, editor } = eights;
  const { playback, practice } = screen;
  const { steps, parts, countMarks, paths, player } = playback;
  const eightsOf = eightsOfMarks(countMarks);
  const selected = new Set(editor.selected);
  const keyPaths = selected.size === 0 ? paths : paths.filter((path) => selected.has(path.spotId));
  const keyed = keyedCellsOf(
    countMarks,
    keyPaths.flatMap((path) => path.keyframes.map((keyframe) => keyframe.seconds)),
  );
  const index = Math.max(
    0,
    steps.findIndex((step) => step.stepId === practice.step?.stepId),
  );

  return {
    index,
    choose: (next) => {
      const step = steps[next];
      if (step !== undefined) {
        practice.jumpTo(step.stepId);
      }
    },
    seek: (seconds) => {
      player.seek(seconds);
    },
    cards: steps.map((step, position) => {
      const start = step.startSeconds ?? 0;
      const end = step.endSeconds ?? start;
      const counts = countMarks.flatMap((mark, markIndex) =>
        mark.seconds >= start - 1e-3 && mark.seconds < end - 1e-3
          ? [
              {
                key: String(markIndex),
                index: markIndex,
                column: mark.count - 1,
                count: mark.count,
                seconds: mark.seconds,
                label: countLabelOf((eightsOf[markIndex] ?? 0) + 1, mark.count, mark.seconds),
                keyed: keyed.has(markIndex),
              },
            ]
          : [],
      );
      return {
        key: String(step.stepId),
        label: cardLabelOf(position + 1, step.name),
        eyebrow: stripEyebrowOf(partOfStep(parts, step.stepId)?.name ?? null),
        number: stepLeadOf(position + 1),
        name: step.name,
        meta: cardMetaOf(Math.round(counts.length / COUNTS_PER_EIGHT), start, end),
        start,
        current: position === index,
        counts,
      };
    }),
  };
};
