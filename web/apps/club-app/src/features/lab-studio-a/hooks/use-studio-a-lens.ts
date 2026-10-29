import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import { waveformOf } from '@/features/act-player/mix-waveform';

const PIXELS_PER_SECOND = 52;
const WAVE_BUCKETS_PER_SECOND = 7;

export interface StudioALensBeat {
  key: string;
  x: number;
  count: number;
}

export interface StudioALensEdge {
  key: string;
  x: number;
  label: string;
}

export interface StudioALensView {
  pixelsPerSecond: number;
  width: number;
  wave: number[];
  beats: StudioALensBeat[];
  edges: StudioALensEdge[];
  pick: (offsetFromCentre: number) => void;
}

export const useStudioALens = (playback: StudioPlayback): StudioALensView => {
  const { segments, peaksByItem, countMarks, steps, length, player, controls } = playback;

  return {
    pixelsPerSecond: PIXELS_PER_SECOND,
    width: length * PIXELS_PER_SECOND,
    wave: waveformOf(segments, peaksByItem, Math.round(length * WAVE_BUCKETS_PER_SECOND)),
    beats: countMarks.map((mark) => ({
      key: String(mark.seconds),
      x: mark.seconds * PIXELS_PER_SECOND,
      count: mark.count,
    })),
    edges: steps.map((step, index) => ({
      key: String(step.stepId),
      x: (step.startSeconds ?? 0) * PIXELS_PER_SECOND,
      label: `${index + 1} ${step.name}`,
    })),
    pick: (offsetFromCentre) => {
      controls.seek(player.position() + offsetFromCentre / PIXELS_PER_SECOND);
    },
  };
};
