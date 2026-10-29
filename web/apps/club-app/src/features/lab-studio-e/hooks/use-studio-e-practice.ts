import type { KkStudioETransportShare } from '@furria/ui/KkStudioETransport';
import { usePlaybackSelection } from '@/features/act-player/hooks/use-playback-seconds';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { stepRangeOf } from '@/features/act-player/music-timeline';
import type { StudioStep } from '@/features/acts/schemas';
import {
  rateLabelOf,
  rateTextOf,
  STUDIO_E_LOAD_FAILED,
  STUDIO_E_NO_STEPS,
  STUDIO_E_PAUSE,
  STUDIO_E_PLAY,
} from '../studio-e-copy';
import type { SkipDirection } from '../studio-e-practice';
import {
  currentStepOf,
  loopShareOf,
  nextRateOf,
  progressStopsOf,
  ratePercentOf,
  shownStepOf,
  skipTargetOf,
  snappedSeekOf,
} from '../studio-e-practice';

const NO_STEP_KEY = 'none';

export interface StudioEPractice {
  stepKey: string;
  stepName: string;
  note: string | null;
  playing: boolean;
  playLabel: string;
  canPlay: boolean;
  looping: boolean;
  canLoop: boolean;
  rateText: string;
  rateLabel: string;
  slowed: boolean;
  stops: KkStudioETransportShare[];
  loop: KkStudioETransportShare | null;
  toggle: () => void;
  skipBack: () => void;
  skipForward: () => void;
  toggleLoop: () => void;
  slowDown: () => void;
  seekShare: (share: number) => void;
}

export const useStudioEPractice = (playback: StudioPlayback): StudioEPractice => {
  const { player, steps, state, length, controls } = playback;
  const stepId = usePlaybackSelection(
    player,
    (seconds) => shownStepOf(steps, seconds)?.stepId ?? null,
  );
  const step = steps.find((candidate) => candidate.stepId === stepId) ?? null;
  const looping = state.loop !== null;
  const percent = ratePercentOf(state.rate);
  const loopShare = loopShareOf(state.loop, length);

  const land = (target: StudioStep | null, seconds: number): void => {
    const range = target === null ? null : stepRangeOf(target);
    if (looping && range !== null) {
      player.setLoop(range);
    }
    player.seek(seconds);
  };

  const skip = (direction: SkipDirection): void => {
    const target = skipTargetOf(steps, player.position(), direction);
    if (target !== null) {
      land(target, target.startSeconds ?? 0);
    }
  };

  return {
    stepKey: step === null ? NO_STEP_KEY : String(step.stepId),
    stepName: step?.name ?? STUDIO_E_NO_STEPS,
    note: state.load === 'failed' ? STUDIO_E_LOAD_FAILED : (step?.description ?? null),
    playing: state.playing,
    playLabel: state.playing ? STUDIO_E_PAUSE : STUDIO_E_PLAY,
    canPlay: state.load === 'ready',
    looping,
    canLoop: step !== null,
    rateText: rateTextOf(percent),
    rateLabel: rateLabelOf(percent),
    slowed: state.rate < 1,
    stops: progressStopsOf(steps, length).map((stop) => ({ ...stop, key: String(stop.stepId) })),
    loop: loopShare === null ? null : { ...loopShare, key: 'loop' },
    toggle: controls.toggle,
    skipBack: () => {
      skip('back');
    },
    skipForward: () => {
      skip('forward');
    },
    toggleLoop: () => {
      if (looping) {
        controls.clearLoop();
        return;
      }
      const target = shownStepOf(steps, player.position());
      if (target !== null) {
        controls.loopStep(target);
      }
    },
    slowDown: () => {
      controls.setRate(nextRateOf(state.rate));
    },
    seekShare: (share) => {
      const seconds = snappedSeekOf(steps, share, length);
      land(currentStepOf(steps, seconds), seconds);
    },
  };
};
