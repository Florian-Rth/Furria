import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { StudioStep } from '@/features/acts/schemas';
import { isLooped, segmentGroupsOf } from '../studio-e-controls';
import { segmentLabelOf } from '../studio-e-copy';
import type { StudioEPractice } from './use-studio-e-practice';

export interface StudioESegmentRow {
  stepId: number;
  step: StudioStep;
  grow: number;
  label: string;
  current: boolean;
  looped: boolean;
}

export interface StudioESegmentGroupRow {
  key: string;
  name: string | null;
  grow: number;
  current: boolean;
  segments: StudioESegmentRow[];
}

export const useStudioESegments = (
  playback: StudioPlayback,
  practice: StudioEPractice,
): StudioESegmentGroupRow[] => {
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
              label: segmentLabelOf(step.name),
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
