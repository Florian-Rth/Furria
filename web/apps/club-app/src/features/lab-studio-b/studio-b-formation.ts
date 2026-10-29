import type { SpotPath } from '@/features/act-player/choreography-motion';
import { posesAt } from '@/features/act-player/choreography-motion';
import { viewPointOf, viewRotationOf } from '@/features/act-player/stage-view';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';

export type FormationRole = 'own' | 'open' | 'cast';

export interface FormationDot {
  spotId: number;
  number: number;
  x: number;
  y: number;
  facing: number | null;
  role: FormationRole;
}

const roleOf = (spot: StudioSpot, ownSpotId: number | null): FormationRole => {
  if (spot.spotId === ownSpotId) {
    return 'own';
  }

  return spot.person === null ? 'open' : 'cast';
};

const ROLE_ORDER: Record<FormationRole, number> = { cast: 0, open: 1, own: 2 };

export const formationAt = (
  paths: readonly SpotPath[],
  spots: readonly StudioSpot[],
  stage: StudioStage,
  ownSpotId: number | null,
  seconds: number,
): FormationDot[] => {
  const spotsById = new Map(spots.map((spot) => [spot.spotId, spot]));

  return posesAt(paths, seconds)
    .flatMap((pose) => {
      const spot = spotsById.get(pose.spotId);

      if (spot === undefined) {
        return [];
      }

      const point = viewPointOf(pose.position, stage, 'audience');

      return [
        {
          spotId: spot.spotId,
          number: spot.number,
          x: point.x / stage.widthMetres,
          y: point.y / stage.depthMetres,
          facing: viewRotationOf(pose.facingDegrees, 'audience'),
          role: roleOf(spot, ownSpotId),
        },
      ];
    })
    .sort((left, right) => ROLE_ORDER[left.role] - ROLE_ORDER[right.role]);
};
