import type { MusicSegment } from './music-timeline';
import type { AudioPeaks } from './schemas';

export const waveformOf = (
  segments: readonly MusicSegment[],
  peaksByItem: ReadonlyMap<number, AudioPeaks>,
  bucketCount: number,
): number[] => {
  const length = segments.at(-1)?.timelineEnd ?? 0;

  if (length <= 0 || bucketCount <= 0) {
    return [];
  }

  const bucketSeconds = length / bucketCount;
  const raw = Array.from({ length: bucketCount }, (_, bucket) => {
    const from = bucket * bucketSeconds;
    const to = from + bucketSeconds;
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
  });
  const top = Math.max(...raw);

  return top <= 0 ? raw : raw.map((value) => value / top);
};
