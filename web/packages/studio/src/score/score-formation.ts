import type { SpotPath } from '@furria/studio/choreography-motion';
import { poseAt } from '@furria/studio/choreography-motion';
import type { StageEntrance } from '@furria/studio/Stage';
import { viewPointOf } from '@furria/studio/stage-view';
import type { StudioSpot, StudioStage } from '@furria/studio/studio-schemas';
import type { KkStageInkDiscKind } from '@furria/ui/KkStageInk';

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

export interface ScoreDot {
  id: number;
  x: number;
  y: number;
  own: boolean;
  open: boolean;
  number: number;
  caption: string | null;
  fromX?: number;
  fromY?: number;
}

export const scoreDotKindOf = (dot: ScoreDot): KkStageInkDiscKind => {
  if (dot.own) {
    return 'own';
  }

  return dot.open ? 'open' : 'cast';
};

export const entranceOf = (dot: ScoreDot, delay: number | null): StageEntrance | null =>
  delay === null || dot.fromX === undefined || dot.fromY === undefined
    ? null
    : { x: dot.fromX, y: dot.fromY, delay };

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
