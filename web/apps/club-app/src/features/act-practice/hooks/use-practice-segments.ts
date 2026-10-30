import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { shownStepNameOf, stepNumberOf } from '@/features/act-player/step-names';
import type { StudioStep } from '@/features/acts/schemas';
import { isLooped, segmentGroupsOf } from '../practice-controls';
import { segmentLabelOf } from '../practice-copy';
import type { Practice } from './use-practice';

export interface PracticeSegmentRow {
  stepId: number;
  step: StudioStep;
  grow: number;
  label: string;
  current: boolean;
  looped: boolean;
}

export interface PracticeSegmentGroupRow {
  key: string;
  name: string | null;
  grow: number;
  current: boolean;
  segments: PracticeSegmentRow[];
}

export const usePracticeSegments = (
  playback: StudioPlayback,
  practice: Practice,
): PracticeSegmentGroupRow[] => {
  const currentId = practice.step?.stepId ?? null;

  return segmentGroupsOf(playback.steps, playback.parts).map((group) => {
    const segments = group.steps.flatMap((segment) => {
      const step = playback.steps.find((candidate) => candidate.stepId === segment.stepId);

      return step === undefined
        ? []
        : [
            {
              stepId: step.stepId,
              step,
              grow: segment.grow,
              label: segmentLabelOf(
                shownStepNameOf(step.name, stepNumberOf(playback.steps, step.stepId)),
              ),
              current: step.stepId === currentId,
              looped: isLooped(step, practice.loop),
            },
          ];
    });

    return {
      key: group.key,
      name: group.name,
      grow: group.grow,
      current: segments.some((segment) => segment.current),
      segments,
    };
  });
};
