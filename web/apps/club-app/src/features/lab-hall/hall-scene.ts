import type { SpotPath } from '@/features/act-player/choreography-motion';
import { posesAt } from '@/features/act-player/choreography-motion';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import { viewPointOf } from '@/features/act-player/stage-view';
import type { StudioSpot, StudioStage, StudioStep, StudioTraining } from '@/features/acts/schemas';

export type HallDotKind = 'present' | 'absent' | 'empty';
export type HallNameSide = 'below' | 'above' | 'none';

const NAME_SPAN_SHARE = 0.14;
const ROW_SPAN_SHARE = 0.08;

export interface HallDot {
  spotId: number;
  number: number;
  name: string | null;
  kind: HallDotKind;
  moving: boolean;
  x: number;
  y: number;
  nameSide: HallNameSide;
}

export interface HallScene {
  paths: readonly SpotPath[];
  spots: readonly StudioSpot[];
  stage: StudioStage;
  absentSpotIds: readonly number[];
  viewpoint: StageViewpoint;
}

export interface HallAbsence {
  spotId: number;
  number: number;
  name: string;
}

const kindOf = (spot: StudioSpot, absentSpotIds: readonly number[]): HallDotKind => {
  if (spot.person === null) {
    return 'empty';
  }

  return absentSpotIds.includes(spot.spotId) ? 'absent' : 'present';
};

type PlacedDot = Omit<HallDot, 'nameSide'>;

const crowds = (left: PlacedDot, right: PlacedDot): boolean =>
  Math.abs(left.x - right.x) < NAME_SPAN_SHARE && Math.abs(left.y - right.y) < ROW_SPAN_SHARE;

const sideFor = (dot: PlacedDot, named: readonly HallDot[]): HallNameSide => {
  if (dot.name === null) {
    return 'none';
  }

  const taken = (side: HallNameSide): boolean =>
    named.some((other) => other.nameSide === side && crowds(other, dot));

  if (!taken('below')) {
    return 'below';
  }

  return taken('above') ? 'none' : 'above';
};

export const withNameSides = (dots: readonly PlacedDot[]): HallDot[] => {
  const named: HallDot[] = [];

  for (const dot of [...dots].sort((left, right) => left.x - right.x)) {
    named.push({ ...dot, nameSide: sideFor(dot, named) });
  }

  return named;
};

const placedDotsAt = (scene: HallScene, seconds: number): PlacedDot[] =>
  posesAt(scene.paths, seconds).flatMap((pose) => {
    const spot = scene.spots.find((candidate) => candidate.spotId === pose.spotId);

    if (spot === undefined) {
      return [];
    }

    const view = viewPointOf(pose.position, scene.stage, scene.viewpoint);

    return [
      {
        spotId: spot.spotId,
        number: spot.number,
        name: spot.person?.firstName ?? null,
        kind: kindOf(spot, scene.absentSpotIds),
        moving: pose.moving,
        x: view.x / scene.stage.widthMetres,
        y: view.y / scene.stage.depthMetres,
      },
    ];
  });

export const hallDotsAt = (scene: HallScene, seconds: number): HallDot[] =>
  withNameSides(placedDotsAt(scene, seconds)).sort((left, right) => left.spotId - right.spotId);

export const hallTrainingOf = (
  trainings: readonly StudioTraining[],
  chosenId: number | undefined,
): StudioTraining | null =>
  trainings.find((training) => training.calendarEntryId === chosenId) ??
  [...trainings].sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))[0] ??
  null;

export const hallAbsencesOf = (
  spots: readonly StudioSpot[],
  training: StudioTraining | null,
): HallAbsence[] =>
  spots
    .flatMap((spot) =>
      spot.person !== null && training?.openSpotIds.includes(spot.spotId) === true
        ? [{ spotId: spot.spotId, number: spot.number, name: spot.person.firstName }]
        : [],
    )
    .sort((left, right) => left.number - right.number);

export const nextStepOf = (
  steps: readonly StudioStep[],
  stepId: number | null,
): StudioStep | null => {
  const index = steps.findIndex((step) => step.stepId === stepId);

  return index < 0 ? (steps[0] ?? null) : (steps[index + 1] ?? null);
};
