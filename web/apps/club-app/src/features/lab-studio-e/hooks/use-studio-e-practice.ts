import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep, partRangeOf, stepRangeOf } from '@/features/act-player/music-timeline';
import type { StudioStep } from '@/features/acts/schemas';
import type { LoopKind } from '../studio-e-controls';
import { loopKindOf, loopRangeOf } from '../studio-e-controls';
import {
  rateLabelOf,
  rateTextOf,
  STUDIO_E_LOAD_FAILED,
  STUDIO_E_NO_STEPS,
  STUDIO_E_PAUSE,
  STUDIO_E_PLAY,
} from '../studio-e-copy';
import type { SkipDirection } from '../studio-e-practice';
import { nextRateOf, ratePercentOf, shownStepOf, skipTargetOf } from '../studio-e-practice';

const NO_STEP_KEY = 'none';

export interface StudioEPractice {
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
  loopStep: (stepId: number) => void;
  loopPart: (stepId: number) => void;
}

const sameRange = (left: TimelineRange | null, right: TimelineRange | null): boolean =>
  left !== null && right !== null && left.start === right.start && left.end === right.end;

export const useStudioEPractice = (playback: StudioPlayback): StudioEPractice => {
  const { player, steps, parts, state, controls } = playback;
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

  const land = (target: StudioStep): void => {
    const kind = loopKindOf(
      player.state().loop,
      shownStepOf(steps, player.position()),
      parts,
      steps,
    );
    if (kind !== 'off') {
      player.setLoop(loopRangeOf(kind, target, parts, steps));
    }
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
    stepName: step?.name ?? STUDIO_E_NO_STEPS,
    note: state.load === 'failed' ? STUDIO_E_LOAD_FAILED : (step?.description ?? null),
    partName: part?.name ?? null,
    playing: state.playing,
    playLabel: state.playing ? STUDIO_E_PAUSE : STUDIO_E_PLAY,
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
