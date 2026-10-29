import type { KkStudioFDot, KkStudioFFront } from '@furria/ui/studio-f-types';
import type { SpotPose } from '@/features/act-player/choreography-motion';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import { viewPointOf, viewRotationOf } from '@/features/act-player/stage-view';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';

export const viewpointOf = (mirrored: boolean): StageViewpoint =>
  mirrored ? 'dancers' : 'audience';

export const frontOf = (viewpoint: StageViewpoint): KkStudioFFront =>
  viewpoint === 'dancers' ? 'top' : 'bottom';

const kindOf = (spot: StudioSpot, ownSpotId: number | null): KkStudioFDot['kind'] => {
  if (spot.spotId === ownSpotId) {
    return 'own';
  }

  return spot.person === null ? 'open' : 'cast';
};

const OWN_LAST = { own: 1, cast: 0, open: 0 } as const;

export const stageDotsOf = (
  poses: readonly SpotPose[],
  spots: readonly StudioSpot[],
  ownSpotId: number | null,
  stage: StudioStage,
  viewpoint: StageViewpoint,
): KkStudioFDot[] =>
  poses
    .flatMap((pose) => {
      const spot = spots.find((candidate) => candidate.spotId === pose.spotId);

      if (spot === undefined) {
        return [];
      }

      const point = viewPointOf(pose.position, stage, viewpoint);

      return [
        {
          id: `${spot.spotId}`,
          x: point.x,
          y: point.y,
          number: spot.number,
          kind: kindOf(spot, ownSpotId),
          rotation: viewRotationOf(pose.facingDegrees, viewpoint),
        },
      ];
    })
    .sort((left, right) => OWN_LAST[left.kind] - OWN_LAST[right.kind]);
