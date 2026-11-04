import type { KkTimelineDensity } from '@furria/ui/KkTimeline';
import type { SpotPath } from '../models/choreography-motion';
import { loudestPeakOf, waveformBetween } from '../models/mix-waveform';
import type { CountMark, MusicSegment, TimelineRange } from '../models/music-timeline';
import type { AudioPeaks } from '../models/studio-schemas';

const TICK_STEPS_SECONDS: readonly number[] = [1, 2, 5, 10, 15, 30, 60, 120];
export const RULER_LABEL_PX = 120;
const FIRST_COUNT = 1;
const SECONDS_PER_MINUTE = 60;
const KEYFRAME_ROUNDING = 100;

export type TimelineDensity = KkTimelineDensity;

export interface TimelineWindow {
  start: number;
  end: number;
}

export interface TimelineSpan {
  key: number;
  range: TimelineRange | null;
}

export interface ShareSpan {
  from: number;
  to: number;
}

export interface RulerTick {
  seconds: number;
  share: number;
  label: string;
}

export interface KeyframeMark {
  key: string;
  share: number;
  selected: boolean;
}

export const WHOLE_WINDOW: TimelineWindow = { start: 0, end: 1 };

const WAVE_BARS: Record<TimelineDensity, number> = {
  strip: 240,
  track: 200,
  full: 720,
  edit: 720,
  desk: 720,
  film: 720,
  overview: 480,
};

export const waveBarsOf = (density: TimelineDensity): number => WAVE_BARS[density];

const UNKEYED_DENSITIES: ReadonlySet<TimelineDensity> = new Set(['strip', 'overview']);

export const laneKeysShownOf = (density: TimelineDensity): boolean =>
  !UNKEYED_DENSITIES.has(density);

export const shareOf = (seconds: number, length: number): number =>
  length > 0 ? Math.min(1, Math.max(0, seconds / length)) : 0;

export const secondsOfShare = (share: number, length: number): number =>
  Math.min(length, Math.max(0, share * length));

export const tickStepOf = (pxPerSecond: number): number =>
  TICK_STEPS_SECONDS.find((step) => step * pxPerSecond >= RULER_LABEL_PX) ??
  TICK_STEPS_SECONDS.at(-1) ??
  1;

export const rulerLabelOf = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(seconds));

  return `${Math.floor(whole / SECONDS_PER_MINUTE)}:${String(whole % SECONDS_PER_MINUTE).padStart(2, '0')}`;
};

export const rulerTicksOf = (length: number, pxPerSecond: number): RulerTick[] => {
  if (length <= 0 || pxPerSecond <= 0) {
    return [];
  }

  const step = tickStepOf(pxPerSecond);
  const count = Math.floor(length / step);

  return Array.from({ length: count + 1 }, (_, index) => index * step)
    .filter((seconds) => seconds < length)
    .map((seconds) => ({ seconds, share: seconds / length, label: rulerLabelOf(seconds) }));
};

export const spanSharesOf = <T extends TimelineSpan>(
  spans: readonly T[],
  length: number,
): (T & ShareSpan)[] =>
  length <= 0
    ? []
    : spans.flatMap((span) =>
        span.range === null
          ? []
          : [
              {
                ...span,
                from: shareOf(span.range.start, length),
                to: shareOf(span.range.end, length),
              },
            ],
      );

export const countSharesOf = (marks: readonly CountMark[], length: number): number[] =>
  length <= 0
    ? []
    : marks
        .filter((mark) => mark.count === FIRST_COUNT)
        .map((mark) => shareOf(mark.seconds, length));

export const cutSharesOf = (segments: readonly MusicSegment[], length: number): number[] =>
  length <= 0 ? [] : segments.slice(1).map((segment) => shareOf(segment.timelineStart, length));

export const loopSharesOf = (range: TimelineRange | null, length: number): ShareSpan | null =>
  range === null || length <= 0 || range.end <= range.start
    ? null
    : { from: shareOf(range.start, length), to: shareOf(range.end, length) };

export const keyframeMarksOf = (
  paths: readonly SpotPath[],
  selectedSpotIds: ReadonlySet<number>,
  length: number,
): KeyframeMark[] => {
  if (length <= 0) {
    return [];
  }

  const marks = new Map<number, boolean>();
  for (const path of paths) {
    const selected = selectedSpotIds.has(path.spotId);
    for (const keyframe of path.keyframes) {
      const at = Math.round(keyframe.seconds * KEYFRAME_ROUNDING) / KEYFRAME_ROUNDING;
      marks.set(at, (marks.get(at) ?? false) || selected);
    }
  }

  return [...marks.entries()]
    .filter(([seconds]) => seconds >= 0 && seconds <= length)
    .sort(([left], [right]) => left - right)
    .map(([seconds, selected]) => ({
      key: String(seconds),
      share: shareOf(seconds, length),
      selected,
    }));
};

export const stripWaveOf = (
  segments: readonly MusicSegment[],
  peaks: ReadonlyMap<number, AudioPeaks>,
  window: TimelineWindow,
  length: number,
  barCount: number,
): number[] =>
  waveformBetween(
    segments,
    peaks,
    window.start * length,
    window.end * length,
    barCount,
    loudestPeakOf(segments, peaks),
  );
