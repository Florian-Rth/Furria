import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import type { StudioALoopKind } from '../studio-a-practice';
import { loopedPartIdOf, loopedStepIdOf, loopKindOf, practiceStepOf } from '../studio-a-practice';

export interface StudioAPractice {
  step: StudioStep | null;
  stepNumber: number | null;
  part: StudioPart | null;
  loopKind: StudioALoopKind | null;
  loopedStepId: number | null;
  loopedPartId: number | null;
  loopStep: () => void;
  loopPart: () => void;
  selectStep: (step: StudioStep) => void;
  selectPart: (part: StudioPart) => void;
  seekShare: (share: number) => void;
}

const bringStageIntoView = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const useStudioAPractice = (playback: StudioPlayback): StudioAPractice => {
  const { player, steps, parts, state, controls, length } = playback;
  const stepId = usePlaybackSelection(
    player,
    (seconds) => practiceStepOf(steps, seconds)?.stepId ?? null,
  );
  const index = steps.findIndex((candidate) => candidate.stepId === stepId);
  const step = steps[index] ?? null;
  const part = step === null ? null : partOfStep(parts, step.stepId);
  const loopedStepId = loopedStepIdOf(state.loop, steps);

  return {
    step,
    stepNumber: step === null ? null : index + 1,
    part,
    loopKind: loopKindOf(state.loop, step, part, steps),
    loopedStepId,
    loopedPartId: loopedPartIdOf(state.loop, parts, steps),
    loopStep: () => {
      if (step !== null) {
        controls.loopStep(step);
      }
    },
    loopPart: () => {
      if (part !== null) {
        controls.loopPart(part);
      }
    },
    selectStep: (picked) => {
      if (picked.stepId !== loopedStepId && picked.startSeconds !== null) {
        controls.seek(picked.startSeconds);
      }
      controls.loopStep(picked);
      bringStageIntoView();
    },
    selectPart: (picked) => {
      controls.loopPart(picked);
    },
    seekShare: (share) => {
      controls.seek(share * length);
    },
  };
};
