import type { StagePoint } from '@furria/studio/choreography-motion';
import type { ArrangeAxis, StageSize } from '@furria/studio/studio-formation';
import { alignedOf, distributedOf } from '@furria/studio/studio-formation';
import type { Keyframe } from '@furria/studio/studio-schemas';

export const rowPointsOf = (
  points: readonly StagePoint[],
  axis: ArrangeAxis,
  stage: StageSize,
): StagePoint[] => distributedOf(alignedOf(points, axis, stage), axis, stage);

export const SOFT_EASING: Keyframe['easing'] = 'easeInOut';

const samePoint = (left: StagePoint | null, right: StagePoint | null): boolean =>
  left === null || right === null
    ? left === right
    : left.rightMetres === right.rightMetres && left.backMetres === right.backMetres;

const sameWaypoint = (left: Keyframe, right: Keyframe): boolean =>
  left.sourceMediaItemId === right.sourceMediaItemId &&
  left.seconds === right.seconds &&
  left.facingDegrees === right.facingDegrees &&
  samePoint(left.position, right.position) &&
  samePoint(left.bend, right.bend);

export interface StoredTrack {
  spotId: number;
  keyframes: readonly Keyframe[];
}

export const softenedTracksOf = (
  stored: readonly StoredTrack[],
  tracks: Readonly<Record<number, readonly Keyframe[]>>,
): Record<number, readonly Keyframe[]> =>
  Object.fromEntries(
    Object.entries(tracks).map(([spotId, keyframes]) => {
      const before = stored.find((track) => track.spotId === Number(spotId))?.keyframes ?? [];

      return [
        spotId,
        keyframes.map((keyframe) =>
          before.some((kept) => sameWaypoint(kept, keyframe))
            ? keyframe
            : { ...keyframe, easing: SOFT_EASING },
        ),
      ];
    }),
  );
