import type { SpotPath, StagePoint } from '@/features/act-player/choreography-motion';
import { posesAt } from '@/features/act-player/choreography-motion';
import { viewPointOf, viewRotationOf } from '@/features/act-player/stage-view';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';

export type StageDotKind = 'own' | 'cast' | 'open';

export interface StageDot {
  spotId: number;
  number: number;
  kind: StageDotKind;
  x: number;
  y: number;
  turn: number | null;
}

export interface ViewShare {
  x: number;
  y: number;
}

export interface StageScene {
  paths: readonly SpotPath[];
  spots: readonly StudioSpot[];
  ownSpotId: number | null;
  stage: StudioStage;
}

const kindOf = (spot: StudioSpot, ownSpotId: number | null): StageDotKind => {
  if (spot.spotId === ownSpotId) {
    return 'own';
  }

  return spot.person === null ? 'open' : 'cast';
};

export const viewShareOf = (point: StagePoint, stage: StudioStage): ViewShare => {
  const view = viewPointOf(point, stage, 'dancers');

  return { x: view.x / stage.widthMetres, y: view.y / stage.depthMetres };
};

export const viewRouteOf = (route: readonly StagePoint[], stage: StudioStage): ViewShare[] =>
  route.map((point) => viewShareOf(point, stage));

const kindOrder: Record<StageDotKind, number> = { open: 0, cast: 1, own: 2 };

export const stageDotsAt = (scene: StageScene, seconds: number): StageDot[] =>
  posesAt(scene.paths, seconds)
    .flatMap((pose) => {
      const spot = scene.spots.find((candidate) => candidate.spotId === pose.spotId);

      if (spot === undefined) {
        return [];
      }

      const kind = kindOf(spot, scene.ownSpotId);
      const share = viewShareOf(pose.position, scene.stage);

      return [
        {
          spotId: spot.spotId,
          number: spot.number,
          kind,
          x: share.x,
          y: share.y,
          turn: kind === 'own' ? viewRotationOf(pose.facingDegrees, 'dancers') : null,
        },
      ];
    })
    .sort((left, right) => kindOrder[left.kind] - kindOrder[right.kind]);

export type CueSide = 'above' | 'below';

const NEAR_FRONT_SHARE = 0.2;
const LEVEL_TOLERANCE = 0.01;

export const cueSideOf = (own: ViewShare, route: readonly ViewShare[]): CueSide => {
  const target = route.at(-1);
  const rise = target === undefined ? 0 : own.y - target.y;

  if (rise > LEVEL_TOLERANCE) {
    return 'below';
  }

  if (rise < -LEVEL_TOLERANCE) {
    return 'above';
  }

  return own.y < NEAR_FRONT_SHARE ? 'below' : 'above';
};

export interface StageSummary {
  own: number | null;
  open: number[];
}

export const stageSummaryOf = (
  spots: readonly StudioSpot[],
  ownSpotId: number | null,
): StageSummary => ({
  own: spots.find((spot) => spot.spotId === ownSpotId)?.number ?? null,
  open: spots
    .filter((spot) => spot.person === null && spot.spotId !== ownSpotId)
    .map((spot) => spot.number)
    .sort((left, right) => left - right),
});
