import { partRangeOf, stepRangeOf } from '@furria/studio/music-timeline';
import type { StudioPart, StudioStep } from '@furria/studio/studio-schemas';
import type { KkScoreTrackPart, KkScoreTrackTickMark } from '@furria/ui/KkScoreTrack';
import { shownStepOf } from '@/features/act-practice/practice-stepping';

export interface LessonStripLanes {
  parts: KkScoreTrackPart[];
  ticks: KkScoreTrackTickMark[];
}

export const lessonStripOf = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  length: number,
): LessonStripLanes => {
  if (length <= 0) {
    return { parts: [], ticks: [] };
  }

  return {
    parts: parts.flatMap((part, index) => {
      const range = partRangeOf(part, steps);
      return range === null
        ? []
        : [
            {
              key: part.partId,
              label: part.name,
              from: range.start / length,
              to: range.end / length,
              shade: index,
            },
          ];
    }),
    ticks: steps.flatMap((step) => {
      const range = stepRangeOf(step);
      return range === null
        ? []
        : [{ key: step.stepId, from: range.start / length, to: range.end / length }];
    }),
  };
};

export const stripStepIdOf = (
  steps: readonly StudioStep[],
  share: number,
  length: number,
): number | null => shownStepOf(steps, share * length)?.stepId ?? null;
