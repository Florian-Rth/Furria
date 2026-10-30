import type { SpotPath, StagePoint } from '@/features/act-player/choreography-motion';
import { posesAt } from '@/features/act-player/choreography-motion';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import { viewPointOf } from '@/features/act-player/stage-view';
import { ownWayAt } from '@/features/act-practice/practice-way';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';
import { personNameOf } from './studio-g-copy';

export type EditDotKind = 'cast' | 'open';

export interface EditDot {
  spotId: number;
  number: number;
  kind: EditDotKind;
  person: string | null;
  selected: boolean;
  x: number;
  y: number;
}

export interface SharePoint {
  x: number;
  y: number;
}

export const shareOf = (
  point: StagePoint,
  stage: StudioStage,
  viewpoint: StageViewpoint,
): SharePoint => {
  const view = viewPointOf(point, stage, viewpoint);

  return { x: view.x / stage.widthMetres, y: view.y / stage.depthMetres };
};

export const editDotsAt = (
  paths: readonly SpotPath[],
  spots: readonly StudioSpot[],
  stage: StudioStage,
  viewpoint: StageViewpoint,
  selectedIds: readonly number[],
  seconds: number,
): EditDot[] =>
  posesAt(paths, seconds)
    .flatMap((pose) => {
      const spot = spots.find((candidate) => candidate.spotId === pose.spotId);

      return spot === undefined
        ? []
        : [
            {
              spotId: spot.spotId,
              number: spot.number,
              kind: spot.person === null ? ('open' as const) : ('cast' as const),
              person:
                spot.person === null
                  ? null
                  : personNameOf(spot.person.firstName, spot.person.lastName),
              selected: selectedIds.includes(spot.spotId),
              ...shareOf(pose.position, stage, viewpoint),
            },
          ];
    })
    .sort((left, right) => Number(left.selected) - Number(right.selected));

export interface StageTrail {
  spotId: number;
  points: SharePoint[];
}

export const selectedTrailsAt = (
  paths: readonly SpotPath[],
  marks: readonly CountMark[],
  stage: StudioStage,
  viewpoint: StageViewpoint,
  selectedIds: readonly number[],
  seconds: number,
): StageTrail[] =>
  paths
    .filter((path) => selectedIds.includes(path.spotId))
    .flatMap((path) => {
      const way = ownWayAt(path.keyframes, marks, seconds, null);

      return way.phase === 'still'
        ? []
        : [
            {
              spotId: path.spotId,
              points: way.route.map((point) => shareOf(point, stage, viewpoint)),
            },
          ];
    });
