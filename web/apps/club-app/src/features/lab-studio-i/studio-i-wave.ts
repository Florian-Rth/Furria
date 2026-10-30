import type { CountMark, MusicSegment, TimelineRange } from '@/features/act-player/music-timeline';
import type { AudioPeaks } from '@/features/act-player/schemas';
import type { StepSpan } from './studio-i-spans';

const CONTEXT_SHARE = 0.14;
const MIN_CONTEXT_SECONDS = 1.2;
const PREROLL_COUNTS = 2;
const FALLBACK_PREROLL_SECONDS = 1;

export interface WaveTick {
  key: string;
  share: number;
  count: number;
  inside: boolean;
}

export interface WaveSeam {
  key: string;
  share: number;
}

export const pageWindowOf = (span: StepSpan, length: number): TimelineRange => {
  const context = Math.max(MIN_CONTEXT_SECONDS, (span.end - span.start) * CONTEXT_SHARE);

  return { start: Math.max(0, span.start - context), end: Math.min(length, span.end + context) };
};

export const shareIn = (window: TimelineRange, seconds: number): number => {
  const width = window.end - window.start;

  return width <= 0 ? 0 : (seconds - window.start) / width;
};

export const secondsAtShare = (window: TimelineRange, share: number): number =>
  window.start + share * (window.end - window.start);

export const ticksIn = (
  marks: readonly CountMark[],
  window: TimelineRange,
  span: StepSpan,
): WaveTick[] =>
  marks
    .filter((mark) => mark.seconds >= window.start && mark.seconds <= window.end)
    .map((mark) => ({
      key: mark.seconds.toFixed(3),
      share: shareIn(window, mark.seconds),
      count: mark.count,
      inside: mark.seconds >= span.start - 1e-3 && mark.seconds < span.end - 1e-3,
    }));

export const seamsIn = (segments: readonly MusicSegment[], window: TimelineRange): WaveSeam[] =>
  segments
    .slice(1)
    .filter((segment) => segment.timelineStart > window.start && segment.timelineStart < window.end)
    .map((segment) => ({
      key: String(segment.mediaItemId),
      share: shareIn(window, segment.timelineStart),
    }));

const loudestIn = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  from: number,
  to: number,
): number => {
  let loudest = 0;

  for (const segment of segments) {
    const peaks = peaksByItem.get(segment.mediaItemId);
    const start = Math.max(from, segment.timelineStart);
    const end = Math.min(to, segment.timelineEnd);

    if (peaks !== undefined && end > start) {
      const sourceFrom = segment.sourceStart + (start - segment.timelineStart);
      const sourceTo = segment.sourceStart + (end - segment.timelineStart);
      const first = Math.floor(sourceFrom * peaks.peaksPerSecond);
      const last = Math.max(first + 1, Math.ceil(sourceTo * peaks.peaksPerSecond));

      for (const peak of peaks.peaks.slice(first, last)) {
        loudest = Math.max(loudest, peak);
      }
    }
  }

  return loudest;
};

export const windowBarsOf = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  window: TimelineRange,
  bucketCount: number,
): number[] => {
  const width = window.end - window.start;

  if (width <= 0 || bucketCount <= 0) {
    return [];
  }

  const bucketSeconds = width / bucketCount;
  const raw = Array.from({ length: bucketCount }, (_, bucket) =>
    loudestIn(
      segments,
      peaksByItem,
      window.start + bucket * bucketSeconds,
      window.start + (bucket + 1) * bucketSeconds,
    ),
  );
  const top = Math.max(...raw);

  return top <= 0 ? raw : raw.map((value) => value / top);
};

export const loopRangeOf = (span: StepSpan, marks: readonly CountMark[]): TimelineRange => {
  const before = marks.filter((mark) => mark.seconds < span.start - 1e-3);
  const preroll = before.at(-PREROLL_COUNTS)?.seconds;

  return {
    start: preroll ?? Math.max(0, span.start - FALLBACK_PREROLL_SECONDS),
    end: span.end,
  };
};
