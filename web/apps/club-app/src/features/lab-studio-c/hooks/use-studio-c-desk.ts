import { useState } from 'react';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { useStudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { stepAt } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import type { RateDirection, VideoSpan } from '../studio-c-timeline';
import { canShiftRate, nextRateOf, ratePercentOf, videoSpansOf } from '../studio-c-timeline';

export interface StudioCRate {
  value: string;
  slowed: boolean;
  canSlower: boolean;
  canFaster: boolean;
  slower: () => void;
  faster: () => void;
}

export interface StudioCDesk {
  playback: StudioPlayback;
  ownPath: SpotPath | null;
  videoSpans: readonly VideoSpan[];
  mirrored: boolean;
  toggleMirror: () => void;
  videoFirst: boolean;
  swapView: () => void;
  looping: boolean;
  toggleLoop: () => void;
  rate: StudioCRate;
  musicMissing: boolean;
}

export const useStudioCDesk = (studio: Studio, viewerId: number | null): StudioCDesk => {
  const playback = useStudioPlayback(studio, viewerId);
  const [mirrored, setMirrored] = useState(true);
  const [videoFirst, setVideoFirst] = useState(false);
  const { player, state, controls, steps, paths, ownSpotId, length } = playback;

  const shiftRate = (direction: RateDirection): void => {
    controls.setRate(nextRateOf(state.rate, direction));
  };

  return {
    playback,
    ownPath: paths.find((path) => path.spotId === ownSpotId) ?? null,
    videoSpans: videoSpansOf(studio.videos, length),
    mirrored,
    toggleMirror: () => {
      setMirrored((current) => !current);
    },
    videoFirst,
    swapView: () => {
      setVideoFirst((current) => !current);
    },
    looping: state.loop !== null,
    toggleLoop: () => {
      if (state.loop !== null) {
        controls.clearLoop();
        return;
      }

      const step = stepAt(steps, player.position());
      if (step !== null) {
        controls.loopStep(step);
      }
    },
    rate: {
      value: ratePercentOf(state.rate),
      slowed: state.rate < 1,
      canSlower: canShiftRate(state.rate, 'slower'),
      canFaster: canShiftRate(state.rate, 'faster'),
      slower: () => {
        shiftRate('slower');
      },
      faster: () => {
        shiftRate('faster');
      },
    },
    musicMissing: length <= 0,
  };
};
