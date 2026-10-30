import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { shownStepNameOf, stepNumberOf } from '@/features/act-player/step-names';
import type { StudioStep } from '@/features/acts/schemas';
import { isLooped, segmentGroupsOf } from '../practice-controls';
import { partLoopLabelOf, segmentLabelOf } from '../practice-copy';
import type { Practice } from './use-practice';

export interface PracticeSegmentRow {
  stepId: number;
  step: StudioStep;
  number: number;
  grow: number;
  label: string;
  current: boolean;
  looped: boolean;
}

export interface PracticePartKey {
  name: string;
  label: string;
  firstStepId: number;
  looped: boolean;
}

export interface PracticeSegmentGroupRow {
  key: string;
  part: PracticePartKey | null;
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

      if (step === undefined) {
        return [];
      }
      const number = stepNumberOf(playback.steps, step.stepId);

      return [
        {
          stepId: step.stepId,
          step,
          number,
          grow: segment.grow,
          label: segmentLabelOf(shownStepNameOf(step.name, number)),
          current: step.stepId === currentId,
          looped: isLooped(step, practice.loop),
        },
      ];
    });
    const current = segments.some((segment) => segment.current);
    const firstStepId = segments[0]?.stepId ?? null;

    return {
      key: group.key,
      part:
        group.name === null || firstStepId === null
          ? null
          : {
              name: group.name,
              label: partLoopLabelOf(group.name),
              firstStepId,
              looped: practice.loopKind === 'part' && current,
            },
      grow: group.grow,
      current,
      segments,
    };
  });
};
