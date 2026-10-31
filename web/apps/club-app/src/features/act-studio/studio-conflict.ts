import type { JsonBody } from '@furria/api-client';
import { musicSegmentsOf, timelineSecondsOf } from '@/features/act-player/music-timeline';
import type { Studio } from '@/features/acts/schemas';
import type { ChoreographyConflict } from './schemas';
import { ChoreographyConflictSchema } from './schemas';

export interface OverlapRow {
  spotId: number;
  spotNumber: number | null;
  seconds: readonly number[];
  unplaced: number;
}

export const choreographyConflictOf = (payload: JsonBody | null): ChoreographyConflict | null => {
  const parsed = ChoreographyConflictSchema.safeParse(payload);

  return parsed.success && parsed.data.overlaps.length > 0 ? parsed.data : null;
};

export const overlapRowsOf = (conflict: ChoreographyConflict, studio: Studio): OverlapRow[] => {
  const segments = musicSegmentsOf(studio);

  return conflict.overlaps
    .map((overlap) => {
      const placed = overlap.keyframes
        .map((keyframe) => timelineSecondsOf(segments, keyframe))
        .filter((seconds): seconds is number => seconds !== null)
        .sort((left, right) => left - right);

      return {
        spotId: overlap.spotId,
        spotNumber: studio.spots.find((spot) => spot.spotId === overlap.spotId)?.number ?? null,
        seconds: placed,
        unplaced: overlap.keyframes.length - placed.length,
      };
    })
    .sort(
      (left, right) =>
        (left.spotNumber ?? Number.MAX_SAFE_INTEGER) -
        (right.spotNumber ?? Number.MAX_SAFE_INTEGER),
    );
};
