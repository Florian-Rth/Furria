import type { KkStudioDPlayerSpeedOption } from '@furria/ui/KkStudioDPlayer';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import {
  STUDIO_D_NO_STEPS,
  STUDIO_D_PAUSE,
  STUDIO_D_PLAY,
  STUDIO_D_SHOW_STAGE,
  STUDIO_D_SHOW_VIDEO,
} from '../studio-d-copy';
import { ratePercentOf, STUDIO_D_RATES } from '../studio-d-practice';
import type { StudioDAwake } from './use-studio-d-awake';
import { useStudioDAwake } from './use-studio-d-awake';
import type { StudioDFrame } from './use-studio-d-frame';
import { useStudioDFrame } from './use-studio-d-frame';
import { useStudioDKeys } from './use-studio-d-keys';
import type { StudioDStageView } from './use-studio-d-stage';
import { useStudioDStage } from './use-studio-d-stage';
import type { StudioDStep } from './use-studio-d-step';
import { useStudioDStep } from './use-studio-d-step';
import type { StudioDView } from './use-studio-d-view';
import { useStudioDView } from './use-studio-d-view';

const SPEED_OPTIONS: KkStudioDPlayerSpeedOption[] = STUDIO_D_RATES.map((rate) => ({
  value: rate,
  text: ratePercentOf(rate),
}));

export interface StudioDShows {
  fullVideo: boolean;
  fullStage: boolean;
  inset: boolean;
  insetStage: boolean;
  insetVideo: boolean;
}

export interface StudioDPlayerModel {
  playback: StudioPlayback;
  view: StudioDView;
  practice: StudioDStep;
  frame: StudioDFrame;
  stage: StudioDStageView;
  awake: StudioDAwake;
  playLabel: string;
  busy: boolean;
  locked: boolean;
  failed: boolean;
  stepName: string;
  stepless: boolean;
  insetLabel: string;
  shows: StudioDShows;
  speedOptions: readonly KkStudioDPlayerSpeedOption[];
  toggle: () => void;
  toggleLoop: () => void;
  seekShare: (share: number) => void;
  setRate: (rate: number) => void;
  toggleMirror: () => void;
  swap: () => void;
  openSteps: () => void;
  closeSteps: () => void;
}

export const useStudioDPlayer = (studio: Studio, viewerId: number | null): StudioDPlayerModel => {
  const playback = useStudioPlayback(studio, viewerId);
  const view = useStudioDView();
  const practice = useStudioDStep(playback);
  const frame = useStudioDFrame(studio, playback, view.stageFirst);
  const stage = useStudioDStage(studio, playback, view.mirrored, practice.step);
  const { state, controls } = playback;
  const awake = useStudioDAwake(state.playing, view.speedOpen || view.stepsOpen);

  const toggle = (): void => {
    awake.nudge();
    controls.toggle();
  };

  useStudioDKeys(toggle);

  return {
    playback,
    view,
    practice,
    frame,
    stage,
    awake,
    playLabel: state.playing ? STUDIO_D_PAUSE : STUDIO_D_PLAY,
    busy: state.load === 'idle' || state.load === 'loading',
    locked: state.load !== 'ready',
    failed: state.load === 'failed',
    stepName: practice.step?.name ?? STUDIO_D_NO_STEPS,
    stepless: practice.step === null,
    shows: {
      fullVideo: frame.framing.full === 'video',
      fullStage: frame.framing.full === 'stage',
      inset: frame.framing.inset !== null,
      insetStage: frame.framing.inset === 'stage',
      insetVideo: frame.framing.inset === 'video',
    },
    insetLabel: frame.framing.inset === 'video' ? STUDIO_D_SHOW_VIDEO : STUDIO_D_SHOW_STAGE,
    speedOptions: SPEED_OPTIONS,
    toggle,
    toggleLoop: () => {
      awake.nudge();
      practice.toggleLoop();
    },
    seekShare: (share) => {
      awake.nudge();
      practice.seekShare(share);
    },
    setRate: (rate) => {
      awake.nudge();
      controls.setRate(rate);
    },
    toggleMirror: () => {
      awake.nudge();
      view.toggleMirror();
    },
    swap: () => {
      awake.nudge();
      view.swap();
    },
    openSteps: () => {
      view.setStepsOpen(true);
    },
    closeSteps: () => {
      awake.nudge();
      view.setStepsOpen(false);
    },
  };
};
