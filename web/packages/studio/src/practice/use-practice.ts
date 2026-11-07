import type { TimelineRange } from '@furria/studio/music-timeline';
import { partOfStep, partRangeOf, stepRangeOf } from '@furria/studio/music-timeline';
import type { LoopKind } from '@furria/studio/practice-controls';
import { loopKindOf, loopRangeOf } from '@furria/studio/practice-controls';
import {
  PRACTICE_LOAD_FAILED,
  PRACTICE_NO_STEPS,
  PRACTICE_PAUSE,
  PRACTICE_PLAY,
  rateLabelOf,
  rateTextOf,
} from '@furria/studio/practice-copy';
import type { SkipDirection } from '@furria/studio/practice-stepping';
import {
  nextRateOf,
  ratePercentOf,
  shownStepOf,
  skipTargetOf,
} from '@furria/studio/practice-stepping';
import { shownStepNameOf, stepNumberOf } from '@furria/studio/step-names';
import type { StudioStep } from '@furria/studio/studio-schemas';
import { usePlaybackSelection } from '@furria/studio/use-playback-seconds';
import { useScreenWakeLock } from '@furria/studio/use-screen-wake-lock';
import type { StudioPlayback } from '@furria/studio/use-studio-playback';

const NO_STEP_KEY = 'none';

export interface Practice {
  step: StudioStep | null;
  stepKey: string;
  stepName: string;
  note: string | null;
  partName: string | null;
  playing: boolean;
  playLabel: string;
  canPlay: boolean;
  canStep: boolean;
  loop: TimelineRange | null;
  loopKind: LoopKind;
  rate: number;
  percent: number;
  rateText: string;
  rateLabel: string;
  slowed: boolean;
  toggle: () => void;
  skip: (direction: SkipDirection) => void;
  slowDown: () => void;
  setRate: (rate: number) => void;
  jumpTo: (stepId: number) => void;
  seekTo: (seconds: number) => void;
  loopStep: (stepId: number) => void;
  loopPart: (stepId: number) => void;
}

const sameRange = (left: TimelineRange | null, right: TimelineRange | null): boolean =>
  left !== null && right !== null && left.start === right.start && left.end === right.end;

export const usePractice = (playback: StudioPlayback): Practice => {
  const { player, steps, parts, state, controls } = playback;
  useScreenWakeLock(state.playing);
  const stepId = usePlaybackSelection(
    player,
    (seconds) => shownStepOf(steps, seconds)?.stepId ?? null,
  );
  const step = steps.find((candidate) => candidate.stepId === stepId) ?? null;
  const part = step === null ? null : partOfStep(parts, step.stepId);
  const loopKind = loopKindOf(state.loop, step, parts, steps);
  const percent = ratePercentOf(state.rate);
  const stepOf = (id: number): StudioStep | null =>
    steps.find((candidate) => candidate.stepId === id) ?? null;

  const carryLoopTo = (target: StudioStep): void => {
    const kind = loopKindOf(
      player.state().loop,
      shownStepOf(steps, player.position()),
      parts,
      steps,
    );
    if (kind !== 'off') {
      player.setLoop(loopRangeOf(kind, target, parts, steps));
    }
  };

  const land = (target: StudioStep): void => {
    carryLoopTo(target);
    player.seek(target.startSeconds ?? 0);
  };

  const loopTo = (range: TimelineRange | null, target: StudioStep): void => {
    if (range === null || sameRange(player.state().loop, range)) {
      player.setLoop(null);
      return;
    }
    player.setLoop(range);
    player.seek(target.startSeconds ?? range.start);
  };

  return {
    step,
    stepKey: step === null ? NO_STEP_KEY : String(step.stepId),
    stepName:
      step === null
        ? PRACTICE_NO_STEPS
        : shownStepNameOf(step.name, stepNumberOf(steps, step.stepId)),
    note: state.load === 'failed' ? PRACTICE_LOAD_FAILED : null,
    partName: part?.name ?? null,
    playing: state.playing,
    playLabel: state.playing ? PRACTICE_PAUSE : PRACTICE_PLAY,
    canPlay: state.load === 'ready',
    canStep: step !== null,
    loop: state.loop,
    loopKind,
    rate: state.rate,
    percent,
    rateText: rateTextOf(percent),
    rateLabel: rateLabelOf(percent),
    slowed: state.rate < 1,
    toggle: controls.toggle,
    skip: (direction) => {
      const target = skipTargetOf(steps, player.position(), direction);
      if (target !== null) {
        land(target);
      }
    },
    slowDown: () => {
      controls.setRate(nextRateOf(player.state().rate));
    },
    setRate: controls.setRate,
    jumpTo: (id) => {
      const target = stepOf(id);
      if (target !== null) {
        land(target);
      }
    },
    seekTo: (seconds) => {
      const target = shownStepOf(steps, seconds);
      if (target !== null) {
        carryLoopTo(target);
      }
      player.seek(seconds);
    },
    loopStep: (id) => {
      const target = stepOf(id);
      if (target !== null) {
        loopTo(stepRangeOf(target), target);
      }
    },
    loopPart: (id) => {
      const target = stepOf(id);
      const owner = target === null ? null : partOfStep(parts, target.stepId);
      if (target !== null) {
        loopTo(owner === null ? stepRangeOf(target) : partRangeOf(owner, steps), target);
      }
    },
  };
};
