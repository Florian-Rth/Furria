import { useQueries } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/reads';
import type { MusicSegment } from './music-timeline';
import { requestAudioPeaks } from './requests';
import type { AudioPeaks } from './schemas';

export const useAudioPeaks = (
  segments: readonly MusicSegment[],
): ReadonlyMap<number, AudioPeaks> => {
  const audible = segments.filter((segment) => segment.audible);

  return useQueries({
    queries: audible.map((segment) => ({
      queryKey: queryKeys.audioPeaks(segment.mediaItemId),
      queryFn: () => requestAudioPeaks(segment.peaksUrl),
      staleTime: Number.POSITIVE_INFINITY,
    })),
    combine: (results) => {
      const peaksByItem = new Map<number, AudioPeaks>();
      results.forEach((result, index) => {
        const segment = audible[index];
        if (result.data !== undefined && segment !== undefined) {
          peaksByItem.set(segment.mediaItemId, result.data);
        }
      });
      return peaksByItem;
    },
  });
};
