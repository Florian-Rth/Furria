import type { KkStudioATransportRate } from '@furria/ui/KkStudioATransport';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import {
  rateLabelOf,
  rateNameOf,
  STUDIO_A_PAUSE,
  STUDIO_A_PLAY,
  STUDIO_A_RATES,
} from '../studio-a-copy';
import type { StudioAPractice } from './use-studio-a-practice';

export interface StudioATransport {
  playLabel: string;
  playing: boolean;
  busy: boolean;
  playable: boolean;
  stepLooped: boolean;
  partLooped: boolean;
  canLoopStep: boolean;
  canLoopPart: boolean;
  rates: KkStudioATransportRate[];
  rate: number;
}

export const useStudioATransport = (
  playback: StudioPlayback,
  practice: StudioAPractice,
): StudioATransport => {
  const { state, length } = playback;

  return {
    playLabel: state.playing ? STUDIO_A_PAUSE : STUDIO_A_PLAY,
    playing: state.playing,
    busy: state.load === 'idle' || state.load === 'loading',
    playable: state.load !== 'failed' && length > 0,
    stepLooped: practice.loopKind === 'step',
    partLooped: practice.loopKind === 'part',
    canLoopStep: practice.step !== null,
    canLoopPart: practice.part !== null,
    rates: STUDIO_A_RATES.map((rate) => ({
      value: rate,
      label: rateLabelOf(rate),
      name: rateNameOf(rate),
    })),
    rate: state.rate,
  };
};
