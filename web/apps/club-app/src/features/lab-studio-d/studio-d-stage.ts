import type { SpotPath, StagePoint } from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import { viewPointOf, viewRotationOf } from '@/features/act-player/stage-view';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';

const FULL_TURN_DEGREES = 360;
const PATH_SAMPLES = 24;

export type StudioDDotKind = 'own' | 'cast' | 'open';

export interface StudioDPlace {
  x: number;
  y: number;
}

export interface StudioDDot extends StudioDPlace {
  spotId: number;
  number: number;
  kind: StudioDDotKind;
  turn: number | null;
}

export const placeOf = (point: StagePoint, stage: StudioStage, mirrored: boolean): StudioDPlace => {
  const view = viewPointOf(point, stage, 'audience');
  const x = view.x / stage.widthMetres;

  return { x: mirrored ? 1 - x : x, y: view.y / stage.depthMetres };
};

export const turnOf = (facingDegrees: number | null, mirrored: boolean): number | null => {
  const rotation = viewRotationOf(facingDegrees, 'audience');

  if (rotation === null) {
    return null;
  }

  return mirrored ? (FULL_TURN_DEGREES - rotation) % FULL_TURN_DEGREES : rotation;
};

const dotKindOf = (spot: StudioSpot, ownSpotId: number | null): StudioDDotKind => {
  if (spot.spotId === ownSpotId) {
    return 'own';
  }

  return spot.person === null ? 'open' : 'cast';
};

const dotOrder: Record<StudioDDotKind, number> = { open: 0, cast: 1, own: 2 };

export interface StudioDStageScene {
  paths: readonly SpotPath[];
  spots: readonly StudioSpot[];
  ownSpotId: number | null;
  stage: StudioStage;
  mirrored: boolean;
}

export const dotsAt = (scene: StudioDStageScene, seconds: number): StudioDDot[] =>
  scene.spots
    .flatMap((spot) => {
      const path = scene.paths.find((candidate) => candidate.spotId === spot.spotId);
      const pose = path === undefined ? null : poseAt(path, seconds);

      if (pose === null) {
        return [];
      }

      return [
        {
          spotId: spot.spotId,
          number: spot.number,
          kind: dotKindOf(spot, scene.ownSpotId),
          turn: turnOf(pose.facingDegrees, scene.mirrored),
          ...placeOf(pose.position, scene.stage, scene.mirrored),
        },
      ];
    })
    .sort((left, right) => dotOrder[left.kind] - dotOrder[right.kind]);

const isSamePlace = (left: StudioDPlace, right: StudioDPlace): boolean =>
  left.x === right.x && left.y === right.y;

export const ownPathOf = (
  scene: StudioDStageScene,
  range: TimelineRange | null,
): StudioDPlace[] => {
  const path = scene.paths.find((candidate) => candidate.spotId === scene.ownSpotId);

  if (path === undefined || range === null || range.end <= range.start) {
    return [];
  }

  const places = Array.from({ length: PATH_SAMPLES + 1 }, (_, sample) =>
    poseAt(path, range.start + ((range.end - range.start) * sample) / PATH_SAMPLES),
  )
    .filter((pose) => pose !== null)
    .map((pose) => placeOf(pose.position, scene.stage, scene.mirrored));
  const first = places[0];

  return first !== undefined && places.every((place) => isSamePlace(place, first)) ? [] : places;
};
