import type {
  SpotPath,
  StagePoint,
  TimedKeyframe,
} from '@/features/act-player/choreography-motion';
import type { StudioSpot, StudioStep, StudioTraining } from '@/features/acts/schemas';

export interface TrainingGap {
  spotId: number;
  number: number;
  firstName: string;
  stepNumbers: number[];
}

interface Span {
  start: number;
  end: number;
}

const isSamePlace = (left: StagePoint, right: StagePoint): boolean =>
  left.rightMetres === right.rightMetres && left.backMetres === right.backMetres;

const movesOf = (keyframes: readonly TimedKeyframe[]): Span[] =>
  keyframes.slice(1).flatMap((to, index) => {
    const from = keyframes[index];

    return from === undefined || (to.bend === null && isSamePlace(from.position, to.position))
      ? []
      : [{ start: from.seconds, end: to.seconds }];
  });

const overlaps = (move: Span, step: StudioStep): boolean =>
  step.startSeconds !== null &&
  step.endSeconds !== null &&
  move.start < step.endSeconds &&
  move.end > step.startSeconds;

export const movingStepNumbersOf = (
  path: SpotPath | undefined,
  timedSteps: readonly StudioStep[],
): number[] => {
  const moves = path === undefined ? [] : movesOf(path.keyframes);

  return timedSteps.flatMap((step, index) =>
    moves.some((move) => overlaps(move, step)) ? [index + 1] : [],
  );
};

const isOpenAt = (spot: StudioSpot, training: StudioTraining | null): boolean =>
  training?.openSpotIds.includes(spot.spotId) === true;

export const trainingGapsOf = (
  training: StudioTraining | null,
  spots: readonly StudioSpot[],
  paths: readonly SpotPath[],
  timedSteps: readonly StudioStep[],
): TrainingGap[] =>
  spots.flatMap((spot) =>
    spot.person === null || !isOpenAt(spot, training)
      ? []
      : [
          {
            spotId: spot.spotId,
            number: spot.number,
            firstName: spot.person.firstName,
            stepNumbers: movingStepNumbersOf(
              paths.find((path) => path.spotId === spot.spotId),
              timedSteps,
            ),
          },
        ],
  );
