import type { Studio, StudioPart, StudioStage, StudioStep } from '@/features/acts/schemas';
import { useAudioPeaks } from '../api';
import type { SpotPath } from '../choreography-motion';
import { spotPathsOf } from '../choreography-motion';
import type { MixPlayer, MixPlayerState } from '../mix-player';
import type { CountMark, MusicSegment, TimelineRange } from '../music-timeline';
import {
  countMarksOf,
  musicLengthOf,
  musicSegmentsOf,
  partRangeOf,
  stepRangeOf,
} from '../music-timeline';
import type { AudioPeaks } from '../schemas';
import { stageOrDefault } from '../stage-view';
import { useMixPlayer } from './use-mix-player';

export interface StudioPlaybackControls {
  toggle: () => void;
  seek: (seconds: number) => void;
  loopStep: (step: StudioStep) => void;
  loopPart: (part: StudioPart) => void;
  clearLoop: () => void;
  setRate: (rate: number) => void;
}

export interface StudioPlayback {
  segments: readonly MusicSegment[];
  length: number;
  paths: readonly SpotPath[];
  stage: StudioStage;
  steps: readonly StudioStep[];
  parts: readonly StudioPart[];
  countMarks: readonly CountMark[];
  peaksByItem: ReadonlyMap<number, AudioPeaks>;
  ownSpotId: number | null;
  player: MixPlayer;
  state: MixPlayerState;
  controls: StudioPlaybackControls;
}

const timedStepsOf = (steps: readonly StudioStep[]): StudioStep[] =>
  steps
    .filter((step) => step.placement === 'onTimeline' && step.startSeconds !== null)
    .sort((left, right) => (left.startSeconds ?? 0) - (right.startSeconds ?? 0));

const ownSpotIdOf = (studio: Studio, viewerId: number | null): number | null =>
  viewerId === null
    ? null
    : (studio.spots.find((spot) => spot.person?.personId === viewerId)?.spotId ?? null);

const loopOrClear = (player: MixPlayer, range: TimelineRange | null): void => {
  const current = player.state().loop;
  const same =
    current !== null &&
    range !== null &&
    current.start === range.start &&
    current.end === range.end;
  player.setLoop(same ? null : range);
};

export const useStudioPlayback = (studio: Studio, viewerId: number | null): StudioPlayback => {
  const segments = musicSegmentsOf(studio);
  const steps = timedStepsOf(studio.steps);
  const { player, state } = useMixPlayer(segments);
  const peaksByItem = useAudioPeaks(segments);

  const controls: StudioPlaybackControls = {
    toggle: () => {
      if (player.state().playing) {
        player.pause();
      } else {
        player.play();
      }
    },
    seek: player.seek,
    loopStep: (step) => {
      loopOrClear(player, stepRangeOf(step));
    },
    loopPart: (part) => {
      loopOrClear(player, partRangeOf(part, steps));
    },
    clearLoop: () => {
      player.setLoop(null);
    },
    setRate: player.setRate,
  };

  return {
    segments,
    length: musicLengthOf(segments),
    paths: spotPathsOf(studio.choreography, segments),
    stage: stageOrDefault(studio.stage),
    steps,
    parts: studio.parts.filter((part) => !part.adrift),
    countMarks: countMarksOf(segments),
    peaksByItem,
    ownSpotId: ownSpotIdOf(studio, viewerId),
    player,
    state,
    controls,
  };
};
