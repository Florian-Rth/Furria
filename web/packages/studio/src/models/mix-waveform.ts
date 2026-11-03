import type { MusicSegment } from './music-timeline';
import type { AudioPeaks } from './studio-schemas';

const loudestBetween = (
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

      for (let index = first; index < last; index += 1) {
        loudest = Math.max(loudest, peaks.peaks[index] ?? 0);
      }
    }
  }

  return loudest;
};

const bucketsBetween = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  from: number,
  to: number,
  bucketCount: number,
): number[] => {
  const bucketSeconds = (to - from) / bucketCount;

  return Array.from({ length: bucketCount }, (_, bucket) => {
    const start = from + bucket * bucketSeconds;

    return loudestBetween(segments, peaksByItem, start, start + bucketSeconds);
  });
};

export const waveformOf = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  bucketCount: number,
): number[] => {
  const length = segments.at(-1)?.timelineEnd ?? 0;

  if (length <= 0 || bucketCount <= 0) {
    return [];
  }

  const raw = bucketsBetween(segments, peaksByItem, 0, length, bucketCount);
  const top = Math.max(...raw);

  return top <= 0 ? raw : raw.map((value) => value / top);
};

export const loudestPeakOf = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
): number => loudestBetween(segments, peaksByItem, 0, segments.at(-1)?.timelineEnd ?? 0);

export const waveformBetween = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  from: number,
  to: number,
  bucketCount: number,
  top: number,
): number[] => {
  if (to <= from || bucketCount <= 0) {
    return [];
  }

  const raw = bucketsBetween(segments, peaksByItem, from, to, bucketCount);

  return top <= 0 ? raw : raw.map((value) => Math.min(1, value / top));
};
