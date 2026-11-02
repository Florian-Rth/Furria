import type { SpotPath } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import { viewPointOf } from '@/features/act-player/stage-view';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';

const SETTLE_SECONDS = 0.01;

export interface FormationDot {
  spotId: number;
  number: number;
  firstName: string | null;
  x: number;
  y: number;
  own: boolean;
  open: boolean;
}

const clampShare = (value: number): number => Math.min(1, Math.max(0, value));

export const formationAt = (
  paths: readonly SpotPath[],
  spots: readonly StudioSpot[],
  stage: StudioStage,
  seconds: number,
  ownSpotId: number | null,
): FormationDot[] =>
  spots.flatMap((spot) => {
    const path = paths.find((candidate) => candidate.spotId === spot.spotId);
    const pose = path === undefined ? null : poseAt(path, seconds + SETTLE_SECONDS);

    if (pose === null) {
      return [];
    }

    const point = viewPointOf(pose.position, stage, 'audience');

    return [
      {
        spotId: spot.spotId,
        number: spot.number,
        firstName: spot.person?.firstName ?? null,
        x: clampShare(point.x / stage.widthMetres),
        y: clampShare(point.y / stage.depthMetres),
        own: spot.spotId === ownSpotId,
        open: spot.person === null,
      },
    ];
  });
