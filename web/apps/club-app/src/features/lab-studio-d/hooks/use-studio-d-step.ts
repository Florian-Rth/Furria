import type { KkStudioDPlayerMark, KkStudioDPlayerShare } from '@furria/ui/KkStudioDPlayer';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep, stepRangeOf } from '@/features/act-player/music-timeline';
import type { StudioStep } from '@/features/acts/schemas';
import type { StudioDStepGroup } from '../studio-d-practice';
import {
  loopedStepIdOf,
  loopShareOf,
  practiceStepOf,
  releasesLoop,
  stepGroupsOf,
  stepMarksOf,
} from '../studio-d-practice';

export interface StudioDStep {
  step: StudioStep | null;
  partName: string | null;
  looping: boolean;
  marks: KkStudioDPlayerMark[];
  loop: KkStudioDPlayerShare | null;
  groups: StudioDStepGroup[];
  toggleLoop: () => void;
  seekShare: (share: number) => void;
  practise: (stepId: number) => void;
}

export const useStudioDStep = (playback: StudioPlayback): StudioDStep => {
  const { player, steps, parts, length, state, controls } = playback;
  const stepId = usePlaybackSelection(
    player,
    (seconds) => practiceStepOf(steps, seconds)?.stepId ?? null,
  );
  const step = steps.find((candidate) => candidate.stepId === stepId) ?? null;
  const part = step === null ? null : partOfStep(parts, step.stepId);
  const loopedStepId = loopedStepIdOf(state.loop, steps);

  return {
    step,
    partName: part?.name ?? null,
    looping: loopedStepId !== null,
    marks: stepMarksOf(steps, parts, length).map((mark) => ({
      key: String(mark.stepId),
      at: mark.at,
      opensPart: mark.opensPart,
    })),
    loop: loopShareOf(state.loop, length),
    groups: stepGroupsOf(steps, parts),
    toggleLoop: () => {
      if (state.loop !== null) {
        controls.clearLoop();
      } else if (step !== null) {
        controls.loopStep(step);
      }
    },
    seekShare: (share) => {
      const seconds = share * length;
      if (releasesLoop(state.loop, seconds)) {
        controls.clearLoop();
      }
      controls.seek(seconds);
    },
    practise: (chosenId) => {
      const chosen = steps.find((candidate) => candidate.stepId === chosenId);
      const range = chosen === undefined ? null : stepRangeOf(chosen);
      if (chosen === undefined || range === null) {
        return;
      }
      if (state.loop !== null && loopedStepId !== chosenId) {
        controls.loopStep(chosen);
      }
      controls.seek(range.start);
    },
  };
};
