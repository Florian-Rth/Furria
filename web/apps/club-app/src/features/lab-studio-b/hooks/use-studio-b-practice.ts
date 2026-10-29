import { useState } from 'react';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { partOfStep } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import type { Manual, ManualPart, ManualStep } from '../studio-b-manual';
import { manualOf, manualStepOfId, partOfManualStep } from '../studio-b-manual';
import type { LoopScope, StepDirection } from '../studio-b-practice';
import {
  currentStepOf,
  loopScopeOf,
  neighbourOf,
  nextRateOf,
  pickedScopeOf,
  practiceLoopOf,
  RATES,
} from '../studio-b-practice';

export interface StudioBActions {
  toggle: () => void;
  practise: (stepId: number) => void;
  move: (direction: StepDirection) => void;
  jump: (share: number) => void;
  toggleStepLoop: () => void;
  togglePartLoop: () => void;
  slower: () => void;
  faster: () => void;
  toggleMirror: () => void;
  reload: () => void;
}

export interface StudioBPractice {
  manual: Manual;
  current: ManualStep | null;
  currentPart: ManualPart | null;
  hasPrevious: boolean;
  hasNext: boolean;
  scope: LoopScope;
  mirrored: boolean;
  canSlow: boolean;
  canSpeed: boolean;
  actions: StudioBActions;
}

export const useStudioBPractice = (playback: StudioPlayback, studio: Studio): StudioBPractice => {
  const { player, steps, parts, state, controls, length } = playback;
  const [mirrored, setMirrored] = useState(true);
  const currentId = usePlaybackSelection(
    player,
    (seconds) => currentStepOf(steps, seconds)?.stepId ?? null,
  );
  const manual = manualOf({
    steps,
    allSteps: studio.steps,
    parts,
    videos: studio.videos,
    countMarks: playback.countMarks,
    paths: playback.paths,
    spots: studio.spots,
    stage: playback.stage,
    ownSpotId: playback.ownSpotId,
  });
  const currentStep = steps.find((step) => step.stepId === currentId) ?? null;
  const scope = loopScopeOf(state.loop, currentStep, parts, steps);
  const ready = state.load === 'ready';

  const playIfResting = (): void => {
    if (ready && !player.state().playing) {
      player.play();
    }
  };

  const goTo = (stepId: number | null, chosenScope: LoopScope, start: boolean): void => {
    const step = steps.find((candidate) => candidate.stepId === stepId);

    if (step === undefined) {
      return;
    }

    player.setLoop(practiceLoopOf(chosenScope, step, parts, steps));
    player.seek(step.startSeconds ?? 0);
    if (start) {
      playIfResting();
    }
  };

  const actions: StudioBActions = {
    toggle: controls.toggle,
    practise: (stepId) => {
      goTo(stepId, pickedScopeOf(scope), true);
    },
    move: (direction) => {
      goTo(neighbourOf(steps, currentId, direction)?.stepId ?? null, scope, false);
    },
    jump: (share) => {
      const seconds = share * length;
      const target = currentStepOf(steps, seconds);

      player.setLoop(target === null ? null : practiceLoopOf(scope, target, parts, steps));
      player.seek(seconds);
    },
    toggleStepLoop: () => {
      if (currentStep !== null) {
        controls.loopStep(currentStep);
      }
    },
    togglePartLoop: () => {
      const part = currentStep === null ? null : partOfStep(parts, currentStep.stepId);

      if (part !== null) {
        controls.loopPart(part);
      }
    },
    slower: () => {
      controls.setRate(nextRateOf(state.rate, 'slower'));
    },
    faster: () => {
      controls.setRate(nextRateOf(state.rate, 'faster'));
    },
    toggleMirror: () => {
      setMirrored((value) => !value);
    },
    reload: () => {
      void player.load();
    },
  };

  return {
    manual,
    current: manualStepOfId(manual, currentId),
    currentPart: currentId === null ? null : partOfManualStep(manual, currentId),
    hasPrevious: neighbourOf(steps, currentId, 'previous') !== null,
    hasNext: neighbourOf(steps, currentId, 'next') !== null,
    scope,
    mirrored,
    canSlow: state.rate > (RATES[0] ?? 0),
    canSpeed: state.rate < (RATES.at(-1) ?? 1),
    actions,
  };
};
