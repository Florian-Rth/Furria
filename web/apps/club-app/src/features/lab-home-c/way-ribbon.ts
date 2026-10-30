import type { CountMark } from '@/features/act-player/music-timeline';
import { shownStepNameOf, stepNumberOf } from '@/features/act-player/step-names';
import { segmentGroupsOf } from '@/features/act-practice/practice-controls';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';

const COUNTS_PER_EIGHT = 8;
const SECONDS_PER_EIGHT_WITHOUT_COUNTS = 4;

export interface RibbonTile {
  stepId: number;
  number: number;
  name: string;
  eights: number;
  step: StudioStep;
}

export interface RibbonGroup {
  key: string;
  partName: string | null;
  firstStepId: number;
  tiles: RibbonTile[];
}

const eightsOf = (step: StudioStep, marks: readonly CountMark[]): number => {
  const start = step.startSeconds ?? 0;
  const end = step.endSeconds ?? start;

  if (marks.length === 0) {
    return Math.max(1, Math.round((end - start) / SECONDS_PER_EIGHT_WITHOUT_COUNTS));
  }

  const counts = marks.filter((mark) => mark.seconds >= start && mark.seconds < end).length;

  return Math.max(1, Math.round(counts / COUNTS_PER_EIGHT));
};

export const ribbonOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  marks: readonly CountMark[],
): RibbonGroup[] =>
  segmentGroupsOf(steps, parts).flatMap((group) => {
    const tiles = group.steps.flatMap((segment) => {
      const step = steps.find((candidate) => candidate.stepId === segment.stepId);

      if (step === undefined) {
        return [];
      }
      const number = stepNumberOf(steps, step.stepId);

      return [
        {
          stepId: step.stepId,
          number,
          name: shownStepNameOf(step.name, number),
          eights: eightsOf(step, marks),
          step,
        },
      ];
    });
    const first = tiles[0];

    return first === undefined
      ? []
      : [{ key: group.key, partName: group.name, firstStepId: first.stepId, tiles }];
  });
