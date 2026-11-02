import type { TimelineRange } from '@/features/act-player/music-timeline';

const TICK_STEPS_SECONDS: readonly number[] = [1, 2, 5, 10, 15, 30, 60];
const MOST_TICKS = 12;
const ZOOM_MARGIN_SHARE = 0.015;

export interface ScoreZoom {
  start: number;
  end: number;
}

export interface RulerTick {
  seconds: number;
  share: number;
}

export const WHOLE_ZOOM: ScoreZoom = { start: 0, end: 1 };

export const zoomOf = (range: TimelineRange | null, length: number): ScoreZoom => {
  if (range === null || length <= 0) {
    return WHOLE_ZOOM;
  }

  return {
    start: Math.max(0, range.start / length - ZOOM_MARGIN_SHARE),
    end: Math.min(1, range.end / length + ZOOM_MARGIN_SHARE),
  };
};

export const tickStepOf = (visibleSeconds: number): number =>
  TICK_STEPS_SECONDS.find((step) => visibleSeconds / step <= MOST_TICKS) ??
  TICK_STEPS_SECONDS.at(-1) ??
  1;

export const rulerTicksOf = (length: number, zoom: ScoreZoom): RulerTick[] => {
  if (length <= 0) {
    return [];
  }

  const step = tickStepOf(length * (zoom.end - zoom.start));
  const count = Math.floor(length / step);

  return Array.from({ length: count + 1 }, (_, index) => index * step)
    .filter((seconds) => seconds < length)
    .map((seconds) => ({ seconds, share: seconds / length }));
};

export const shareToSeconds = (share: number, length: number): number =>
  Math.min(length, Math.max(0, share * length));
